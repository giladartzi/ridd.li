import stages, { getOpponentMove } from './gameTestsStages';
import { asyncToPromise } from '../utils/utils';
import { verifyBatch, assertEqual, getAnswerIndex, wait } from './testUtils';
import { post, get } from '../../common/rest';
import find from 'lodash/find';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import { WS_ADVANCE_GAME, ACTIVE } from '../../common/consts';
import { QUESTION_IS_ALREADY_ANSWERED, INVALID_QUESTION_INDEX, GAME_NOT_FOUND } from '../../common/errors';

let global = {};

function otherUserIndex(userIndex) {
    return (userIndex - 1) * -1;
}

function getTokenByUserIndex(userIndex) {
    return global.tokens[userIndex];
}

export function answer(questionIndex, question, isCorrect, userIndex) {
    return asyncToPromise(post('/answer', {
        gameId: global.gameId,
        questionIndex,
        answerIndex: getAnswerIndex(question, isCorrect)
    }, getTokenByUserIndex(userIndex)));
}

function composeMoveResult (httpRes, move) {
    return {
        httpRes,
        move,
        wsRes: global.wss[otherUserIndex(move.userIndex)].messages.pop()
    }
}

function waitAndComposeMoveResult (httpRes, move) {
    return asyncToPromise(wait(0.2))
        .then(() => composeMoveResult(httpRes, move));
}

function runMove(move) {
    return asyncToPromise(wait(move.wait))
        .then(() => answer(move.questionIndex, global.currentQuestion, move.isCorrect, move.userIndex))
        .then(httpRes => waitAndComposeMoveResult(httpRes, move));
}

function runStage(stage) {
    return Promise.all(stage.map(move => runMove(move)));
}

function getNextQuestion(res) {
    let lastMove = find(res, r => !r.move.isFirstToAnswer);
    
    if (lastMove.hasError) {
        lastMove = find(res, r => !r.move.hasError);
    }
    
    return lastMove.httpRes.json.question;
}

function clearWss() {
    global.wss.forEach(ws => {
        while (ws.messages.length) {
            ws.messages.pop();
        }
    });
}

function compareProgress(progress, move) {
    let fields = ['questionIndex', 'isCorrect', 'isTimedOut', 'isAnswered', 'userIndex'];
    let picked = progress.map(move => pick(move, fields));
    let answered = picked.filter(p => p.isAnswered);
    answered.forEach(m => delete m.isAnswered);
    let moves = stages.map(stage => find(stage, m => m.userIndex === move.userIndex));
    let validMoves = moves.filter(m => !m.hasError).slice(0, answered.length).map(m => pick(m, fields));

    if (!isEqual(answered, validMoves)) {
        console.log(answered, validMoves);
    }

    return isEqual(answered, validMoves);
}

function assert(move, payload) {
    let question = move.isFirstToAnswer ? global.previousQuestion : global.currentQuestion;
    let questionIndex = (move.isFirstToAnswer || move.hasError) ? move.questionIndex : move.questionIndex + 1;

    let winnerUserId = move.expectedState === ACTIVE ? null : global.userIds[0];

    return [
        assertEqual(payload.error, undefined, 'error!'),
        assertEqual(payload.gameId, global.gameId, 'wrong gameId'),
        assertEqual(payload.progress.length, move.expectedProgressLength, 'wrong progressLength'),
        assertEqual(payload.opponentProgress.length, move.expectedOpponentProgressLength, 'wrong OP progressLength'),
        assertEqual(isEqual(payload.question, question), true, 'wrong question'),
        assertEqual(payload.state, move.expectedState, 'wrong state'),
        assertEqual(payload.questionIndex, move.expectedQuestionIndex, 'wrong questionIndex'),
        assertEqual(payload.endedBy.userId, null, 'wrong endedBy.userId value'),
        assertEqual(payload.winner.userId, winnerUserId, 'wrong winner.userId value')
    ];
}

