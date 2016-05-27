import { verifyBatch, assertEqual, wait } from './testUtils';
import { post, get } from '../../common/rest';
import { GAME_NOT_FOUND } from '../../common/errors';
import { WS_GAME_STATE_CHANGE } from '../../common/consts';

export default async function leaveGameTests(tokens, userIds, wss, gameId) {
    let res;
    
    res = await get('/getGame', tokens[0]);
    verifyBatch('Get game - user 1', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.gameId, gameId, 'wrong gameId!')
    ]);
    
    res = await get('/getGame', tokens[1]);
    verifyBatch('Get game - user 2', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.gameId, gameId, 'wrong gameId!')
    ]);
    
    res = await post('/game/leave', {}, tokens[0]);
    verifyBatch('Leave game - user 1', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.gameId, gameId, 'wrong gameId!'),
        assertEqual(res.json.state, 'INACTIVE', 'wrong state!')
    ]);

    await wait(0.2);
    res = wss[1].messages.pop();
    verifyBatch('Leave game - WS - user 2', [
        assertEqual(res.type, WS_GAME_STATE_CHANGE, 'wrong WS type!'),
        assertEqual(res.payload.gameId, gameId, 'wrong gameId!'),
        assertEqual(res.payload.state, 'INACTIVE', 'wrong state!'),
        assertEqual(res.payload.endedBy.userId, userIds[0], 'wrong endedBy.userId!'),
        assertEqual(res.payload.endedBy.username, 'gilad', 'wrong endedBy.username!')
    ]);
    
    res = await get('/getGame', tokens[0]);
    verifyBatch('Get game - user 1', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, GAME_NOT_FOUND, 'wrong error!')
    ]);
    
    res = await get('/getGame', tokens[1]);
    verifyBatch('Get game - user 2', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, GAME_NOT_FOUND, 'wrong error!')
    ]);
} 