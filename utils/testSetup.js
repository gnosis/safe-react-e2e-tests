import puppeteer from 'puppeteer'
import * as dappeteer from '@dasanra/dappeteer'

import config from './config'
import { accountsSelectors } from './selectors/accounts'
import { topBar } from './selectors/topBar'
import { homePage } from './selectors/welcomePage'
import { generalInterface } from './selectors/generalInterface'
import { loadSafeForm } from './selectors/loadSafeForm'
import { assertElementPresent, clearInput, clickAndType, clickByText, clickElement } from './selectorsHelpers'

const importAccounts = async (metamask, privateKeys) => {
  console.log('<<Importing accounts>>')
  for (let i = 0; i < 1; i++) { // forEach doesn't work with async functions, you have to use a regular for()
    await metamask.importPK(privateKeys[i])
  }
}

const { SLOWMO, ENVIRONMENT, MNEMONIC, PRIVATE_KEY_GROUP, PASSWORD, TESTING_ENV, TESTING_SAFE_ADDRESS } = config

let envUrl
if (TESTING_ENV === 'PR') {
  const pullRequestNumber = process.env.PR
  if (!pullRequestNumber) {
    throw Error('You have to define PR env variable')
  }
  envUrl = ENVIRONMENT[TESTING_ENV.toUpperCase()](pullRequestNumber)
} else {
  envUrl = ENVIRONMENT[TESTING_ENV.toLowerCase()]
}

export const init = async () => {
  const browser = await dappeteer.launch(puppeteer, {
    defaultViewport: null, // this extends the page to the size of the browser
    slowMo: SLOWMO, // Miliseconds it will wait for every action performed. It's 1 by default. change it in the .env file
    args: ['--start-maximized', envUrl] // maximized browser, URL for the base page
  })

  const metamask = await dappeteer.getMetamask(browser, {
    seed: MNEMONIC,
    password: PASSWORD
  })

  await metamask.switchNetwork('rinkeby')
  const [gnosisPage, MMpage] = await browser.pages() // get a grip on both tabs
  // Reload Gnosis Safe to ensure Metamask info is loaded
  await gnosisPage.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] })

  gnosisPage.setDefaultTimeout(60000)
  MMpage.setDefaultTimeout(60000)

  return [
    browser,
    metamask,
    gnosisPage,
    MMpage
  ]
}

/**
 * This function returns a clean environment with one wallet already connected to Safe Multisig
 *
 * @param {boolean} importMultipleAccounts by default is false so only 1 accounts is imported to Metamask
 * if more than one account is needed this parameter should be used with `true`
 */
export const initWithWalletConnected = async (importMultipleAccounts = false) => {
  const [browser, metamask, gnosisPage, MMpage] = await init()

  if (importMultipleAccounts) {
    await importAccounts(metamask, PRIVATE_KEY_GROUP)
    await MMpage.waitForTimeout(1000)
  }

  await gnosisPage.bringToFront()
  // if (ENV !== ENVIRONMENT.local) { // for local env there is no Cookies to accept
  await clickElement(homePage.accept_cookies, gnosisPage)
  // }
  await clickElement(topBar.not_connected_network, gnosisPage)
  await clickElement(topBar.connect_btn, gnosisPage)
  await clickElement(homePage.metamask_option, gnosisPage) // Clicking the MM icon in the onboardjs

  // FIXME remove MMpage.reload() when updated version of dappeteer
  await MMpage.reload()
  // --- end of FIXME
  await metamask.approve({ allAccounts: true })
  await gnosisPage.bringToFront()

  await assertElementPresent(topBar.connected_network.selector, gnosisPage, 'css')

  return [
    browser,
    metamask,
    gnosisPage,
    MMpage
  ]
}

/**
 * This method returns a clean environment with a connected account and one imported Safe Multisig wallet.
 * With default configuration the connected account is an owner of the Safe
 *
 * @param {boolean} importMultipleAccounts by default is false so only 1 accounts is imported to Metamask
 * if more than one account is needed this parameter should be used with `true`
 */
export const initWithDefaultSafe = async (importMultipleAccounts = false) => {
  const [browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected(importMultipleAccounts)

  // Open load safe form
  await clickByText('p', 'Add existing Safe', gnosisPage)
  await assertElementPresent(loadSafeForm.form.selector, gnosisPage, 'css')
  await clickAndType(loadSafeForm.safe_name_field, gnosisPage, accountsSelectors.safeNames.load_safe_name)
  await clickAndType(loadSafeForm.safe_address_field, gnosisPage, TESTING_SAFE_ADDRESS)
  await clickElement(generalInterface.submit_btn, gnosisPage)

  // Second step, review owners
  await assertElementPresent(loadSafeForm.step_two.selector, gnosisPage, 'css')
  const keys = Object.keys(accountsSelectors.accountNames)
  for (let i = 0; i < 2/* keys.length */; i++) { // only names on the first 2 owners
    const ownerNameInput = loadSafeForm.owner_name(i)
    const name = accountsSelectors.accountNames[keys[i]]
    await clearInput(ownerNameInput, gnosisPage, 'css')
    await clickAndType(ownerNameInput, gnosisPage, name)
  }
  await clickElement(generalInterface.submit_btn, gnosisPage)

  // Third step, review information and submit
  await assertElementPresent(loadSafeForm.step_three.selector, gnosisPage, 'css')
  await gnosisPage.waitForTimeout(2000)
  await clickElement(generalInterface.submit_btn, gnosisPage)

  return [
    browser,
    metamask,
    gnosisPage,
    MMpage
  ]
}

/**
 * This method returns a clean environment with a connected account and one imported Safe Multisig wallet.
 * With default configuration the connected account is an owner of the Safe
 *
 * @param {boolean} importMultipleAccounts by default is false so only 1 accounts is imported to Metamask
 * if more than one account is needed this parameter should be used with `true`
 */
export const initWithDefaultSafeDirectNavigation = async (importMultipleAccounts = false) => {
  const [browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected(importMultipleAccounts)
  await gnosisPage.goto(envUrl + '#/safes/' + TESTING_SAFE_ADDRESS + "/balances")
  await gnosisPage.waitForTimeout(2000)

  return [
    browser,
    metamask,
    gnosisPage,
    MMpage
  ]
}
