import { createApiReducer, composeReducers } from '../utils/utils';
import { INVITATION_GET_ACTIONS, INVITATION_SEND_ACTIONS, INVITATION_CANCEL_ACTIONS,
    INVITATION_REJECT_ACTIONS, WS_INVITATION_ACCEPTED, WS_INVITATION_RECEIVED,
    WS_INVITATION_CANCELLED, WS_INVITATION_REJECTED, INVITATION_ACCEPT_SUCCESS } from '../../common/consts';

const invitationGet = createApiReducer(INVITATION_GET_ACTIONS);
const invitationSend = createApiReducer(INVITATION_SEND_ACTIONS);
const invitationCancel = createApiReducer(INVITATION_CANCEL_ACTIONS);
const invitationReject = createApiReducer(INVITATION_REJECT_ACTIONS);

const emptyInvitation = {
    id: null,
    state: null
};

const pushHandler = (state = {}, action) => {
    switch (action.type) {
        case WS_INVITATION_RECEIVED:
        case WS_INVITATION_CANCELLED:
        case WS_INVITATION_REJECTED:
            return Object.assign({}, state, action.payload);
        case WS_INVITATION_ACCEPTED:
        case INVITATION_ACCEPT_SUCCESS:
            return Object.assign({}, state, emptyInvitation);
        default:
            return state;
    }
};

const invitationReducer = composeReducers(invitationGet, invitationSend,
    invitationCancel, invitationReject, pushHandler);

export default invitationReducer;