import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import * as ws from './utils/ws';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {deepOrange500} from 'material-ui/styles/colors';
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

(async function () {
    const store = await configureStore();
    const history = syncHistoryWithStore(browserHistory, store);
    ws.init(store);
    injectTapEventPlugin();

    const muiTheme = getMuiTheme({
        palette: {
            accent1Color: deepOrange500
        }
    });

    const node = (
        <Provider store={store}>
            <MuiThemeProvider muiTheme={muiTheme}>
                <Router history={history}>
                    <Route path="/" component={Layout}>
                        <Route path="/register" component={RegisterForm} />
                        <Route path="/login" component={AuthenticateForm} />
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