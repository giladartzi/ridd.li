import { assertEqual, verifyBatch, wait } from './testUtils';
import { post } from '../../common/rest';
import wsConnect from './ws'
import * as errors from '../../common/errors';

export default async function userTests() {
    let res, userId1, userId2, token1, token2, ws1, ws2;

    res = await post('/login', { username: 'gilad', password: '12345' });
    verifyBatch('Log in - non-existing username', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.INVALID_CREDENTIALS, 'wrong error message!')
    ]);

    res = await post('/signup', { username: '', password: '' });
    verifyBatch('Sign Up - no username or password', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.PLEASE_FILL_ALL_REQUESTED_FIELDS, 'wrong error message!')
    ]);

    res = await post('/signup', { username: 'gilad', password: '12345', email: 'gilad' });
    verifyBatch('Sign Up - Invalid email', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.INVALID_EMAIL_ADDRESS, 'wrong error message!')
    ]);

    res = await post('/signup', { username: 'gilad', password: '12345', email: 'gilad@1.com' });
    verifyBatch('Sign Up - correct process', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'error is not a string!'),
        assertEqual(typeof res.json.username, 'string', 'username is not a string!'),
        assertEqual(res.json.username, 'gilad', 'username is gilad!'),
        assertEqual(typeof res.json.token, 'string', 'token is not a string!')
    ]);

    res = await post('/signup', { username: 'gilad', password: '12345', email: 'gilad@2.com' });
    verifyBatch('Sign Up - duplication username', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.USERNAME_IS_TAKEN_OR_EMAIL_ADDRESS_IN_USE, 'wrong error message!')
    ]);

    res = await post('/signup', { username: 'gilad777', password: '12345', email: 'gilad@1.com' });
    verifyBatch('Sign Up - duplication email', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.USERNAME_IS_TAKEN_OR_EMAIL_ADDRESS_IN_USE, 'wrong error message!')
    ]);

    res = await post('/login', { username: 'gilad', password: '123456' });
    verifyBatch('Log in - wrong password', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.INVALID_CREDENTIALS, 'wrong error message!')
    ]);

    res = await post('/login', { username: 'gilad', password: '' });
    verifyBatch('Log in - wrong password', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.PLEASE_ENTER_YOUR_PASSWORD, 'wrong error message!')
    ]);

    res = await post('/login', { username: '', password: '12345' });
    verifyBatch('Log in - wrong password', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.PLEASE_ENTER_YOUR_USERNAME, 'wrong error message!')
    ]);

    res = await post('/login', { username: '', password: '' });
    verifyBatch('Log in - wrong password', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, errors.PLEASE_ENTER_YOUR_USERNAME, 'wrong error message!')
    ]);

    res = await post('/login', { username: 'gilad', password: '12345' });
    verifyBatch('Log in - correct process', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'error is not a string!'),
        assertEqual(typeof res.json.username, 'string', 'username is not a string!'),
        assertEqual(res.json.username, 'gilad', 'username is gilad!'),
        assertEqual(typeof res.json.token, 'string', 'token is not a string!')
    ]);

    userId1 = res.json.id;
    token1 = res.json.token;
    ws1 = wsConnect(token1);
    
    await wait(0.5);
    res = ws1.messages.pop();
    verifyBatch('WS connections - User 1', [
        assertEqual(typeof res, 'object', 'ws message is not an object!'),
        assertEqual(res.success, true, 'ws connection is not successful!')
    ]);

    res = await post('/signup', { username: 'gilad2', password: '12345678', email: 'gilad2@1.com' });
    verifyBatch('Sign Up - correct process', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'error is not a string!'),
        assertEqual(typeof res.json.username, 'string', 'username is not a string!'),
        assertEqual(res.json.username, 'gilad2', 'username is gilad2!'),
        assertEqual(typeof res.json.token, 'string', 'token is not a string!')
    ]);

    userId2 = res.json.id;
    token2 = res.json.token;
    ws2 = wsConnect(token2);
    
    await wait(0.5);
    res = ws2.messages.pop();
    verifyBatch('WS connections - User 2', [
        assertEqual(typeof res, 'object', 'ws message is not an object!'),
        assertEqual(res.success, true, 'ws connection is not successful!')
    ]);

    return {
        userIds: [userId1, userId2],
        tokens: [token1, token2],
        wss: [ws1, ws2]
    };
}