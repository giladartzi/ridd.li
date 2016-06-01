import { getInvitation } from './invitationController';
import { game } from './gameController';
import { userJson } from './userController';
import { safeAwait } from '../utils/utils';

export async function sync(userId, displayName, email, picture, token) {
    return {
        invitation: await safeAwait(getInvitation(userId)),
        game: await safeAwait(game(userId)),
        user: userJson(userId, displayName, email, picture, token)
    };
}