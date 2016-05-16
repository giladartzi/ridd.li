import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { restApiMiddleware } from '../utils/utils';
import rootReducer from '../reducers/rootReducer';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import { get } from '../../common/rest';
import { INVITATION_GET_SUCCESS, GAME_GET_SUCCESS } from '../../common/consts';

const logger = createLogger();
const routerMw = routerMiddleware(browserHistory);

export default async function configureStore() {
    const middleware = applyMiddleware(restApiMiddleware, routerMw, thunk, logger);
    const store = createStore(rootReducer, middleware);

    const initialState = localStorage.token ? (await get('/sync')).json : null;

    if (initialState) {
        store.dispatch({ type: INVITATION_GET_SUCCESS, payload: initialState.invitation });
        store.dispatch({ type: GAME_GET_SUCCESS, payload: initialState.game });
    }

    return store;
}