import { verifyBatch, assertEqual, getAnswerIndex, wait } from './testUtils';
import { post, get } from '../../common/rest';
import isEqual from 'lodash/isEqual';
import { WS_ADVANCE_GAME } from '../../common/consts';

export default async function gameTests(tokens, userIds, wss, gameId, currentQuestion) {
    let res;

    // Get the game in the first user's perspective
    res = await get('/game', tokens[0]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.questionIndex, 0, 'questionIndex is not 0')
    ]);

    res = await get('/sync', tokens[0]);
    verifyBatch('Stage 1 - First user perspective (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.game.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.game.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.game.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.game.progress), true, 'progress is not an array!'),
        assertEqual(res.json.game.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(res.json.game.progress.filter(p => p.isAnswered).length, 0, 'answered is not in the length of 0!'),
        assertEqual(typeof res.json.game.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.game.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.game.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.invitation, null, 'invitation is not null'),
        assertEqual(res.json.game.questionIndex, 0, 'questionIndex is not 0')
    ]);

    res = await get('/game', tokens[1]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.questionIndex, 0, 'questionIndex is not 0')
    ]);

    res = await get('/sync', tokens[1]);
    verifyBatch('Stage 1 - Second user perspective (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.game.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.game.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.json.game.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.json.game.progress), true, 'progress is not an array!'),
        assertEqual(res.json.game.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(res.json.game.progress.filter(p => p.isAnswered).length, 0, 'answered is not in the length of 0!'),
        assertEqual(typeof res.json.game.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.game.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.json.game.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.invitation, null, 'invitation is not null'),
        assertEqual(res.json.game.questionIndex, 0, 'questionIndex is not 0')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: getAnswerIndex(currentQuestion, true)
    }, tokens[0]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.questionIndex, 0, 'questionIndex is not 0')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: getAnswerIndex(currentQuestion, false)
    }, tokens[1]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), false, 'question EQUAL to currentQuestion!'),
        assertEqual(res.json.questionIndex, 1, 'questionIndex is not 1')
    ]);
    currentQuestion = res.json.question;

    await wait(0.2);
    res = wss[0].messages.pop();
    verifyBatch('User 1 - Game advance - Push', [
        assertEqual(res.type, WS_ADVANCE_GAME, 'ws type is incorrect!'),
        assertEqual(res.payload.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.payload.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.payload.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.payload.progress), true, 'progress is not an array!'),
        assertEqual(res.payload.progress.length, 2, 'progress is not in the length of 2!'),
        assertEqual(typeof res.payload.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.payload.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.payload.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.payload.questionIndex, 1, 'questionIndex is not 1')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: 0
    }, tokens[0]);
    verifyBatch('Stage 1 - First user tries to re-answer the same question twice', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Question is already answered!', 'wrong error!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 14,
        answerIndex: 0
    }, tokens[0]);
    verifyBatch('Stage 1 - First user tries to answer a non-existing question', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Invalid question index!', 'wrong error!')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 1,
        answerIndex: getAnswerIndex(currentQuestion, true)
    }, tokens[0]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.questionIndex, 1, 'questionIndex is not 1')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 1,
        answerIndex: getAnswerIndex(currentQuestion, false)
    }, tokens[1]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), false, 'question EQUAL to currentQuestion!'),
        assertEqual(res.json.questionIndex, 2, 'questionIndex is not 2')
    ]);
    currentQuestion = res.json.question;

    await wait(0.2);
    res = wss[0].messages.pop();
    verifyBatch('Stage 2 - Push notification', [
        assertEqual(res.type, WS_ADVANCE_GAME, 'ws type is incorrect'),
        assertEqual(res.payload.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.payload.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.payload.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.payload.progress), true, 'progress is not an array!'),
        assertEqual(res.payload.progress.length, 3, 'progress is not in the length of 3!'),
        assertEqual(typeof res.payload.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.payload.question.answers), true, 'question.answers is not an array!'),
        assertEqual(isEqual(res.payload.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.payload.questionIndex, 2, 'questionIndex is not 2')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 2,
        answerIndex: getAnswerIndex(currentQuestion, false)
    }, tokens[0]);
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
        assertEqual(isEqual(res.json.question, currentQuestion), true, 'question is not equal to currentQuestion!'),
        assertEqual(res.json.questionIndex, 2, 'questionIndex is not 2')
    ]);

    res = await post('/answer', {
        gameId,
        questionIndex: 2,
        answerIndex: getAnswerIndex(currentQuestion, true)
    }, tokens[1]);

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

    await wait(0.2);
    res = wss[0].messages.pop();
    verifyBatch('Stage 3 - Push notification', [
        assertEqual(res.type, WS_ADVANCE_GAME, 'ws type is incorrect!'),
        assertEqual(res.payload.state, 'INACTIVE', 'state is not INACTIVE!'),
        assertEqual(typeof res.payload.gameId, 'string', 'gameId is not a string!'),
        assertEqual(res.payload.gameId, gameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(res.payload.progress), true, 'progress is not an array!'),
        assertEqual(res.payload.question, null, 'question is not null!')
    ]);

    res = await get('/game', tokens[0]);
    verifyBatch('Stage 4 - First user perspective', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Game not found', 'Incorrect error message!')
    ], tokens[0]);

    res = await get('/sync', tokens[0]);
    verifyBatch('Stage 4 - First user perspective (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.invitation, null, 'invitation is not null!'),
        assertEqual(res.json.game, null, 'game is not null!')
    ]);

    res = await get('/game', tokens[1]);
    verifyBatch('Stage 4 - Second user perspective', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(typeof res.json.error, 'string', 'error is not a string!'),
        assertEqual(res.json.error, 'Game not found', 'Incorrect error message!')
    ], tokens[1]);

    res = await get('/sync', tokens[1]);
    verifyBatch('Stage 4 - Second user perspective (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.invitation, null, 'invitation is not null!'),
        assertEqual(res.json.game, null, 'game is not null!')
    ]);
    
    return gameId;
}