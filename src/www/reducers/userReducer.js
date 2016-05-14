import { REGISTER_SUCCESS, AUTHENTICATE_SUCCESS } from '../../common/consts';

export default function userReducer(state = {}, action) {
    switch (action.type) {
        case REGISTER_SUCCESS:
        case AUTHENTICATE_SUCCESS:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}