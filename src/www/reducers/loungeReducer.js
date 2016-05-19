import { createApiReducer, composeReducers } from '../utils/utils';
import { LOUNGE_ENTER_ACTIONS, WS_USER_ENTERED_LOUNGE, WS_USER_LEFT_LOUNGE } from '../../common/consts';
import first from 'lodash/first';
import without from 'lodash/without';

const lounge = createApiReducer(LOUNGE_ENTER_ACTIONS);

const pushHandler = (state = {}, action) => {
    let exists;

    switch (action.type) {
        case WS_USER_ENTERED_LOUNGE:
            exists = state.users.filter(user => user.id === action.payload.id).length > 0;

            if (exists) {
                return state;
            }
            else {
                return Object.assign({}, state, { users: [...state.users, action.payload] });
            }
        case WS_USER_LEFT_LOUNGE:
            exists = first(state.users.filter(user => user.id === action.payload.id));
            
            if (exists) {
                return Object.assign({}, state, { users: without(state.users, exists) });
            }
            else {
                return state;
            }
        default:
            return state;
    }
};

const loungeReducer = composeReducers(lounge, pushHandler);
export default loungeReducer;