function assertProgress(move, payload) {
    return [
        assertEqual(compareProgress(payload.progress, move), true, 'wrong progress'),
        assertEqual(compareProgress(payload.opponentProgress, getOpponentMove(move)), true, 'wrong OP progress'),
    ]
}

function assertError(move, payload) {
    let error;

    if (move.badQuestionIndex) {
        error = INVALID_QUESTION_INDEX;
    }
    else if (move.alreadyAnswered) {
        error = QUESTION_IS_ALREADY_ANSWERED;
    }

    return [assertEqual(payload.error, error, 'wrong error')];
}

function assertHttp(res) {
    let move = res.move;
    let batch;
    let status;
    let progressBatch = [];

    if (move.hasError) {
        status = 400;
        batch = assertError(move, res.httpRes.json);
    }
    else {
        status = 200;
        batch = assert(move, res.httpRes.json);
        progressBatch = assertProgress(move, res.httpRes.json);
    }

    return [assertEqual(res.httpRes.status, status, 'wrong status'), ...batch, ...progressBatch];
}

function assertWs(res) {
    let batch = assert(res.move, res.wsRes.payload);
    let progressBatch = assertProgress(getOpponentMove(res.move), res.wsRes.payload);
    return [assertEqual(res.wsRes.type, WS_ADVANCE_GAME, 'wrong ws type'), ...batch, ...progressBatch];
}

function assertRes(res, stageIndex) {
    let title = `Stage ${stageIndex} - user ${res.move.userIndex}`;

    verifyBatch(`${title} - HTTP`, assertHttp(res));

    if (!res.move.hasError) {
        verifyBatch(`${title} -  WS `, assertWs(res));
    }
}

export default async function gameTests(tokens, userIds, wss, gameId, currentQuestion) {
    let httpRes;
    global.tokens = tokens;
    global.userIds = userIds;
    global.wss = wss;
    global.gameId = gameId;
    global.currentQuestion = currentQuestion;
    global.previousQuestion = null;
    clearWss();

    for (let stage of stages) {
        let res = await runStage(stage);
        global.previousQuestion = global.currentQuestion;
        global.currentQuestion = getNextQuestion(res);
        // console.dir(res, { depth: 10 });
        let stageIndex = stages.indexOf(stage);
        res.forEach(r => assertRes(r, stageIndex));
    }

    httpRes = await get('/getGame', tokens[0]);
    verifyBatch('Game ended - First user perspective', [
        assertEqual(httpRes.status, 400, 'status is not 400!'),
        assertEqual(typeof httpRes.json.error, 'string', 'error is not a string!'),
        assertEqual(httpRes.json.error, GAME_NOT_FOUND, 'Incorrect error message!')
    ], tokens[0]);

    httpRes = await get('/sync', tokens[0]);
    verifyBatch('Game ended - First user perspective (SYNC)', [
        assertEqual(httpRes.status, 200, 'status is not 200!'),
        assertEqual(httpRes.json.invitation, null, 'invitation is not null!'),
        assertEqual(httpRes.json.game, null, 'game is not null!')
    ]);

    httpRes = await get('/getGame', tokens[1]);
    verifyBatch('Game ended - Second user perspective', [
        assertEqual(httpRes.status, 400, 'status is not 400!'),
        assertEqual(typeof httpRes.json.error, 'string', 'error is not a string!'),
        assertEqual(httpRes.json.error, GAME_NOT_FOUND, 'Incorrect error message!')
    ], tokens[1]);

    httpRes = await get('/sync', tokens[1]);
    verifyBatch('Game ended - Second user perspective (SYNC)', [
        assertEqual(httpRes.status, 200, 'status is not 200!'),
        assertEqual(httpRes.json.invitation, null, 'invitation is not null!'),
        assertEqual(httpRes.json.game, null, 'game is not null!')
    ]);
    
    return gameId;
}