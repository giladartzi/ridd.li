import * as dataLayer from '../dataLayer';
import { broadcast } from '../wsManager';
import { WS_USER_ENTERED_LOUNGE, WS_USER_LEFT_LOUNGE, AVAILABLE, OFFLINE } from '../../common/consts';

function userJson(user) {
    return {
        id: user._id,
        username: user.username
    }
}

export async function availableUsers(exclude) {
    let users = await dataLayer.find('users', { query: {
        state: AVAILABLE
    }, list: true });

    users = users.filter(user => user._id.toString() !== exclude);

    return {
        users: users.map(user => userJson(user))
    };
}

export async function enter(userId) {
    let user = await dataLayer.findOneAndUpdate('users', userId, {
        $set: { state: AVAILABLE }
    });

    if (user) {
        broadcast({
            type: WS_USER_ENTERED_LOUNGE,
            payload: userJson(user)
        }, userId);
    }
    
    return await availableUsers(userId);
}

export async function offline(userId) {
    let user = await dataLayer.findOneAndUpdate('users', userId, {
        $set: { state: OFFLINE }
    });

    broadcast({
        type: WS_USER_LEFT_LOUNGE,
        payload: userJson(user)
    }, userId);
}