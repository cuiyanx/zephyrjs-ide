describe('App', () => {

  beforeEach( () => {
    browser.get('/');
  });

  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('Zephyr.js IDE');
  });

  it('should have <nav>', () => {
    expect(element(by.css('sd-app sd-navbar nav')).isPresent()).toEqual(true);
  });

  it('should have correct nav text for About', () => {
    expect(element(by.css('sd-app sd-navbar nav a:nth-child(2)')).getText()).toEqual('About');
  });

});
