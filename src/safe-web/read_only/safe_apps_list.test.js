import {
  assertElementNotPresent,
  assertElementPresent,
  assertTextPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getInnerText,
} from '../../../utils/selectorsHelpers'
import { getEnvUrl, initNoWalletConnection } from '../../../utils/testSetup'
import config from '../../../utils/config'
import { safeAppsList } from '../../../utils/selectors/safeAppsList'

/*
Safe Apps List
-- Shows the Safe Apps List
-- Opens a Safe Apps
-- Search by Safe Apps title and description
-- Adds a Bookmarked Safe Apps
-- Adds a Custom Safe Apps
*/

let browser
let gnosisPage

const { TESTING_SAFE_ADDRESS, NETWORK_ADDRESS_PREFIX } = config

beforeAll(async () => {
  ;[browser, gnosisPage] = await initNoWalletConnection()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Safe Apps List', () => {
  test('Safe Apps List', async () => {
    console.log('Safe Apps List')
    const safeAppsListUrl = `${getEnvUrl()}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/apps`

    await gnosisPage.goto(safeAppsListUrl)

    console.log('Shows Bookmarked Apps Section')
    await assertTextPresent(safeAppsList.bookmarkedSafeAppsSection, 'BOOKMARKED APPS', gnosisPage)

    console.log('Shows All Apps Section')
    await assertElementPresent(safeAppsList.allSafeAppsSection, gnosisPage)

    console.log('Opens a Safe App')
    await clickElement(safeAppsList.getSafeAppByTitle('WalletConnect'), gnosisPage)

    console.log('Shows Disclaimer and clicks on accept')
    await assertElementPresent(safeAppsList.disclaimerTitleSafeAppPopUp, gnosisPage)
    expect(await getInnerText(safeAppsList.disclaimerTitleSafeAppPopUp, gnosisPage)).toBe('Disclaimer')
    await clickElement(safeAppsList.acceptDisclaimerButton, gnosisPage)

    console.log('Loads Safe Apps in an iframe')
    await assertElementPresent(safeAppsList.getSafeAppIframeByTitle('WalletConnect'), gnosisPage)

    await gnosisPage.goto(safeAppsListUrl, { waitUntil: ['networkidle0', 'domcontentloaded'] })

    console.log('Pins Safe Apps')
    // WalletConnect Safe App is not bookmarked
    await assertElementNotPresent(safeAppsList.getBookmarkedSafeApp('WalletConnect'), gnosisPage)
    // we add WalletConnect Safe App to bookmarked section
    await clickElement(safeAppsList.getPinSafeAppButton('WalletConnect'), gnosisPage)
    await assertElementPresent(safeAppsList.getBookmarkedSafeApp('WalletConnect'), gnosisPage)

    console.log('Refresh the page should keep the Bookmarked Safe Apps')
    await gnosisPage.goto(safeAppsListUrl, { waitUntil: ['networkidle0', 'domcontentloaded'] })
    await assertElementPresent(safeAppsList.getBookmarkedSafeApp('WalletConnect'), gnosisPage)

    console.log('Unpins Safe Apps')
    await clickElement(safeAppsList.getUnpinSafeAppButton('WalletConnect'), gnosisPage)
    await assertElementNotPresent(safeAppsList.getBookmarkedSafeApp('WalletConnect'), gnosisPage)

    console.log('Searches by Safe App Title')
    await assertElementPresent(safeAppsList.searchInput, gnosisPage)
    await assertElementPresent(safeAppsList.getSafeAppByTitle('WalletConnect'), gnosisPage)
    await assertElementPresent(safeAppsList.getSafeAppByTitle('Compound'), gnosisPage)
    const searchByAppTitle = 'walletCon'
    await clickAndType(safeAppsList.searchInput, gnosisPage, searchByAppTitle)
    await assertElementPresent(safeAppsList.getSafeAppByTitle('WalletConnect'), gnosisPage)
    await assertElementNotPresent(safeAppsList.getSafeAppByTitle('Compound'), gnosisPage)

    console.log('Searches by Safe App Description')
    await clearInput(safeAppsList.searchInput, gnosisPage)
    await assertElementPresent(safeAppsList.getSafeAppByTitle('WalletConnect'), gnosisPage)
    await assertElementPresent(safeAppsList.getSafeAppByTitle('Compound'), gnosisPage)
    const searchByAppDescription = 'Connect your Safe to any dApp'
    await clickAndType(safeAppsList.searchInput, gnosisPage, searchByAppDescription)
    await assertElementPresent(safeAppsList.getSafeAppByTitle('WalletConnect'), gnosisPage)
    await assertElementNotPresent(safeAppsList.getSafeAppByTitle('Compound'), gnosisPage)

    // clear input to show all sections again
    await clearInput(safeAppsList.searchInput, gnosisPage)

    console.log('Shows the add custom Safe Apps form')
    await clickByText(safeAppsList.addCustomSafeAppButton.selector, 'Add custom app', gnosisPage)
    await assertElementPresent(safeAppsList.addCustomAppForm, gnosisPage)

    console.log('Populates the custom the Safe App url and name')
    const customAppUrl = 'https://ipfs.io/ipfs/QmfMq8NgxdDfai1qKv7bGbT8DegYX4mNzmpi9AkY1VJZBS/'
    const customAppName = 'Safe Test App'
    await clickAndType(safeAppsList.addCustomAppUrlInput, gnosisPage, customAppUrl)
    await assertElementPresent(safeAppsList.addCustomAppLogo, gnosisPage)
    await gnosisPage.waitForTimeout(2000) // We have some lag issues in this step for CI
    expect(await getInnerText(safeAppsList.addCustomAppNameInput, gnosisPage)).toBe(customAppName)

    console.log('"Add Custom Safe App" button should be disabled if the checkbox is unchecked')
    const addCustomAppFromButton = await gnosisPage.waitForSelector(safeAppsList.addCustomAppFromButton.selector)
    expect(await addCustomAppFromButton.evaluate((node) => node.disabled)).toBe(true)
    await clickElement(safeAppsList.addCustomAppCheckbox, gnosisPage)
    expect(await addCustomAppFromButton.evaluate((node) => node.disabled)).toBe(false)

    console.log('Adds a custom Safe Apps')
    await clickElement(safeAppsList.addCustomAppFromButton, gnosisPage)

    console.log('Loads the Custom App in an iframe')
    await assertElementPresent(safeAppsList.getSafeAppIframeByUrl(customAppUrl), gnosisPage)

    console.log('Shows the Custom Safe App in the Apps List')
    await gnosisPage.goto(safeAppsListUrl)
    await assertElementPresent(safeAppsList.customSafeAppLogo, gnosisPage)

    console.log('Validates the custom Safe App Url')
    await clickByText(safeAppsList.addCustomSafeAppButton.selector, 'Add custom app', gnosisPage)
    const invalidSafeAppUrl = 'this is an invalid safe app url'
    await clickAndType(safeAppsList.addCustomAppUrlInput, gnosisPage, invalidSafeAppUrl)
    await gnosisPage.waitForTimeout(1000)
    await assertTextPresent(safeAppsList.addCustomAppUrlErrorLabel, 'Invalid URL', gnosisPage)

    console.log('Validates if the Custom Safe App was already added')
    const alreadyAddedSafeAppError = 'This app is already registered.'
    await clearInput(safeAppsList.addCustomAppUrlInput, gnosisPage)
    await clickAndType(safeAppsList.addCustomAppUrlInput, gnosisPage, customAppUrl)
    await gnosisPage.waitForTimeout(1000)
    await assertTextPresent(safeAppsList.addCustomAppUrlErrorLabel, alreadyAddedSafeAppError, gnosisPage)
    await clickElement(safeAppsList.closePopupIcon, gnosisPage)
    await assertElementNotPresent(safeAppsList.addCustomAppForm, gnosisPage)

    console.log('Removes a Custom Safe App')
    await gnosisPage.waitForTimeout(1000) // In CI we try to click before button can be clicked
    await clickElement(safeAppsList.removeCustomSafeAppButton, gnosisPage)
    // shows the confirmation popup
    await assertElementPresent(safeAppsList.removeCustomSafeAppPopup, gnosisPage)
    await clickElement(safeAppsList.confirmRemoveCustomSafeAppButton, gnosisPage)
    await assertElementNotPresent(safeAppsList.customSafeAppLogo, gnosisPage)
  }, 180000)
})
