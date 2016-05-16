import { createApiReducer, composeReducers } from '../utils/utils';
import { LOUNGE_ENTER_ACTIONS, WS_USER_ENTERED_LOUNGE } from '../../common/consts';

const lounge = createApiReducer(LOUNGE_ENTER_ACTIONS);

const pushHandler = (state = {}, action) => {
    switch (action.type) {
        case WS_USER_ENTERED_LOUNGE:
            let exists = state.users.filter(user => user.id === action.payload.id).length > 0;

            if (exists) {
                return state;
            }
            else {
                return Object.assign({}, state, { users: [...state.users, action.payload] });
            }
        default:
            return state;
    }
};

const loungeReducer = composeReducers(lounge, pushHandler);
export default loungeReducer;