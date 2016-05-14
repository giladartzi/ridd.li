import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { restApiMiddleware } from './utils/utils';
import rootReducer from './reducers/rootReducer';

import RegisterForm from './components/RegisterForm';
import AuthenticateForm from './components/AuthenticateForm';

const logger = createLogger();
const store = createStore(rootReducer, applyMiddleware(restApiMiddleware, thunk, logger));
const node = (
    <Provider store={store}>
        <div>
            <RegisterForm />
            <AuthenticateForm />
        </div>
    </Provider>
);

ReactDOM.render(node, document.getElementById('riddliApp'));

if (!babelPolyfill) {
    console.log('Error loading babel polyfill');
}