import { GAME_GET_ACTIONS, INVITATION_ACCEPT_ACTIONS, ANSWER_ACTIONS,
    WS_ADVANCE_GAME, WS_INVITATION_ACCEPTED } from '../../common/consts';
import { createApiReducer, composeReducers } from '../utils/utils';

const gameGet = createApiReducer(GAME_GET_ACTIONS);
const invitationAccept = createApiReducer(INVITATION_ACCEPT_ACTIONS);
const answer = createApiReducer(ANSWER_ACTIONS);

const pushHandler = (state = {}, action) => {
    switch (action.type) {
        case WS_ADVANCE_GAME:
        case WS_INVITATION_ACCEPTED:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
};

const game = composeReducers(gameGet, invitationAccept, answer, pushHandler);

export default game;