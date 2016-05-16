import { createApiReducer, composeReducers } from '../utils/utils';
import { INVITATION_GET_ACTIONS, INVITATION_SEND_ACTIONS, WS_INVITATION_RECEIVED, WS_INVITATION_CANCELLED } from '../../common/consts';

const invitationGet = createApiReducer(INVITATION_GET_ACTIONS);
const invitationSend = createApiReducer(INVITATION_SEND_ACTIONS);

const pushHandler = (state = {}, action) => {
    switch (action.type) {
        case WS_INVITATION_RECEIVED:
            return Object.assign({}, state, action.payload);
        case WS_INVITATION_CANCELLED:
            return Object.assign({}, state, { id: null });
        default:
            return state;
    }
};

const invitationReducer = composeReducers(invitationGet, invitationSend, pushHandler);
export default invitationReducer;