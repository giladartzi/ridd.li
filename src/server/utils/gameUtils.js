import { find, insert, findById, findOneAndReplace, findOneAndUpdate, update, objectId } from '../dataLayer';
import shuffle from 'lodash/shuffle';
import first from 'lodash/first';
import uniq from 'lodash/uniq';
import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import mongodb from 'mongodb';
import * as errors from '../../common/errors';
import { QUESTION_TIMEOUT } from '../../common/consts';
import { getDisplayNameByUserId } from '../utils/userUtils';
import { ACTIVE, INACTIVE, AVAILABLE, NUM_OF_QUESTIONS } from '../../common/consts';

export async function getRandomizeQuestions() {
    var questions = await find('questions', { excludeId: true });
    
    // Randomize answers order
    questions = questions.map(question => {
        question.answers = shuffle(question.answers);
        return question;
    });
    
    // Randomize questions order, and picking just the right amount.
    return shuffle(questions).slice(0, NUM_OF_QUESTIONS);
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

    // Creating the game object, in its basic initial form
    let game = {
        questions,
        state: 'PRE_ACTIVE',
        currentQuestion: -1,
        gameMetaData: {},
        endedBy: null
    };

    // Game meta data actually describes the entire game -
    // Which questions are already answered, which ones are correct, etc
    game.gameMetaData = userIds.map(userId => {
        return {
            userId: userId,
            progress: []
        }
    });

    game = await insert('games', game);

    // Calling advanceGame here will make the game
    // change from the initial form to an active game
    return await advanceGame(game);
}

export async function getCurrentQuestion(game) {
    if (typeof game === 'string') {
        // Sometime the game object is not available when
        // calling this function, gameId is supplied instead,
        // in these cases, for convenience reasons, simply
        // querying the DB for the game.
        game = await findById('games', game);
    }
    
    return game.questions[game.currentQuestion] || null;
}

export async function advanceGame(game) {
    if (typeof game === 'string') {
        // See comment in getCurrentQuestion method
        game = await findById('games', game);
    }

    // Checking if game progress is "single length" this means
    // that all the players have finished the current stage. We
    // do it by simply counting how many questions each player
    // already answered. If this number is equal for all the 
    // players, we can progress to the next stage.
    let isSingleLength = uniq(game.gameMetaData.map(gmd => {
        return gmd.progress.filter(p => p.isAnswered).length
    })).length === 1;
    
    // In case on of the players is behind, we actually do
    // not do anything in this stage.
    if (!isSingleLength) {
        return game;
    }

    // Progressing game. Updating current questions's data and index.
    game.currentQuestion += 1;
    let question = await getCurrentQuestion(game);
    
    if (question) {
        // If a new question is available, it means the game
        // is still active. Adding a gameMetaData (GMD) object
        // to all the players. This is the initial form for the
        // GMD object, which holds a reference to the question,
        // the user and a timestamp that represents the first
        // point in time when the user saw the question.
        game.state = ACTIVE;
        game.gameMetaData.forEach((gmd, userIndex) => {
            gmd.progress.push({
                questionIndex: game.currentQuestion,
                questionTiming: Date.now(),
                userIndex
            });
        });
    }
    else {
        // If question is not available, it means the
        // game has ended, marking it as inactive.
        game.state = INACTIVE;
    }

    // Updating DB
    return await findOneAndReplace('games', game._id, game);
}

export async function addMove(game, userId, questionIndex, answerIndex) {
    if (typeof game === 'string') {
        // Querying for game object if a gameId was supplied
        // instead of a game object. It's a bit more convenient this way.
        game = await findById('games', game);
    }

    // Fetching the current question and the GMD (gameMetaData) object
    // for the relevant user (the one which added the move)
    var gmd = first(game.gameMetaData.filter(gmd => gmd.userId === userId));
    var question = game.questions[questionIndex];

    var move = gmd.progress[questionIndex];

    if (!move) {
        throw new Error(errors.INVALID_QUESTION_INDEX);
    }

    if (move.isAnswered) {
        throw new Error(errors.QUESTION_IS_ALREADY_ANSWERED);
    }

    // Calculating the difference between the time the question
    // was first revealed to the user, and the time the user
    // actually answered.
    var now = Date.now();
    var isTimedOut = ((now - move.questionTiming) / 1000) > QUESTION_TIMEOUT;

    // Updating the GMD object to its final form with all
    // the available data.
    move.answerTiming = now;
    move.answerIndex = answerIndex;
    move.isCorrect = question.answers[answerIndex].isCorrect;
    move.isAnswered = true;
    move.isTimedOut = isTimedOut;

    return await findOneAndReplace('games', game._id, game);    
}

export async function getGameByUserId(userId) {
    return await find('games', { query: { 'gameMetaData.userId': userId, state: ACTIVE } });
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

    // Sanitizing question and removing the isCorrect field in
    // order to prevent cheating. We actually do it only in production,
    // because in the test environment, the automatic tests have
    // assertions based on this data.
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
    // Creating the standard JSON object for more or less
    // every REST API call the relates to the game. In this
    // manner we know that UI will be synchronized all the time.
    
    let question = await getCurrentQuestion(game);

    if (question) {
        question = sanitizeQuestion(question);
    }

    let gmd = first(game.gameMetaData.filter(gmd => gmd.userId === userId));
    let userIndex = game.gameMetaData.indexOf(gmd);
    let winner = { userId: null, displayName: null };

    if (game.state === INACTIVE) {
        // Calculate the score and determine who is the winner,
        // in case that game has ended (inactive state).
        let winnerId = calcWinner(game);
        winner.userId = winnerId;
        winner.displayName = await getDisplayNameByUserId(winnerId);
    }
    
    // In addition for updating the user in its progress,
    // adding its opponent's progress too.
    return {
        gameId: game._id,
        progress: game.gameMetaData[userIndex].progress,
        opponentProgress: getOpponentProgress(game, userIndex),
        question: question,
        state: game.state,
        questionIndex: game.currentQuestion,
        endedBy: {
            userId: game.endedBy,
            displayName: await getDisplayNameByUserId(game.endedBy)
        },
        winner: winner
    };
}

export async function leaveGame(game, userId) {
    let usersIds = game.gameMetaData.map(gmd => objectId(gmd.userId));
    await update('users', { '_id': { $in: usersIds } }, { $set: { state: AVAILABLE } });
    return await findOneAndUpdate('games', game._id, { $set: { state: INACTIVE, endedBy: userId } });
}

export function calcWinner(game) {
    let gmds = game.gameMetaData.map(gmd => {
        return  { userId: gmd.userId, score: calcScore(gmd.progress) };
    });

    return first(sortBy(gmds, gmd => gmd.score * -1)).userId;
}

function calcScore(progress) {
    return progress.reduce((score, move) => {
        if (!move.isAnswered || move.isTimedOut) {
            // If user did not answer or question was timed out, nothing happens
            return score;
        }
        else if (move.isCorrect) {
            // Correct answer gives the user one point
            return score + 1;
        }
        else {
            // Incorrect answer subtracts a point.
            return score - 1;
        }
    }, 0);
}