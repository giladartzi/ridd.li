import { findById, update, insert, find, objectId, findOneAndUpdate } from '../dataLayer';
import { createGame } from './gameController';
import { gameJson } from '../utils/gameUtils';
import { wsSend } from '../wsManager';
import { WS_INVITATION_RECEIVED, WS_INVITATION_CANCELLED,
    WS_INVITATION_ACCEPTED, WS_INVITATION_REJECTED, AVAILABLE, IN_GAME, ACCEPTED, REJECTED } from '../../common/consts';
import * as errors from '../../common/errors';

function invitationJson(invitation) {
    return {
        id: invitation._id,
        inviter: invitation.inviter,
        invitee: invitation.invitee,
        state: invitation.state
    };
}

export async function sendInvitation(userId, displayName, opponentId) {
    // Verify user is available
    var opponent = await findById('users', opponentId);

    // Verify opponent exists
    if (!opponent) {
        throw new Error(errors.OPPONENT_NOT_FOUND);
    }

    // And is available
    if (opponent.state !== AVAILABLE) {
        throw new Error(errors.OPPONENT_IS_NOT_AVAILABLE);
    }
    
    // Update both user's state
    let userIds = [
        objectId(userId),
        objectId(opponentId)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: 'INVITED' } });

    // Create new invitation
    let invitation = await insert('invitations', {
        state: 'PENDING',
        inviter: { id: userId, displayName: displayName },
        invitee: { id: opponentId, displayName: opponent.displayName }
    });

    // Send invitation to opponent
    let json = invitationJson(invitation);
    wsSend(opponentId, {
        type: WS_INVITATION_RECEIVED,
        payload: json
    });

    return json;
}

export async function acceptInvitation(userId) {
    // Verify invitation is pending
    let invitation = await find('invitations', { query: {
        "invitee.id": userId,
        state: 'PENDING'
    }});

    if (!invitation) {
        throw new Error(errors.PENDING_INVITATION_NOT_FOUND);
    }

    // update invitation status
    await update('invitations', { _id: objectId(invitation._id) }, { $set: { state: ACCEPTED } });

    // update both users state
    let userIds = [
        objectId(invitation.inviter.id),
        objectId(invitation.invitee.id)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: IN_GAME } });
    let game = await createGame([invitation.inviter.id, invitation.invitee.id]);

    // Notify inviter that invitation is accepted
    let inviterJson = await gameJson(game, invitation.inviter.id);
    wsSend(invitation.inviter.id.toString(), {
        type: WS_INVITATION_ACCEPTED,
        payload: inviterJson
    });

    return await gameJson(game, invitation.invitee.id);
}

export async function rejectInvitation(userId) {
    // Verify invitation is pending
    let invitation = await find('invitations', { query: {
        "invitee.id": userId,
        state: 'PENDING'
    }});

    if (!invitation) {
        throw new Error(errors.PENDING_INVITATION_NOT_FOUND);
    }

    // update invitation status
    invitation = await findOneAndUpdate('invitations', invitation._id, { $set: { state: REJECTED } });

    // update both users state
    let userIds = [
        objectId(invitation.inviter.id),
        objectId(invitation.invitee.id)
    ];

    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: AVAILABLE } });
    let json = invitationJson(invitation);

    // Notify inviter that invitation is rejected
    wsSend(invitation.inviter.id, {
        type: WS_INVITATION_REJECTED,
        payload: json
    });
    
    return json;
}

export async function cancelInvitation(userId) {
    // Verify invitation is pending
    let invitation = await find('invitations', { query: {
        "inviter.id": userId,
        state: 'PENDING'
    }});

    if (!invitation) {
        throw new Error(errors.PENDING_INVITATION_NOT_FOUND);
    }

    // update invitation status
    invitation = await findOneAndUpdate('invitations', invitation._id, { $set: { state: 'CANCELLED'} });

    // update both users state
    let userIds = [
        objectId(invitation.inviter.id),
        objectId(invitation.invitee.id)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: AVAILABLE } });

    // Notify inviter that invitation is cancelled
    wsSend(invitation.invitee.id, {
        type: WS_INVITATION_CANCELLED,
        payload: invitation
    });

    return invitationJson(invitation);
}

export async function getInvitation(userId) {
    // find invitation if exists
    let invitation = await find('invitations', { query: { $or: [
        { "inviter.id": userId },
        { "invitee.id": userId }
    ], state: 'PENDING' }});

    if (!invitation) {
        throw new Error(errors.INVITATION_NOT_FOUND);
    }

    return invitationJson(invitation);
}