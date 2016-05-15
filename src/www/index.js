import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { restApiMiddleware } from './utils/utils';
import rootReducer from './reducers/rootReducer';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

import Layout from './components/Layout';
import RegisterForm from './components/RegisterForm';
import AuthenticateForm from './components/AuthenticateForm';
import Lounge from './components/Lounge';

function onLoungeEnter(nextState, replace) {
    if (!localStorage.token) {
        replace('/');
    }
}

const logger = createLogger();
const routerMw = routerMiddleware(browserHistory);
const store = createStore(rootReducer, applyMiddleware(restApiMiddleware, routerMw, thunk, logger));
const history = syncHistoryWithStore(browserHistory, store);


const node = (
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={Layout}>
                <Route path="/register" component={RegisterForm} />
                <Route path="/login" component={AuthenticateForm} />
                <Route path="/lounge" component={Lounge} onEnter={onLoungeEnter} />
            </Route>
        </Router>
    </Provider>
);

ReactDOM.render(node, document.getElementById('riddliApp'));

if (!babelPolyfill) {
    console.log('Error loading babel polyfill');
}