import { getInvitation } from './invitationController';
import { game } from './gameController';
import { userJson } from './userController';
import { safeAwait } from '../utils/utils';

export async function getSync(userId, params, userData, token) {
    return await sync(userId, userData.displayName, userData.email, userData.picture, token);
}

export async function sync(userId, displayName, email, picture, token) {
    // Unify invitation, game and user into a single call.
    // Used to sync the client's store on entering the system/refresh
    return {
        invitation: await safeAwait(getInvitation(userId)),
        game: await safeAwait(game(userId)),
        user: userJson(userId, displayName, email, picture, token)
    };
}