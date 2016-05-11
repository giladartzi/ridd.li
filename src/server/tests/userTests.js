import { post, assertEqual, verifyBatch } from './testUtils';

export default async function userTests() {
    let res, userId1, userId2, token1, token2;

    res = await post('/authenticate', { username: 'gilad', password: '12345' });
    verifyBatch('Authentication - non-existing username', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Invalid credentials', 'wrong error message!')
    ]);

    res = await post('/register', { username: 'gilad', password: '12345' });
    verifyBatch('Register - correct process', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'error is not a string!'),
        assertEqual(typeof res.json.username, 'string', 'username is not a string!'),
        assertEqual(res.json.username, 'gilad', 'username is gilad!'),
        assertEqual(typeof res.json.token, 'string', 'token is not a string!')
    ]);

    res = await post('/register', { username: 'gilad', password: '12345' });
    verifyBatch('Register - duplication username', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Username is taken', 'wrong error message!')
    ]);

    res = await post('/authenticate', { username: 'gilad', password: '123456' });
    verifyBatch('Authentication - wrong password', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Invalid credentials', 'wrong error message!')
    ]);

    res = await post('/authenticate', { username: 'gilad', password: '12345' });
    verifyBatch('Authentication - correct process', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'error is not a string!'),
        assertEqual(typeof res.json.username, 'string', 'username is not a string!'),
        assertEqual(res.json.username, 'gilad', 'username is gilad!'),
        assertEqual(typeof res.json.token, 'string', 'token is not a string!')
    ]);

    userId1 = res.json.id;
    token1 = res.json.token;

    res = await post('/register', { username: 'gilad2', password: '12345678' });
    verifyBatch('Register - correct process', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'error is not a string!'),
        assertEqual(typeof res.json.username, 'string', 'username is not a string!'),
        assertEqual(res.json.username, 'gilad2', 'username is gilad2!'),
        assertEqual(typeof res.json.token, 'string', 'token is not a string!')
    ]);

    userId2 = res.json.id;
    token2 = res.json.token;

    return {
        userIds: [userId1, userId2],
        tokens: [token1, token2]
    };
}