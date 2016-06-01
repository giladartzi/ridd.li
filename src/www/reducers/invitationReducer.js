import { createApiReducer, composeReducers } from '../utils/utils';
import * as consts from '../../common/consts';

const invitationGet = createApiReducer(consts.INVITATION_GET_ACTIONS);
const invitationSend = createApiReducer(consts.INVITATION_SEND_ACTIONS);
const invitationCancel = createApiReducer(consts.INVITATION_CANCEL_ACTIONS);
const invitationReject = createApiReducer(consts.INVITATION_REJECT_ACTIONS);

const emptyInvitation = {
    id: null,
    state: null
};

const pushHandler = (state = {}, action) => {
    switch (action.type) {
        case consts.WS_INVITATION_RECEIVED:
        case consts.WS_INVITATION_CANCELLED:
        case consts.WS_INVITATION_REJECTED:
            return Object.assign({}, state, action.payload);
        case consts.WS_INVITATION_ACCEPTED:
        case consts.INVITATION_ACCEPT_SUCCESS:
            return Object.assign({}, state, emptyInvitation);
        case consts.LOG_IN_SUCCESS:
        case consts.FB_LOG_IN_SUCCESS:
            return Object.assign({}, state, action.payload.invitation);
        default:
            return state;
    }
};

const invitationReducer = composeReducers(invitationGet, invitationSend,
    invitationCancel, invitationReject, pushHandler);

export default invitationReducer;