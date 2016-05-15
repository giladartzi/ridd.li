import { getInvitation } from './invitationController';
import { game } from './gameController';
import { safeAwait } from '../utils/utils';

export async function sync(userId) {
    return {
        invitation: await safeAwait(getInvitation(userId)),
        game: await safeAwait(game(userId))
    };
}