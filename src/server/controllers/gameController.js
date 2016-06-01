import * as gameUtils from '../utils/gameUtils';
import { wsSend } from '../wsManager';
import { WS_ADVANCE_GAME, WS_GAME_STATE_CHANGE } from '../../common/consts';
import { GAME_NOT_FOUND } from '../../common/errors';

export async function createGame(userIds) {
    return await gameUtils.createGame(userIds);
}

export async function game(userId) {
    // Get game by user ID, if exists
    let game = await gameUtils.getGameByUserId(userId);
    
    if (game) {
        return await gameUtils.gameJson(game, userId);
    }
    else {
        throw new Error(GAME_NOT_FOUND);
    }
}

export async function answer(gameId, userId, questionIndex, answerIndex) {
    // First, add the answer to the game records
    let game = await gameUtils.addMove(gameId, userId, questionIndex, answerIndex);
    
    // Then, progress game, if both users answered
    game = await gameUtils.advanceGame(game);

    // Inform opponent of current player's progress
    let otherUserId = gameUtils.otherUserId(game, userId);
    wsSend(otherUserId, {
        type: WS_ADVANCE_GAME,
        payload: await gameUtils.gameJson(game, otherUserId)
    });
    
    return await gameUtils.gameJson(game, userId);
}

export async function leave(userId) {
    let game = await gameUtils.getGameByUserId(userId);

    if (!game) {
        throw new Error(GAME_NOT_FOUND);
    }

    // Leave game and in fact end it
    game = await gameUtils.leaveGame(game, userId);

    // Inform opponent
    let otherUserId = gameUtils.otherUserId(game, userId);
    wsSend(otherUserId, {
        type: WS_GAME_STATE_CHANGE,
        payload: await gameUtils.gameJson(game, otherUserId)
    });

    return await gameUtils.gameJson(game, userId);
}