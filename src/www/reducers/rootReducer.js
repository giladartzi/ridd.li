import { REGISTER_ACTIONS, AUTHENTICATE_ACTIONS } from '../../common/consts';
import { createApiReducer } from '../utils/utils';
import { combineReducers } from 'redux';

import user from './userReducer';

const register = createApiReducer(REGISTER_ACTIONS);
const authenticate = createApiReducer(AUTHENTICATE_ACTIONS);

const reducer = combineReducers({
    register,
    authenticate,
    user
});

export default reducer;