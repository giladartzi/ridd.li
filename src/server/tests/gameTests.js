import { verifyBatch, assertEqual, getAnswerIndex, wait } from './testUtils';
import { post, get } from '../../common/rest';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import { WS_ADVANCE_GAME, NUM_OF_QUESTIONS } from '../../common/consts';

let globalGameId;
let globalCurrentQuestion;
let globalTokens;
let globalWss;

async function wholeStage(stage, isCorrect1, isCorrect2) {
    let httpRes, wsRes;

    httpRes = await answer(stage - 1, globalCurrentQuestion, isCorrect1, globalTokens[0]);
    verifyBatch(`Stage ${stage} - User 1, correct ${isCorrect1}`,
        httpGameAsserts(httpRes, 0, stage, isCorrect1, globalCurrentQuestion));

    httpRes = await answer(stage - 1, globalCurrentQuestion, isCorrect2, globalTokens[1]);
    verifyBatch(`Stage ${stage} - User 2, correct ${isCorrect2}`,
        httpGameAsserts(httpRes, 1, stage, isCorrect2, globalCurrentQuestion));

    wsRes = await wsPop(globalWss[0]);
    verifyBatch(`Stage ${stage} User 1 - Game advance - Push`,
        wsGameAsserts(wsRes, stage - 1, stage, isCorrect1, globalCurrentQuestion));

    globalCurrentQuestion = httpRes.json.question;
}

async function answer(questionIndex, currentQuestion, isCorrect, token) {
    return await post('/answer', {
        gameId: globalGameId,
        questionIndex,
        answerIndex: getAnswerIndex(currentQuestion, isCorrect)
    }, token);
}

async function wsPop(ws) {
    await wait(0.2);
    return ws.messages.pop();
}

function httpGameAsserts(res, userIndex, stage, isCorrect, currentQuestion, answers) {
    let payload = res.json.game || res.json;
    let stageEnded = userIndex !== 0;

    return [
        assertEqual(res.status, 200, 'status is not 200!'),
        ...gameAsserts(payload, stage, isCorrect, currentQuestion, answers, stageEnded)
    ];
}

function wsGameAsserts(res, userIndex, stage, isCorrect, currentQuestion, answers) {
    return [
        assertEqual(res.type, WS_ADVANCE_GAME, 'ws type is incorrect!'),
        ...gameAsserts(res.payload, stage, isCorrect, currentQuestion, answers, true)
    ];
}

function gameAsserts(payload, stage, isCorrect, currentQuestion, answers, stageEnded) {
    let progressLength = answers === 0 ? 1 : stageEnded ? stage + 1 : stage;
    let questionIndex = answers === 0 ? 0 : stageEnded ? stage : stage - 1;
    let answeredLength = typeof answers === 'number' ? answers : stage;
    let state = 'ACTIVE';

    let answered = payload.progress.filter(p => p.isAnswered);
    let lastAnswered = last(answered) || {};
    let currentQuestionEquality = !stageEnded || answers === 0;

    let questionAsserts;

    if (questionIndex === NUM_OF_QUESTIONS) {
        state = 'INACTIVE';
        progressLength = NUM_OF_QUESTIONS;
        questionAsserts = [
            assertEqual(payload.question, null, 'wrong currentQuestion!')
        ];
    }
    else {
        questionAsserts = [
            assertEqual(typeof payload.question.text, 'string', 'question.text is not a string!'),
            assertEqual(Array.isArray(payload.question.answers), true, 'question.answers is not an array!'),
            assertEqual(isEqual(payload.question, currentQuestion), currentQuestionEquality, 'wrong currentQuestion!')
        ];
    }

    return [
        assertEqual(payload.state, state, `state is not ${state}!`),
        assertEqual(typeof payload.gameId, 'string', 'gameId is not a string!'),
        assertEqual(payload.gameId, globalGameId, 'Incorrect gameId!'),
        assertEqual(Array.isArray(payload.progress), true, 'progress is not an array!'),
        assertEqual(payload.progress.length, progressLength, `progress is not in the length of ${progressLength}`),
        assertEqual(answered.length, answeredLength, 'wrong answered length!'),
        assertEqual(lastAnswered.isCorrect, isCorrect, 'Answer correctness issue!'),
        assertEqual(payload.questionIndex, questionIndex, 'questionIndex is not 0'),
        ...questionAsserts
    ];
}

