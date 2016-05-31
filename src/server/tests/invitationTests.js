import { verifyBatch, assertEqual, wait } from './testUtils';
import { post, get } from '../../common/rest';
import { WS_INVITATION_RECEIVED, WS_INVITATION_CANCELLED,
    WS_INVITATION_ACCEPTED, WS_INVITATION_REJECTED, ACTIVE, REJECTED } from '../../common/consts';
import * as errors from '../../common/errors';

export default async function invitationTests(tokens, userIds, wss) {
    let res;

    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.INVITATION_NOT_FOUND, 'wrong error message!')
    ]);
    
    res = await post('/invitation/cancel', {}, tokens[0]);
    verifyBatch('Cancel invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.PENDING_INVITATION_NOT_FOUND, 'wrong error message!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.error, undefined, 'error!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    await wait(0.2);
    res = wss[1].messages.pop();
    verifyBatch('User 2 invitation push', [
        assertEqual(res.type, WS_INVITATION_RECEIVED, 'wrong ws type!'),
        assertEqual(typeof res.payload.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.payload.state, 'string', 'state is not a string!'),
        assertEqual(res.payload.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.payload.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.payload.invitee.id, userIds[1], 'wrong inviter!')
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

    await wait(0.2);
    res = wss[1].messages.pop();
    verifyBatch('User 2 invitation cancelled push', [
        assertEqual(res.type, WS_INVITATION_CANCELLED),
        assertEqual(typeof res.payload.state, 'string', 'state is not a string!'),
        assertEqual(res.payload.state, 'CANCELLED', 'state is not CANCELLED!')
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

    await wait(0.2);
    res = wss[1].messages.pop();
    verifyBatch('User 2 invitation push', [
        assertEqual(res.type, WS_INVITATION_RECEIVED, 'wrong ws type!'),
        assertEqual(typeof res.payload.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.payload.state, 'string', 'state is not a string!'),
        assertEqual(res.payload.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.payload.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.payload.invitee.id, userIds[1], 'wrong inviter!')
    ]);

    res = await post('/invitation/send', { opponentId: userIds[1] }, tokens[0]);
    verifyBatch('Send invitation - user is busy', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.OPPONENT_IS_NOT_AVAILABLE, 'wrong error message!')
    ]);

    res = await post('/invitation/cancel', {}, tokens[1]);
    verifyBatch('Cancel invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.PENDING_INVITATION_NOT_FOUND, 'wrong error message!')
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

    res = await get('/sync', tokens[0]);
    verifyBatch('Get invitation - user 1 (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.invitation.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.invitation.state, 'string', 'state is not a string!'),
        assertEqual(res.json.invitation.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.invitation.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitation.invitee.id, userIds[1], 'wrong inviter!'),
        assertEqual(res.json.game, null, 'game is not null!')
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

    res = await get('/sync', tokens[1]);
    verifyBatch('Get invitation - user 2 (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.invitation.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.invitation.state, 'string', 'state is not a string!'),
        assertEqual(res.json.invitation.state, 'PENDING', 'state is not PENDING!'),
        assertEqual(res.json.invitation.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitation.invitee.id, userIds[1], 'wrong inviter!'),
        assertEqual(res.json.game, null, 'game is not null!')
    ]);

    res = await post('/invitation/reject', {}, tokens[0]);
    verifyBatch('Reject invitation - by inviter', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.PENDING_INVITATION_NOT_FOUND, 'wrong error message!')
    ]);

    res = await post('/invitation/reject', {}, tokens[1]);
    verifyBatch('Reject invitation - by invitee', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(typeof res.json.id, 'string', 'id is not a string!'),
        assertEqual(typeof res.json.state, 'string', 'state is not a string!'),
        assertEqual(res.json.state, REJECTED, 'state is wrong!'),
        assertEqual(res.json.inviter.id, userIds[0], 'wrong inviter!'),
        assertEqual(res.json.invitee.id, userIds[1], 'wrong inviter!'),
        assertEqual(res.json.error, undefined, 'has error!')
    ]);
    
    await wait(0.2);
    res = wss[0].messages.pop();
    verifyBatch('Reject invitation - push to inviter', [
        assertEqual(res.type, WS_INVITATION_REJECTED),
        assertEqual(typeof res.payload.state, 'string', 'state is not a string!'),
        assertEqual(res.payload.state, REJECTED, 'state is wrong!')
    ]);

    res = await get('/invitation', tokens[0]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.INVITATION_NOT_FOUND, 'wrong error message!')
    ]);

    res = await get('/sync', tokens[0]);
    verifyBatch('Get invitation - non existing (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.invitation, null, 'invitation is not null!'),
        assertEqual(res.json.game, null, 'game is not null!')
    ]);

    res = await get('/invitation', tokens[1]);
    verifyBatch('Get invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.INVITATION_NOT_FOUND, 'wrong error message!')
    ]);

    res = await get('/sync', tokens[1]);
    verifyBatch('Get invitation - non existing (SYNC)', [
        assertEqual(res.status, 200, 'status is not 200!'),
        assertEqual(res.json.invitation, null, 'invitation is not null!'),
        assertEqual(res.json.game, null, 'game is not null!')
    ]);

    res = await post('/invitation/accept', {}, tokens[1]);
    verifyBatch('Accept invitation - non existing', [
        assertEqual(res.status, 400, 'status is not 400!'),
        assertEqual(res.json.error, errors.PENDING_INVITATION_NOT_FOUND, 'wrong error message!')
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
        assertEqual(res.json.state, ACTIVE, `state is not ${ACTIVE}!`),
        assertEqual(typeof res.json.gameId, 'string', 'gameId is not a string!'),
        assertEqual(Array.isArray(res.json.progress), true, 'progress is not an array!'),
        assertEqual(res.json.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(typeof res.json.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.json.question.answers), true, 'question.answers is not an array!')
    ]);

    await wait(0.2);
    res = wss[0].messages.pop();
    verifyBatch('Accept invitation', [
        assertEqual(res.type, WS_INVITATION_ACCEPTED, 'wrong ws type!'),
        assertEqual(res.payload.state, ACTIVE, `state is not ${ACTIVE}!`),
        assertEqual(typeof res.payload.gameId, 'string', 'gameId is not a string!'),
        assertEqual(Array.isArray(res.payload.progress), true, 'progress is not an array!'),
        assertEqual(res.payload.progress.length, 1, 'progress is not in the length of 1!'),
        assertEqual(typeof res.payload.question.text, 'string', 'question.text is not a string!'),
        assertEqual(Array.isArray(res.payload.question.answers), true, 'question.answers is not an array!')
    ]);

    return {
        gameId: res.payload.gameId,
        currentQuestion: res.payload.question
    }
}