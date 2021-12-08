import puppeteer from 'puppeteer'
import * as dappeteer from '@dasanra/dappeteer'

import config from './config'
import { accountsSelectors } from './selectors/accounts'
import { topBar } from './selectors/topBar'
import { homePage } from './selectors/welcomePage'
import { generalInterface } from './selectors/generalInterface'
import { loadSafeForm } from './selectors/loadSafeForm'
import { assertElementPresent, clearInput, clickAndType, clickByText, clickElement } from './selectorsHelpers'
import { getShortNameAddress } from './addresses'

const importAccounts = async (metamask, privateKeys) => {
  console.log('<<Importing accounts>>')
  for (let i = 0; i < 1; i++) {
    // forEach doesn't work with async functions, you have to use a regular for()
    await metamask.importPK(privateKeys[i])
  }
}

const {
  SLOWMO,
  ENVIRONMENT,
  MNEMONIC,
  NETWORK_NAME,
  PRIVATE_KEY_GROUP,
  PASSWORD,
  PUPPETEER_EXEC_PATH,
  TESTING_ENV,
  TESTING_SAFE_ADDRESS,
} = config

export const getEnvUrl = () => {
  if (TESTING_ENV === 'PR') {
    const pullRequestNumber = process.env.PR
    if (!pullRequestNumber) {
      throw Error('You have to define PR env variable')
    }
    return ENVIRONMENT[TESTING_ENV.toUpperCase()](pullRequestNumber)
  } else {
    return ENVIRONMENT[TESTING_ENV.toLowerCase()]
  }
}
const envUrl = getEnvUrl()

export const init = async () => {
  const browser = await dappeteer.launch(puppeteer, {
    executablePath: PUPPETEER_EXEC_PATH,
    defaultViewport: null, // this extends the page to the size of the browser
    slowMo: SLOWMO, // Miliseconds it will wait for every action performed. It's 1 by default. change it in the .env file
    args: ['--no-sandbox', '--start-maximized', envUrl], // maximized browser, URL for the base page
  })

  const metamask = await dappeteer.getMetamask(browser, {
    seed: MNEMONIC,
    password: PASSWORD,
  })

  await metamask.switchNetwork(NETWORK_NAME.toLowerCase())
  const [gnosisPage, MMpage] = await browser.pages() // get a grip on both tabs
  // Reload Gnosis Safe to ensure Metamask info is loaded
  // After l2-ux we have to navigate to the network selection URL to ensure we are in the correct one
  await gnosisPage.goto(`${envUrl}${NETWORK_NAME.toLowerCase()}`, { waitUntil: ['networkidle0', 'domcontentloaded'] })

  gnosisPage.setDefaultTimeout(600000)

  return {
    browser,
    metamask,
    gnosisPage,
    MMpage,
  }
}

/**
 * This function returns a clean environment with one wallet already connected to Safe Multisig
 *
 * @param {boolean} importMultipleAccounts by default is false so only 1 accounts is imported to Metamask
 * if more than one account is needed this parameter should be used with `true`
 */
export const initWithWalletConnected = async (importMultipleAccounts = false) => {
  const { browser, metamask, gnosisPage, MMpage } = await init()

  try {
    if (importMultipleAccounts) {
      await importAccounts(metamask, PRIVATE_KEY_GROUP)
      await MMpage.waitForTimeout(1000)
    }

    await gnosisPage.bringToFront()
    await clickElement(homePage.accept_cookies, gnosisPage)
    await clickElement(topBar.not_connected_network, gnosisPage)
    await clickElement(topBar.connect_btn, gnosisPage)
    await clickElement(homePage.metamask_option, gnosisPage) // Clicking the MM icon in the onboardjs

    // FIXME remove MMpage.reload() when updated version of dappeteer
    await MMpage.reload()
    // --- end of FIXME
    await metamask.approve({ allAccounts: true })
    await gnosisPage.bringToFront()

    await assertElementPresent(topBar.connected_network, gnosisPage)

    return [browser, metamask, gnosisPage]
  } catch {
    // There was a problem initializing the environment
    // we weren't able to connect the wallet
    // This is specially useful to avoid infinite testing in CI when having problems in this step
    browser.close()
    throw new Error('Error trying to initWithWalletConnected')
  }
}

