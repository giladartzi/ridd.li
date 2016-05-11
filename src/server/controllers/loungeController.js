import * as dataLayer from '../dataLayer';
import mongodb from 'mongodb';

export async function availableUsers(exclude) {
    let users = await dataLayer.find('users', { query: {
        state: 'AVAILABLE',
        _id: { $ne: new mongodb.ObjectID(exclude) }
    }, list: true });

    return users.map(user => {
        return {
            id: user._id,
            username: user.username
        }
    });
}

export async function enter(userId) {
    await dataLayer.findOneAndUpdate('users', userId, {
        $set: { state: 'AVAILABLE' }
    });
    
    return await availableUsers(userId);
}