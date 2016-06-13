import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import * as ws from './utils/ws';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import routes from './utils/routes';

import fetch from 'isomorphic-fetch';

require('./style.css');

function validateToken(nextState, replace) {
    // if (!localStorage.token) {
    //     replace('/');
    // }
}

function validateNonToken(nextState, replace) {
    // if (localStorage.token) {
    //     replace('/lounge');
    // }
}

function validateGame(getState, nextState, replace) {
    // if (!localStorage.token) {
    //     replace('/');
    // }
    // else if (!getState().game.gameId) {
    //     replace('/lounge');
    // }
}

(async function () {
    const store = await configureStore();
    const history = syncHistoryWithStore(browserHistory, store);
    ws.init(store);
    injectTapEventPlugin();

    const muiTheme = getMuiTheme();

    const node = (
        <Provider store={store}>
            <MuiThemeProvider muiTheme={muiTheme}>
                <Router routes={routes} history={history} />
            </MuiThemeProvider>
        </Provider>
    );

    ReactDOM.render(node, document.getElementById('riddliApp'));
})();

if (!babelPolyfill) {
    console.log('Error loading babel polyfill');
}