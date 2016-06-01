import { verifyBatch, assertEqual, wait } from './testUtils';
import { post } from '../../common/rest';
import { WS_USER_ENTERED_LOUNGE } from '../../common/consts';

export default async function loungeTests(tokens, userIds, wss) {
    let res; 
    
    res = await post('/lounge/enter', {}, tokens[0]);
    verifyBatch('Lounge - enter (user 1)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json.users), true, 'res.json is not an array!'),
        assertEqual(res.json.users.length, 0, 'res.json.users is not in length of 0!'),
        assertEqual(res.json.error, undefined, 'res.error!')
    ]);

    await wait(0.5);
    res = wss[1].messages.pop();
    verifyBatch('Lounge - available users by push (user 2)', [
        assertEqual(res.type, WS_USER_ENTERED_LOUNGE, 'incorrect type!'),
        assertEqual(res.payload.id, userIds[0], 'wrong userId!'),
        assertEqual(res.payload.firstName, 'Gilad', 'wrong firstName!'),
        assertEqual(res.payload.lastName, 'Artzi', 'wrong lastName!')
    ]);

    res = await post('/lounge/enter', {}, tokens[1]);
    verifyBatch('Lounge - enter (user 2)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json.users), true, 'res.json is not an array!'),
        assertEqual(res.json.users.length, 1, 'res.json is not in length of 1!'),
        assertEqual(res.json.users[0].id, userIds[0], 'wrong userId!'),
        assertEqual(res.json.users[0].firstName, 'Gilad', 'wrong firstName!'),
        assertEqual(res.json.users[0].lastName, 'Artzi', 'wrong lastName!')
    ]);

    await wait(0.5);
    res = wss[0].messages.pop();
    verifyBatch('Lounge - available users by push (user 1)', [
        assertEqual(res.type, WS_USER_ENTERED_LOUNGE, 'incorrect type!'),
        assertEqual(res.payload.id, userIds[1], 'wrong userId!'),
        assertEqual(res.payload.firstName, 'Gilad2', 'wrong firstName!'),
        assertEqual(res.payload.lastName, 'Artzi', 'wrong lastName!')
    ]);

    res = await post('/lounge/availableUsers', {}, tokens[0]);
    verifyBatch('Lounge - Get available users', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json.users), true, 'res.json is not an array!'),
        assertEqual(res.json.users.length, 1, 'res.json is not in length of 1!'),
        assertEqual(res.json.users[0].id, userIds[1], 'wrong userId!'),
        assertEqual(res.json.users[0].firstName, 'Gilad2', 'wrong firstName!'),
        assertEqual(res.json.users[0].lastName, 'Artzi', 'wrong lastName!')
    ]);
}