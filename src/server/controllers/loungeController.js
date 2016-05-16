import * as dataLayer from '../dataLayer';
import { broadcast } from '../wsManager';
import without from 'lodash/without';
import first from 'lodash/first';
import { WS_USER_ENTERED_LOUNGE } from '../../common/consts';

function userJson(user) {
    return {
        id: user._id,
        username: user.username
    }
}

export async function availableUsers(exclude) {
    let users = await dataLayer.find('users', { query: {
        state: 'AVAILABLE'
    }, list: true });

    let userToExclude = first(users.filter(user => user._id.toString() === exclude));
    users = without(users, userToExclude);

    if (userToExclude) {
        broadcast({
            type: WS_USER_ENTERED_LOUNGE,
            payload: userJson(userToExclude)
        }, exclude);
    }

    return {
        users: users.map(user => userJson(user))
    };
}

export async function enter(userId) {
    await dataLayer.findOneAndUpdate('users', userId, {
        $set: { state: 'AVAILABLE' }
    });
    
    return await availableUsers(userId);
}