import { verifyBatch, assertEqual } from './testUtils';
import { post } from '../../common/rest';

export default async function loungeTests(tokens, userIds) {
    let res; 
    
    res = await post('/lounge/enter', {}, tokens[0]);
    verifyBatch('Lounge - enter (user 1)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json.users), true, 'res.json is not an array!'),
        assertEqual(res.json.users.length, 0, 'res.json is not in length of 0!')
    ]);

    res = await post('/lounge/enter', {}, tokens[1]);
    verifyBatch('Lounge - enter (user 2)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json.users), true, 'res.json is not an array!'),
        assertEqual(res.json.users.length, 1, 'res.json is not in length of 1!'),
        assertEqual(res.json.users[0].id, userIds[0], 'wrong userId!'),
        assertEqual(res.json.users[0].username, 'gilad', 'wrong username!')
    ]);

    res = await post('/lounge/availableUsers', {}, tokens[0]);
    verifyBatch('Lounge - Get available users', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json.users), true, 'res.json is not an array!'),
        assertEqual(res.json.users.length, 1, 'res.json is not in length of 1!'),
        assertEqual(res.json.users[0].id, userIds[1], 'wrong userId!'),
        assertEqual(res.json.users[0].username, 'gilad2', 'wrong username!')
    ]);
}