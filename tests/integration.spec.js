module.exports = {
  "JayData" : function (browser) {
    browser
      .url("http://localhost:53999/test.html")
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('#qunit-testresult .passed', 999999)
      .assert.containsText('#qunit-testresult .total', '20650')
      .assert.containsText('#qunit-testresult .passed', '20647')
      .end();
  }
};