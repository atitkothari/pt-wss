module.exports = {
  getAuth: () => ({
    verifyIdToken: () => Promise.resolve({ uid: 'test-uid' }),
  }),
};
