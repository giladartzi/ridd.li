import * as consts from '../../common/consts';
import { createApiReducer, composeReducers } from '../utils/utils';

const gameGet = createApiReducer(consts.GAME_GET_ACTIONS);
const invitationAccept = createApiReducer(consts.INVITATION_ACCEPT_ACTIONS);
const answer = createApiReducer(consts.ANSWER_ACTIONS);
const leaveGame = createApiReducer(consts.LEAVE_GAME_ACTIONS);

const pushHandler = (state = {}, action) => {
    switch (action.type) {
        case consts.WS_ADVANCE_GAME:
        case consts.WS_INVITATION_ACCEPTED:
        case consts.WS_GAME_STATE_CHANGE:
            return Object.assign({}, state, action.payload);
        case consts.LOG_IN_SUCCESS:
        case consts.FB_LOG_IN_SUCCESS:
            return Object.assign({}, state, action.payload.game);
        default:
            return state;
    }
};

const game = composeReducers(gameGet, invitationAccept, answer, leaveGame, pushHandler);

export default game;