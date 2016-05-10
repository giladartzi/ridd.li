import * as server from './server';
import random from 'lodash/random';
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

async function send(method, path, body) {
    let url = 'http://localhost:8080' + path;

    let options = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response = await fetch(url, options);

    return {
        json: await response.json(),
        status: response.status
    };
}

async function post(path, body) {
    return await send('POST', path, body);
}

async function get(path) {
    return await send('GET', path);
}

function assertEqual(a, b, msg) {
    if (a !== b) {
        console.error(chalk.red('[   Fail]'), msg, a, b);
        return false;
    }

    return true;
}

function assertNotEqual(a, b, msg) {
    if (a === b) {
        console.error(chalk.red('[   Fail]'), msg, a, b);
        return false;
    }

    return true;
}

function assertTrue(a, msg) {
    return assertEqual(a, true, msg);
}

function assertFalse(a, msg) {
    return assertEqual(a, false, msg);
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
    var userId1 = random(1000000, 9999999);
    var userId2 = random(1000000, 9999999);
    let currentQuestion, gameId;

    // Creating a game with dummy userId's
    let res = await post('/createGame', { userId1, userId2 });

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

    res = await post('/createGame', { userId1, userId2 });

    verifyBatch('Duplication initialization', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'At least one of the users is busy', 'wrong error message!'),
    ]);

    // Get the game in the first user's perspective
    res = await get('/game/' + userId1);
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

    res = await get('/game/' + userId2);
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
        userId: userId1,
        questionIndex: 0,
        answerIndex: getAnswerIndex(currentQuestion, true)
    });
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
        userId: userId2,
        questionIndex: 0,
        answerIndex: getAnswerIndex(currentQuestion, false)
    });
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
        userId: userId1,
        questionIndex: 0,
        answerIndex: 0
    });
    verifyBatch('Stage 1 - First user tries to re-answer the same question twice', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Question is already answered!', 'wrong error!')
    ]);

    res = await post('/answer', {
        gameId,
        userId: userId1,
        questionIndex: 14,
        answerIndex: 0
    });
    verifyBatch('Stage 1 - First user tries to answer a non-existing question', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Invalid question index!', 'wrong error!')
    ]);

    res = await post('/answer', {
        gameId,
        userId: userId1,
        questionIndex: 1,
        answerIndex: getAnswerIndex(currentQuestion, true)
    });
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
        userId: userId2,
        questionIndex: 1,
        answerIndex: getAnswerIndex(currentQuestion, false)
    });
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
        userId: userId1,
        questionIndex: 2,
        answerIndex: getAnswerIndex(currentQuestion, false)
    });
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
        userId: userId2,
        questionIndex: 2,
        answerIndex: getAnswerIndex(currentQuestion, true)
    });

    verifyBatch('Stage 3 - Second user answers incorrectly', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'INACTIVE', 'state is not INACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 3, 'progress is not in the length of 3!'),
        assertEqual(res.json.progress.filter(p => p.isAnswered).length, 3, 'answered is not in the length of 3!'),
        assertEqual(res.json.progress[2].isCorrect, true, 'Answer is not correct!'),
        assertEqual(res.json.question, null, 'question is not null!'),
    ]);

    res = await get('/game/' + userId1);
    verifyBatch('Stage 4 - First user perspective', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Game not found', 'Incorrect error message!')
    ]);

    res = await get('/game/' + userId2);
    verifyBatch('Stage 4 - Second user perspective', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Game not found', 'Incorrect error message!')
    ]);

    process.exit(0);
}

tests();