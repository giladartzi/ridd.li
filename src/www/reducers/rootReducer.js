import * as consts from '../../common/consts';
import { createApiReducer } from '../utils/utils';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import user from './userReducer';

const register = createApiReducer(consts.REGISTER_ACTIONS);
const authenticate = createApiReducer(consts.AUTHENTICATE_ACTIONS);
const lounge = createApiReducer(consts.LOUNGE_ENTER_ACTIONS);
const invitationGet = createApiReducer(consts.INVITATION_GET_ACTIONS);
const invitationSend = createApiReducer(consts.INVITATION_SEND_ACTIONS);

const invitation = (state, action) => {
    let halfway = invitationGet(state, action);
    return invitationSend(halfway, action);
};

const reducer = combineReducers({
    register,
    authenticate,
    lounge,
    invitation,
    user,
    routing: routerReducer
});

export default reducer;