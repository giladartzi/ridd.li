import { find, insert, findById, findOneAndReplace, findOneAndUpdate, update, objectId } from '../dataLayer';
import shuffle from 'lodash/shuffle';
import first from 'lodash/first';
import uniq from 'lodash/uniq';
import cloneDeep from 'lodash/cloneDeep';
import mongodb from 'mongodb';
import * as errors from '../../common/errors';
import { QUESTION_TIMEOUT } from '../../common/consts';

export async function getRandomizeQuestions() {
    var questions = await find('questions', { excludeId: true });
    
    questions = questions.map(question => {
        question.answers = shuffle(question.answers);
        return question;
    });
    
    return shuffle(questions).slice(0, 10);
}

export async function createGame(userIds) {
    let existing = await isExistingGame(userIds);
    
    if (existing) {
        throw new Error(errors.AT_LEAST_ONE_OF_THE_USERS_IS_BUSY);
    }

    let isValid = await validateUserIds(userIds);

    if (!isValid) {
        throw new Error(errors.ONE_OR_MORE_INVALID_USER_IDS);
    }
    
    let questions = await getRandomizeQuestions();

    let game = {
        questions,
        state: 'PRE_ACTIVE',
        currentQuestion: -1,
        gameMetaData: {}
    };

    game.gameMetaData = userIds.map(userId => {
        return {
            userId: userId,
            progress: []
        }
    });

    game = await insert('games', game);

    return await advanceGame(game);
}

export async function getCurrentQuestion(game) {
    if (typeof game === 'string') {
        game = await findById('games', game);
    }
    
    return game.questions[game.currentQuestion] || null;
}

export async function advanceGame(game) {
    if (typeof game === 'string') {
        game = await findById('games', game);
    }

    let isSingleLength = uniq(game.gameMetaData.map(gmd => {
        return gmd.progress.filter(p => p.isAnswered).length
    })).length === 1;
    
    if (!isSingleLength) {
        return game;
    }

    game.currentQuestion += 1;
    let question = await getCurrentQuestion(game);
    
    if (question) {
        game.state = 'ACTIVE';
        game.gameMetaData.forEach((gmd, userIndex) => {
            gmd.progress.push({
                questionIndex: game.currentQuestion,
                questionTiming: Date.now(),
                userIndex
            });
        });
    }
    else {
        game.state = 'INACTIVE';
    }

    return await findOneAndReplace('games', game._id, game);
}

export async function addMove(game, userId, questionIndex, answerIndex) {
    if (typeof game === 'string') {
        game = await findById('games', game);
    }

    var gmd = first(game.gameMetaData.filter(gmd => gmd.userId === userId));
    var question = game.questions[questionIndex];

    var move = gmd.progress[questionIndex];

    if (!move) {
        throw new Error(errors.INVALID_QUESTION_INDEX);
    }

    if (move.isAnswered) {
        throw new Error(errors.QUESTION_IS_ALREADY_ANSWERED);
    }

    var now = Date.now();
    var isTimedOut = ((now - move.questionTiming) / 1000) > QUESTION_TIMEOUT;

    move.answerTiming = now;
    move.answerIndex = answerIndex;
    move.isCorrect = question.answers[answerIndex].isCorrect;
    move.isAnswered = true;
    move.isTimedOut = isTimedOut;

    return await findOneAndReplace('games', game._id, game);    
}

export async function getGameByUserId(userId) {
    return await find('games', { query: { 'gameMetaData.userId': userId, state: 'ACTIVE' } });
}

async function isExistingGame(userIds) {
    let i;

    for (i = 0; i < userIds.length; i++) {
        let boolean = !!(await getGameByUserId(userIds[i]));
        if (boolean) {
            return true;
        }
    }

    return false;
}

export function sanitizeQuestion(question) {
    var result = cloneDeep(question);

    if (process.env.NODE_ENV === 'production') {
        result.answers.forEach(answer => {
            delete answer.isCorrect;
        });
    }

    return result;
}

export async function validateUserIds(userIds) {
    let objectIds = userIds.map(userId => new mongodb.ObjectID(userId));
    var users = await find('users', { query: { _id: { $in: objectIds } } });
    
    return users.length === userIds.length;
}

export function otherUserId(game, userId) {
    let result = game.gameMetaData[0].userId;
    
    if (result === userId) {
        result = game.gameMetaData[1].userId;
    }
    
    return result;
}

export function getOpponentProgress(game, userId) {
    let opponentIndex = (userId - 1) * -1;

    return game.gameMetaData[opponentIndex].progress.map(move => {
        return {
            questionIndex: move.questionIndex,
            isAnswered: move.isAnswered,
            isCorrect: move.isCorrect,
            isTimedOut: move.isTimedOut,
            userIndex: opponentIndex
        }
    });
}

export async function gameJson(game, userId) {
    let question = await getCurrentQuestion(game);

    if (question) {
        question = sanitizeQuestion(question);
    }

    let gmd = first(game.gameMetaData.filter(gmd => gmd.userId === userId));
    let userIndex = game.gameMetaData.indexOf(gmd);

    return {
        gameId: game._id,
        progress: game.gameMetaData[userIndex].progress,
        opponentProgress: getOpponentProgress(game, userIndex),
        question: question,
        state: game.state,
        questionIndex: game.currentQuestion
    };
}

export async function leaveGame(game) {
    let usersIds = game.gameMetaData.map(gmd => objectId(gmd.userId));
    await update('users', { '_id': { $in: usersIds } }, { $set: { state: 'AVAILABLE' } });
    return await findOneAndUpdate('games', game._id, { $set: { state: 'INACTIVE' } });
}