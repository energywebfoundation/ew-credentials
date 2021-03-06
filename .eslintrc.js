module.exports = {
  extends: ['@energyweb', 'plugin:import/recommended'],
  env: {
    mocha: true,
    es2021: true,
    node: true,
  },
  rules: {
    'import/no-unresolved': [1, { caseSensitive: false }],
    'import/named': [1],
    'no-constant-condition': ['error', { checkLoops: false }],
  },
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.eslint.json', 'test/tsconfig.json'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
