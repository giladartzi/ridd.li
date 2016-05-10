import { find, insert, findById, findOneAndReplace } from './dataLayer';
import shuffle from 'lodash/shuffle';
import first from 'lodash/first';
import uniq from 'lodash/uniq';
import cloneDeep from 'lodash/cloneDeep';

export async function getRandomizeQuestions() {
    var questions = await find('questions', { excludeId: true });
    
    questions = questions.map(question => {
        question.answers = shuffle(question.answers);
        return question;
    });
    
    return shuffle(questions);
}

export async function createGame(userIds) {
    let existing = await isExistingGame(userIds);
    
    if (existing) {
        throw new Error('At least one of the users is busy');
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
        game.gameMetaData.forEach(gmd => {
            gmd.progress.push({
                questionIndex: game.currentQuestion,
                questionTiming: Date.now()
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

    var gmd = first(game.gameMetaData.filter(gmd => gmd.userId === +userId));
    var question = game.questions[questionIndex];

    if (!gmd.progress[questionIndex]) {
        throw new Error('Invalid question index!');
    }

    if (gmd.progress[questionIndex].isAnswered) {
        throw new Error('Question is already answered!');
    }

    gmd.progress[questionIndex].answerTiming = Date.now();
    gmd.progress[questionIndex].answerIndex = answerIndex;
    gmd.progress[questionIndex].isCorrect = question.answers[answerIndex].isCorrect;
    gmd.progress[questionIndex].isAnswered = true;

    return await findOneAndReplace('games', game._id, game);    
}

export async function getGameByUserId(userId) {
    return await find('games', { query: { 'gameMetaData.userId': +userId, state: 'ACTIVE' } });
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
    result.answers = result.answers.map(answer => answer.text);
    return result;
}