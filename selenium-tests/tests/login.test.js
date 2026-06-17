import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';

describe('Login Flow E2E Test', function () {
  this.timeout(20000);
  let driver;

  before(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless=new'); // Use headless mode for compatibility in GitHub Actions
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should enable mock auth, log in, and redirect to dashboard', async function () {
    // 1. Navigate to the login page
    await driver.get('http://localhost:8080/#/auth');

    // 2. Set the selenium mock auth flag in local storage
    await driver.executeScript(() => {
      localStorage.setItem('selenium-mock-auth', 'true');
    });

    // 3. Reload the page to apply the mock client
    await driver.navigate().refresh();

    // 4. Wait for the email input to be visible
    const emailInput = await driver.wait(until.elementLocated(By.id('email')), 10000);
    const passwordInput = await driver.findElement(By.id('password'));
    const loginButton = await driver.findElement(By.id('login-button'));

    // 5. Fill the login credentials
    await emailInput.sendKeys('test@example.com');
    await passwordInput.sendKeys('password123');

    // 6. Click the login button
    await loginButton.click();

    // 7. Wait until the URL changes to contain /dashboard
    await driver.wait(until.urlContains('dashboard'), 10000);

    // 8. Verify we successfully landed on the dashboard and mock user is rendered
    const welcomeHeading = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Mock User')]")),
      10000
    );
    assert.ok(welcomeHeading, 'Could not find welcome heading with text "Mock User"');
  });
});