export default async function gameTests(tokens, userIds, wss, gameId, currentQuestion) {
    let httpRes, wsRes;

    globalGameId = gameId;
    globalCurrentQuestion = currentQuestion;
    globalTokens = tokens;
    globalWss = wss;

    // Get the game in the first user's perspective
    httpRes = await get('/game', tokens[0]);
    verifyBatch('Stage 1 - First user perspective', httpGameAsserts(httpRes, 0, 1, undefined, currentQuestion, 0));

    httpRes = await get('/sync', tokens[0]);
    verifyBatch('Stage 1 - First user perspective (SYNC)', httpGameAsserts(httpRes, 0, 1, undefined, currentQuestion, 0));

    httpRes = await get('/game', tokens[1]);
    verifyBatch('Stage 1 - Second user perspective', httpGameAsserts(httpRes, 1, 1, undefined, currentQuestion, 0));

    httpRes = await get('/sync', tokens[1]);
    verifyBatch('Stage 1 - Second user perspective (SYNC)', httpGameAsserts(httpRes, 1, 1, undefined, currentQuestion, 0));

    await wholeStage(1, true, false);

    httpRes = await post('/answer', {
        gameId,
        questionIndex: 0,
        answerIndex: 0
    }, tokens[0]);
    verifyBatch('Stage 1 - First user tries to re-answer the same question twice', [
        assertEqual(httpRes.status, 400, 'status is not 400!'),
        assertEqual(typeof httpRes.json.error, 'string', 'error is not a string!'),
        assertEqual(httpRes.json.error, 'Question is already answered!', 'wrong error!')
    ]);

    httpRes = await post('/answer', {
        gameId,
        questionIndex: 14,
        answerIndex: 0
    }, tokens[0]);
    verifyBatch('Stage 1 - First user tries to answer a non-existing question', [
        assertEqual(httpRes.status, 400, 'status is not 400!'),
        assertEqual(typeof httpRes.json.error, 'string', 'error is not a string!'),
        assertEqual(httpRes.json.error, 'Invalid question index!', 'wrong error!')
    ]);

    await wholeStage(2, true, false);
    await wholeStage(3, true, true);
    await wholeStage(4, false, true);
    await wholeStage(5, false, false);
    await wholeStage(6, true, false);
    await wholeStage(7, false, true);
    await wholeStage(8, true, false);
    await wholeStage(9, true, false);
    await wholeStage(10, true, false);

    httpRes = await get('/game', tokens[0]);
    verifyBatch('Game ended - First user perspective', [
        assertEqual(httpRes.status, 400, 'status is not 400!'),
        assertEqual(typeof httpRes.json.error, 'string', 'error is not a string!'),
        assertEqual(httpRes.json.error, 'Game not found', 'Incorrect error message!')
    ], tokens[0]);

    httpRes = await get('/sync', tokens[0]);
    verifyBatch('Game ended - First user perspective (SYNC)', [
        assertEqual(httpRes.status, 200, 'status is not 200!'),
        assertEqual(httpRes.json.invitation, null, 'invitation is not null!'),
        assertEqual(httpRes.json.game, null, 'game is not null!')
    ]);

    httpRes = await get('/game', tokens[1]);
    verifyBatch('Game ended - Second user perspective', [
        assertEqual(httpRes.status, 400, 'status is not 400!'),
        assertEqual(typeof httpRes.json.error, 'string', 'error is not a string!'),
        assertEqual(httpRes.json.error, 'Game not found', 'Incorrect error message!')
    ], tokens[1]);

    httpRes = await get('/sync', tokens[1]);
    verifyBatch('Game ended - Second user perspective (SYNC)', [
        assertEqual(httpRes.status, 200, 'status is not 200!'),
        assertEqual(httpRes.json.invitation, null, 'invitation is not null!'),
        assertEqual(httpRes.json.game, null, 'game is not null!')
    ]);
    
    return gameId;
}