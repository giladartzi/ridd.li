import { verifyBatch, assertEqual } from './testUtils';
import { post, get } from '../../common/rest';

export default async function invitationTests(tokens, userIds) {
    let res;

    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Invitation not found', 'wrong error message!')
    ]);
    
    res = await post('/invitation/cancel', {}, tokens[0]);
    verifyBatch('Cancel invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Pending invitation not found', 'wrong error message!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await post('/invitation/cancel', {}, tokens[0]);
    verifyBatch('Cancel invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'CANCELLED', 'state is not CANCELLED!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation - user is busy', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Opponent is not available', 'wrong error message!')
    ]);

    res = await post('/invitation/cancel', {}, tokens[1]);
    verifyBatch('Cancel invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Pending invitation not found', 'wrong error message!')
    ]);
    
    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - user 1', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await get('/invitation', tokens[1]);
    verifyBatch('Get invitation - user 2', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await post('/invitation/reject', {}, tokens[0]);
    verifyBatch('Reject invitation - by inviter', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Pending invitation not found', 'wrong error message!')
    ]);

    res = await post('/invitation/reject', {}, tokens[1]);
    verifyBatch('Reject invitation - by invitee', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'REJECTED', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!'),
        assertEqual(res.json.error, undefined, 'has error!')
    ]);

    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Invitation not found', 'wrong error message!')
    ]);

    res = await get('/invitation', tokens[1]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Invitation not found', 'wrong error message!')
    ]);

    res = await post('/invitation/accept', {}, tokens[1]);
    verifyBatch('Accept invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, 'Pending invitation not found', 'wrong error message!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await post('/invitation/accept', {}, tokens[1]);
    verifyBatch('Accept invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.state, 'ACTIVE', 'state is not ACTIVE!'),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!')
    ]);

    return {
        gameId: res.json.gameId,
        currentQuestion: res.json.question
    }
}