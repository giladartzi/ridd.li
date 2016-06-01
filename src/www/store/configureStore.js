import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { restApiMiddleware } from '../utils/utils';
import rootReducer from '../reducers/rootReducer';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import { get } from '../../common/rest';
import { LOG_IN_SUCCESS } from '../../common/consts';

const logger = createLogger();
const routerMw = routerMiddleware(browserHistory);

export default async function configureStore() {
    const middleware = applyMiddleware(restApiMiddleware, routerMw, thunk, logger);
    const store = createStore(rootReducer, middleware);

    // Make sure store is created with the initial data.
    const initialState = localStorage.token ? (await get('/sync')).json : null;

    if (initialState) {
        store.dispatch({ type: LOG_IN_SUCCESS, payload: initialState });
    }

    return store;
}