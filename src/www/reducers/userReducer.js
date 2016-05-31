import { createApiReducer, composeReducers } from '../utils/utils';
import { SIGN_UP_SUCCESS, LOG_IN_ACTIONS } from '../../common/consts';

const logInReducer = createApiReducer(LOG_IN_ACTIONS, {}, 'user');

export default function signUpReducer(state = {}, action) {
    switch (action.type) {
        case SIGN_UP_SUCCESS:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

const userReducer = composeReducers(logInReducer, signUpReducer);

export default userReducer;