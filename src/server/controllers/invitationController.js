import { findById, update, insert, find } from '../dataLayer';
import mongodb from 'mongodb';

function invitationJson(invitation) {
    return {
        id: invitation._id,
        userIds: invitation.userIds,
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
        new mongodb.ObjectID(userId),
        new mongodb.ObjectID(opponentId)
    ];
    let users = await update('users', { _id: { $in: userIds } }, { $set: { state: 'INVITED' } });

    // create new invitation
    let invitation = await insert('invitations', {
        state: 'PENDING',
        userIds
    });
    
    return invitationJson(invitation);
}

export async function acceptInvitation(userId) {
    // Verify invitation is pending
    // update invitation status
    // update both users state
}

export async function rejectInvitation(userId) {
    // Verify invitation is pending
    // update invitation status
    // update both users state
}

export async function getInvitation(userId) {
    // find invitation if exists
    let invitation = await find('invitations', { query: { userIds: new mongodb.ObjectID(userId) } });

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    return invitationJson(invitation);
}