/**
 * This method returns a clean environment with a connected account and one imported Safe Multisig wallet.
 * With default configuration the connected account is an owner of the Safe
 *
 * @param {boolean} importMultipleAccounts by default is false so only 1 accounts is imported to Metamask
 * if more than one account is needed this parameter should be used with `true`
 */
export const initWithDefaultSafe = async (importMultipleAccounts = false) => {
  const [browser, metamask, gnosisPage] = await initWithWalletConnected(importMultipleAccounts)

  // Open load safe form
  await clickByText('a', 'Add existing Safe', gnosisPage)
  await assertElementPresent(loadSafeForm.form, gnosisPage)
  // First step, we select the desired network
  await clickByText("div[role='button'] > span", NETWORK_NAME, gnosisPage)
  await clickElement(generalInterface.submit_btn, gnosisPage)
  // Second step, select safe address and name
  await clickAndType(loadSafeForm.safe_name_field, gnosisPage, accountsSelectors.safeNames.load_safe_name)
  await clickAndType(loadSafeForm.safe_address_field, gnosisPage, TESTING_SAFE_ADDRESS)
  await assertElementPresent(loadSafeForm.valid_address, gnosisPage)
  await clickElement(generalInterface.submit_btn, gnosisPage)

  // Third step, review owners
  await assertElementPresent(loadSafeForm.safe_owners_step, gnosisPage)
  const keys = Object.keys(accountsSelectors.accountNames)
  for (let i = 0; i < 2 /* keys.length */; i++) {
    // only names on the first 2 owners
    const ownerNameInput = loadSafeForm.owner_name(i)
    const name = accountsSelectors.accountNames[keys[i]]
    await clearInput(ownerNameInput, gnosisPage)
    await clickAndType(ownerNameInput, gnosisPage, name)
  }
  await clickElement(generalInterface.submit_btn, gnosisPage)

  // Fourth step, review information and submit
  await assertElementPresent(loadSafeForm.step_three, gnosisPage)
  await gnosisPage.waitForTimeout(2000)
  await clickElement(generalInterface.submit_btn, gnosisPage)

  return [browser, metamask, gnosisPage]
}

/**
 * This method returns a clean environment with a connected account and one imported Safe Multisig wallet.
 * With default configuration the connected account is an owner of the Safe
 *
 * @param {boolean} importMultipleAccounts by default is false so only 1 accounts is imported to Metamask
 * if more than one account is needed this parameter should be used with `true`
 */
export const initWithDefaultSafeDirectNavigation = async (importMultipleAccounts = false) => {
  const [browser, metamask, gnosisPage] = await initWithWalletConnected(importMultipleAccounts)
  await gnosisPage.goto(`${envUrl}${getShortNameAddress(TESTING_SAFE_ADDRESS)}/balances`, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  })
  await gnosisPage.waitForTimeout(2000)

  return [browser, metamask, gnosisPage]
}

/**
 * This method is for read only tests, were no wallet connection is necessary.
 */
export const initNoWalletConnection = async () => {
  const browser = await dappeteer.launch(puppeteer, {
    executablePath: PUPPETEER_EXEC_PATH,
    defaultViewport: null, // this extends the page to the size of the browser
    slowMo: SLOWMO, // Miliseconds it will wait for every action performed. It's 1 by default. change it in the .env file
    args: ['--no-sandbox', '--start-maximized', envUrl], // maximized browser, URL for the base page
  })

  const [gnosisPage] = await browser.pages() // get a grip on the current tab
  await gnosisPage.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] })
  await gnosisPage.goto(`${envUrl}${getShortNameAddress(TESTING_SAFE_ADDRESS)}/balances`)
  await gnosisPage.bringToFront()

  gnosisPage.setDefaultTimeout(60000)

  return [browser, gnosisPage]
}

export const initHeadlessConnection = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--start-maximized',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  })

  const gnosisPage = await browser.newPage()

  return [browser, gnosisPage]
}
