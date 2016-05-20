import * as consts from '../../common/consts';
import { createApiReducer } from '../utils/utils';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import user from './userReducer';
import lounge from './loungeReducer';
import invitation from './invitationReducer';
import game from './gameReducer';

const signUp = createApiReducer(consts.SIGN_UP_ACTIONS);
const logIn = createApiReducer(consts.LOG_IN_ACTIONS);
const answer = createApiReducer(consts.ANSWER_ACTIONS);

const reducer = combineReducers({
    signUp,
    logIn,
    lounge,
    invitation,
    user,
    game,
    answer,
    routing: routerReducer
});

export default reducer;