import { SIGN_UP_SUCCESS, LOG_IN_SUCCESS } from '../../common/consts';

export default function userReducer(state = {}, action) {
    switch (action.type) {
        case SIGN_UP_SUCCESS:
        case LOG_IN_SUCCESS:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}