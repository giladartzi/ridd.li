require('babel-register');
require("babel-polyfill");

var toRequire = 'server';

if (process.argv[2] === 'syncDb') {
    toRequire = 'syncDb';
}

if (process.argv[2] === 'tests') {
    toRequire = 'tests';
}

require('./' + toRequire);