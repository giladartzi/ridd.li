import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';

import Layout from './components/Layout';
import RegisterForm from './components/RegisterForm';
import AuthenticateForm from './components/AuthenticateForm';
import Lounge from './components/Lounge';

function onLoungeEnter(nextState, replace) {
    if (!localStorage.token) {
        replace('/');
    }
}

(async function () {
    const store = await configureStore();
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
})();

if (!babelPolyfill) {
    console.log('Error loading babel polyfill');
}