import { getInvitation } from './invitationController';
import { game } from './gameController';
import { userJson } from './userController';
import { safeAwait } from '../utils/utils';

export async function sync(userId, username, token) {
    return {
        invitation: await safeAwait(getInvitation(userId)),
        game: await safeAwait(game(userId)),
        user: userJson(userId, username, token)
    };
}