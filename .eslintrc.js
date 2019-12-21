module.exports = {
    root: true,
    env: {
      node: true,
    },
    extends: [
      'airbnb-base',
    ],
    rules: {
      "prefer-const": "error",
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  };
  