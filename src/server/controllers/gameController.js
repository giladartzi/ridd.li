import * as gameUtils from '../utils/gameUtils';
import first from 'lodash/first';
import { wsSend } from '../wsManager';
import { WS_ADVANCE_GAME } from '../../common/consts';
import { GAME_NOT_FOUND } from '../../common/errors';

export async function gameJson(game, userId) {
    let question = await gameUtils.getCurrentQuestion(game);

    if (question) {
        question = gameUtils.sanitizeQuestion(question);
    }

    let gmd = first(game.gameMetaData.filter(gmd => gmd.userId === userId));
    let userIndex = game.gameMetaData.indexOf(gmd);

    return {
        gameId: game._id,
        progress: game.gameMetaData[userIndex].progress,
        question: question,
        state: game.state,
        questionIndex: game.currentQuestion
    };
}

export async function createGame(userIds) {
    return await gameUtils.createGame(userIds);
}

export async function game(userId) {
    let game = await gameUtils.getGameByUserId(userId);
    
    if (game) {
        return await gameJson(game, userId);
    }
    else {
        throw new Error(GAME_NOT_FOUND);
    }
}

export async function answer(gameId, userId, questionIndex, answerIndex) {
    let game = await gameUtils.addMove(gameId, userId, questionIndex, answerIndex);
    game = await gameUtils.advanceGame(game);

    let otherUserId = gameUtils.otherUserId(game, userId);

    wsSend(otherUserId, {
        type: WS_ADVANCE_GAME,
        payload: await gameJson(game, otherUserId)
    });

    return await gameJson(game, userId);
}