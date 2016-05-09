import { find, insert, findById, findOneAndReplace } from './dataLayer';
import shuffle from 'lodash/shuffle';
import first from 'lodash/first';

export async function getRandomizeQuestions() {
    var questions = await find('questions', { excludeId: true });
    
    questions = questions.map(question => {
        question.answers = shuffle(question.answers);
        return question;
    });
    
    return shuffle(questions);
}

export async function createGame(userIds) {
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

    let result = await insert('games', game);

    return result._id;
}

export async function getCurrentQuestion(game) {
    if (typeof game === 'string') {
        game = await findById('games', gameId);
    }
    
    return game.questions[game.currentQuestion] || null;
}

export async function advanceGame(gameId) {
    let game = await findById('games', gameId);
    
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

    return await findOneAndReplace('games', gameId, game);
}

export async function addMove(game, userId, questionIndex, answerIndex) {
    if (typeof game === 'string') {
        game = await findById('games', game);
    }

    var gmd = first(game.gameMetaData.filter(gmd => gmd.userId === userId));
    var question = game.questions[questionIndex];

    gmd.progress[questionIndex].answerTiming = Date.now();
    gmd.progress[questionIndex].answerIndex = answerIndex;
    gmd.progress[questionIndex].isCorrect = question.answers[answerIndex].isCorrect;

    return await findOneAndReplace('games', game._id, game);    
}