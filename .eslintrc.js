module.exports = {
  extends: ['@energyweb', 'plugin:import/recommended'],
  env: {
    mocha: true,
    es2021: true,
    node: true,
  },
  rules : {
    "import/no-unresolved": [
       1, 
       { "caseSensitive": false }
    ],
    "import/named": [
      1
    ]

 },
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.eslint.json', 'test/tsconfig.json'],
  },
 };