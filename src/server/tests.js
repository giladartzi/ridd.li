import { createGame, advanceGame, addMove } from './gameUtils';
import first from 'lodash/first';
import without from 'lodash/without';
import sample from 'lodash/sample';

async function addMoveForGame(game, userId, correct) {
    let questionIndex = game.currentQuestion;
    let correctAnswer = first(game.questions[questionIndex].answers.filter(answer => answer.isCorrect));
    let correctAnswerIndex = game.questions[questionIndex].answers.indexOf(correctAnswer);
    let answerIndex = correctAnswerIndex;

    if (!correct) {
        answerIndex = sample(without([0, 1, 2, 3], correctAnswerIndex));
    }

    return await addMove(game, userId, questionIndex, answerIndex);
}

async function test() {
    let game;

    let gameId = await createGame([1, 2]);
    console.log(gameId);

    game = await advanceGame(gameId);
    console.log(game);
    game = await addMoveForGame(game, 1, true);
    console.log(game);
    game = await addMoveForGame(game, 2, false);
    console.log(game);

    game = await advanceGame(gameId);
    console.log(game);
    game = await addMoveForGame(game, 1, false);
    console.log(game);
    game = await addMoveForGame(game, 2, true);
    console.log(game);

    game = await advanceGame(gameId);
    console.log(game);
    game = await addMoveForGame(game, 1, false);
    console.log(game);
    game = await addMoveForGame(game, 2, true);
    console.log(game);

    game = await advanceGame(gameId);
    console.log(game);

    process.exit(0);
}

test();