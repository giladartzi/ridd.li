import React from 'react';
import ReactDOM from 'react-dom';
import babelPolyfill from 'babel-polyfill';

import Form from './Form';

ReactDOM.render(<Form />, document.getElementById('riddliApp'));

import { get } from '../common/rest';

(async function () {
    var res = await get('/invitation');
    console.log(res);
})();

if (!babelPolyfill) {
    console.log('Error loading babel polyfill');
}