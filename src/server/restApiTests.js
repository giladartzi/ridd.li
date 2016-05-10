import * as server from './server';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import first from 'lodash/first';
import without from 'lodash/without';
import sample from 'lodash/sample';
import questions from './defaultQuestions';
import chalk from 'chalk';

function getAnswerIndex(question, correct) {
    let filtered = first(questions.filter(q => q.text === question.text));
    let answer = first(filtered.answers.filter(a => a.isCorrect)).text;
    let correctIndex = question.answers.indexOf(answer);
    if (correct) {
        return correctIndex;
    }
    else {
        let arr = [];
        question.answers.forEach((value, index) => arr.push(index));
        return sample(without(arr, correctIndex));
    }
}

async function send(method, path, token, body) {
    let url = 'http://localhost:8080' + path;

    let options = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    
    if (token) {
        options.headers.token = token;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response = await fetch(url, options);

    return {
        json: await response.json(),
        status: response.status
    };
}

async function post(path, body, token) {
    return await send('POST', path, token, body);
}

async function get(path, token) {
    return await send('GET', path, token);
}

function assertEqual(a, b, msg) {
    if (a !== b) {
        console.error(chalk.red('[   Fail]'), msg, a, b);
        return false;
    }

    return true;
}

function verifyBatch(name, batch) {
    let unique = uniq(batch);
    let result = unique.length === 1 && unique[0] === true;
    let prefix;

    if (result) {
        prefix = chalk.green('[Success]');
    }
    else {
        prefix = chalk.red('[   Fail]');
    }
    console.log(prefix, name);

    return result;
}

async function tests() {
    let currentQuestion, gameId, res, userId1, userId2, token1, token2;

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

    res = await post('/lounge/enter', {}, token1);
    verifyBatch('Lounge - enter (user 1)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json), true, 'res.json is not an array!'),
        assertEqual(res.json.length, 0, 'res.json is not in length of 0!')
    ]);

    res = await post('/lounge/enter', {}, token2);
    verifyBatch('Lounge - enter (user 2)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json), true, 'res.json is not an array!'),
        assertEqual(res.json.length, 1, 'res.json is not in length of 1!'),
        assertEqual(res.json[0].id, userId1, 'wrong userId!'),
        assertEqual(res.json[0].username, 'gilad', 'wrong username!')
    ]);

    res = await post('/lounge/availableUsers', {}, token1);
    verifyBatch('Lounge - Get available users', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(Array.isArray(res.json), true, 'res.json is not an array!'),
        assertEqual(res.json.length, 1, 'res.json is not in length of 1!'),
        assertEqual(res.json[0].id, userId2, 'wrong userId!'),
        assertEqual(res.json[0].username, 'gilad2', 'wrong username!')
    ]);

    res = await post('/createGame', { opponentId: "blablablabla" }, token1);

    verifyBatch('Game initialization with bad opponentId', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'One or more invalid user IDs', 'wrong error message!')
    ]);

    res = await post('/createGame', { opponentId: userId2 }, token1);

    verifyBatch('Game init', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!')
    ]);

    currentQuestion = res.json.question;
    gameId = res.json.gameId;

    res = await post('/createGame', { opponentId: userId2 }, token1);

    verifyBatch('Duplication initialization', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'At least one of the users is busy', 'wrong error message!')
    ]);

    // Get the game in the first user's perspective
    res = await get('/game', token1);
    verifyBatch('Stage 1 - First user perspective', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 0, 'answered is not in the length of 0!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!')
    ]);

    res = await get('/game', token2);
    verifyBatch('Stage 1 - Second user perspective', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 0, 'answered is not in the length of 0!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: getAnswerIndex(currentQuestion, true)
    }, token1);
    verifyBatch('Stage 1 - First user answers correctly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 1, 'answered is not in the length of 1!'),
        assertEqual(res.json.progress[0].isCorrect, true, 'Answer is not correct!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: getAnswerIndex(currentQuestion, false)
    }, token2);
    verifyBatch('Stage 1 - Second user answers incorrectly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 2, 'progress is not in the length of 2!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 1, 'answered is not in the length of 1!'),
        assertEqual(res.json.progress[0].isCorrect, false, 'Answer is correct!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), false, 'question EQUAL to currentQuestion!')
    ]);
    currentQuestion = res.json.question;

    res = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: 0
    }, token1);
    verifyBatch('Stage 1 - First user tries to re-answer the same question twice', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Question is already answered!', 'wrong error!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 14,
        answerIndex: 0
    }, token1);
    verifyBatch('Stage 1 - First user tries to answer a non-existing question', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Invalid question index!', 'wrong error!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 1,
        answerIndex: getAnswerIndex(currentQuestion, true)
    }, token1);
    verifyBatch('Stage 2 - First user answers correctly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 2, 'progress is not in the length of 2!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 2, 'answered is not in the length of 2!'),
        assertEqual(res.json.progress[1].isCorrect, true, 'Answer is not correct!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 1,
        answerIndex: getAnswerIndex(currentQuestion, false)
    }, token2);
    verifyBatch('Stage 2 - Second user answers incorrectly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 3, 'progress is not in the length of 3!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 2, 'answered is not in the length of 2!'),
        assertEqual(res.json.progress[1].isCorrect, false, 'Answer is correct!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), false, 'question EQUAL to currentQuestion!')
    ]);
    currentQuestion = res.json.question;

    res = await post('/answer', {
        gameId,
        questionIndex: 2,
        answerIndex: getAnswerIndex(currentQuestion, false)
    }, token1);
    verifyBatch('Stage 3 - First user answers incorrectly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 3, 'progress is not in the length of 3!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 3, 'answered is not in the length of 3!'),
        assertEqual(res.json.progress[2].isCorrect, false, 'Answer is correct!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 2,
        answerIndex: getAnswerIndex(currentQuestion, true)
    }, token2);

    verifyBatch('Stage 3 - Second user answers incorrectly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'INACTIVE', 'state is not INACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 3, 'progress is not in the length of 3!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 3, 'answered is not in the length of 3!'),
        assertEqual(res.json.progress[2].isCorrect, true, 'Answer is not correct!'),
        assertEqual(res.json.question, null, 'question is not null!')
    ]);

    res = await get('/game', token1);
    verifyBatch('Stage 4 - First user perspective', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Game not found', 'Incorrect error message!')
    ], token1);

    res = await get('/game', token2);
    verifyBatch('Stage 4 - Second user perspective', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Game not found', 'Incorrect error message!')
    ], token2);

    process.exit(0);
}

tests();