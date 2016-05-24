require('babel-register', {
    sourceMap: 'inline',
    compact: false
});
require('babel-polyfill');
require('isomorphic-fetch');

var toRequire = 'server';

if (process.argv[2] === 'syncDb') {
    toRequire = 'syncDb';
}

if (process.argv[2] === 'tests') {
    toRequire = 'tests/tests';
}

if (process.argv[2] === 'rule') {
    toRequire = 'tests/ruleTest.js';
}

require('./' + toRequire);