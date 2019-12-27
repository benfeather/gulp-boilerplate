module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'commonjs': true,
        'es6': true,
        'jquery': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2019
    },
    'rules': {
    }
};