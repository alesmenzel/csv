module.exports = {
  "parser": "@babel/eslint-parser",
  "env": {
    "es2021": true,
    "jest": true
  },
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "babelOptions": {
      "configFile": "./babel.config.json"
    }
  },
  "extends": [
    "airbnb-base",
    "prettier"
  ],
  "plugins": [
    "@babel"
  ],
  rules: {
    'no-continue': 0,
    'no-underscore-dangle': 0,
  }
}
