import appConfig from '../app.json';

describe('app config', () => {
  it('keeps the iOS migration repository identity', () => {
    expect(appConfig.expo.name).toBe('DineralFlow-iOS');
    expect(appConfig.expo.scheme).toBe('dineralflowios');
  });
});
