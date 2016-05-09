import * as gameUtils from '../gameUtils';
import first from 'lodash/first';

let gameJson = async (game, userId) => {
    let question = await gameUtils.getCurrentQuestion(game);

    if (question) {
        question = gameUtils.sanitizeQuestion(question);
    }

    let gmd = first(game.gameMetaData.filter(gmd => gmd.userId === +userId));
    let userIndex = game.gameMetaData.indexOf(gmd);

    return {
        gameId: game._id,
        progress: game.gameMetaData[userIndex].progress,
        question: question,
        state: game.state
    };
};

export async function createGame(userIds) {
    let game = await gameUtils.createGame(userIds);
    return await gameJson(game, userIds[0]);
}

export async function game(userId) {
    let game = await gameUtils.getGameByUserId(userId);
    
    if (game) {
        return await gameJson(game, userId);
    }
    else {
        throw new Error('Game not found');
    }
}

export async function answer(gameId, userId, questionIndex, answerIndex) {
    let game = await gameUtils.addMove(gameId, userId, questionIndex, answerIndex);
    game = await gameUtils.advanceGame(game);
    return await gameJson(game, userId);
}