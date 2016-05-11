import { findById, update, insert, find, objectId, findOneAndUpdate } from '../dataLayer';
import { createGame } from './gameController';

function invitationJson(invitation) {
    return {
        id: invitation._id,
        inviter: invitation.inviter,
        invitee: invitation.invitee,
        state: invitation.state
    }
}

export async function sendInvitation(userId, opponentId) {
    // Verify user is available
    var opponent = await findById('users', opponentId);

    // Verify opponent exists
    if (!opponent) {
        throw new Error('Opponent not found');
    }

    // And is available
    if (opponent.state !== 'AVAILABLE') {
        throw new Error('Opponent is not available');
    }
    
    // update both users state
    let userIds = [
        objectId(userId),
        objectId(opponentId)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: 'INVITED' } });

    // create new invitation
    let invitation = await insert('invitations', {
        state: 'PENDING',
        inviter: userId,
        invitee: opponentId
    });
    
    return invitationJson(invitation);
}

export async function acceptInvitation(userId) {
    // Verify invitation is pending
    let invitation = await find('invitations', { query: {
        invitee: userId,
        state: 'PENDING'
    }});

    if (!invitation) {
        throw new Error('Pending invitation not found');
    }

    // update invitation status
    await update('invitation', { _id: objectId(invitation._id) }, { $set: { state: 'ACCEPTED' } });

    // update both users state
    let userIds = [
        objectId(invitation.inviter),
        objectId(invitation.invitee)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: 'IN_GAME' } });

    return await createGame([invitation.inviter, invitation.invitee]);
}

export async function rejectInvitation(userId) {
    // Verify invitation is pending
    let invitation = await find('invitations', { query: {
        invitee: userId,
        state: 'PENDING'
    }});

    if (!invitation) {
        throw new Error('Pending invitation not found');
    }

    // update invitation status
    invitation = await findOneAndUpdate('invitations', invitation._id, { $set: { state: 'REJECTED'} });
    
    // update both users state
    let userIds = [
        objectId(invitation.inviter),
        objectId(invitation.invitee)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: 'AVAILABLE' } });
    
    return invitationJson(invitation);
}

export async function cancelInvitation(userId) {
    // Verify invitation is pending
    let invitation = await find('invitations', { query: {
        inviter: userId,
        state: 'PENDING'
    }});

    if (!invitation) {
        throw new Error('Pending invitation not found');
    }

    // update invitation status
    invitation = await findOneAndUpdate('invitations', invitation._id, { $set: { state: 'CANCELLED'} });

    // update both users state
    let userIds = [
        objectId(invitation.inviter),
        objectId(invitation.invitee)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: 'AVAILABLE' } });

    return invitationJson(invitation);
}

export async function getInvitation(userId) {
    // find invitation if exists
    let invitation = await find('invitations', { query: { $or: [
        { inviter: userId },
        { invitee: userId }
    ], state: 'PENDING' }});

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    return invitationJson(invitation);
}