import { post, verifyBatch, assertEqual, get } from './testUtils';

export default async function invitationTests(tokens, userIds) {
    let res;

    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Invitation not found', 'wrong error message!')
    ]);
    
    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(Array.isArray(res.json.userIds), true, 'userIds is not an array!'),
        assertEqual(res.json.userIds.length, 2, 'length of userIds is not exactly 2!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation - user is busy', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Opponent is not available', 'wrong error message!')
    ]);
    
    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - user 1', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(Array.isArray(res.json.userIds), true, 'userIds is not an array!'),
        assertEqual(res.json.userIds.length, 2, 'length of userIds is not exactly 2!'),
        assertEqual(res.json.userIds[0], userIds[0], 'incorrect userId!'),
        assertEqual(res.json.userIds[1], userIds[1], 'incorrect userId!')
    ]);

    res = await get('/invitation', tokens[1]);
    verifyBatch('Get invitation - user 2', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(Array.isArray(res.json.userIds), true, 'userIds is not an array!'),
        assertEqual(res.json.userIds.length, 2, 'length of userIds is not exactly 2!'),
        assertEqual(res.json.userIds[0], userIds[0], 'incorrect userId!'),
        assertEqual(res.json.userIds[1], userIds[1], 'incorrect userId!')
    ]);
}