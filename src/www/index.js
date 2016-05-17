import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import * as ws from './utils/ws';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Layout from './components/Layout';
import RegisterForm from './components/RegisterForm';
import AuthenticateForm from './components/AuthenticateForm';
import Lounge from './components/Lounge';
import Game from './components/Game';

require('./style.css');

function validateToken(nextState, replace) {
    if (!localStorage.token) {
        replace('/');
    }
}

function validateNonToken(nextState, replace) {
    if (localStorage.token) {
        replace('/lounge');
    }
}

(async function () {
    const store = await configureStore();
    const history = syncHistoryWithStore(browserHistory, store);
    ws.init(store);
    injectTapEventPlugin();

    const muiTheme = getMuiTheme();

    console.log(muiTheme);

    const node = (
        <Provider store={store}>
            <MuiThemeProvider muiTheme={muiTheme}>
                <Router history={history}>
                    <Route path="/" component={Layout}>
                        <IndexRoute component={RegisterForm} onEnter={validateNonToken} />
                        <Route path="/login" component={AuthenticateForm} onEnter={validateNonToken} />
                        <Route path="/lounge" component={Lounge} onEnter={validateToken} />
                        <Route path="/game" component={Game} onEnter={validateToken} />
                    </Route>
                </Router>
            </MuiThemeProvider>
        </Provider>
    );

    ReactDOM.render(node, document.getElementById('riddliApp'));
})();

if (!babelPolyfill) {
    console.log('Error loading babel polyfill');
}