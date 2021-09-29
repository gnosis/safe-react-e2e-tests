import { assertElementPresent, isTextPresent, clickByText, clickElement } from '../utils/selectorsHelpers'
import { initNoWalletConnection } from '../utils/testSetup'
import {
  ADDRESSBOOK_KEY,
  ADDRESSBOOK_VALUES,
  SAFES_KEY,
  SAFES_VALUES,
  APPS_KEY,
  APPS_VALUES,
} from '../utils/files/LocalStorageConstants'

/*
Local Storage
-- Populates the local storage with safes on the sidebar, addresses in the address book, and custom apps
-- Validate safes in the sidebar
-- Validate addresses in the address book
-- Validate apps present in the "apps" tab
*/

let browser
let gnosisPage

beforeAll(async () => {
  ;[browser, gnosisPage] = await initNoWalletConnection()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('LocalStorage Populate and validate', () => {
  test('LocalStorage Populate and validate', async () => {
    await assertElementPresent({ selector: '[data-testid = "sidebar"]', type: 'css' }, gnosisPage)
    // Fill the local storage with Safes in the sidebar, Entries in the AB and 2 custom apps
    await gnosisPage.evaluate(
      (jsonSafeKey, jsonSafeValue, jsonABKey, jsonABValue, jsonAppsKey, jsonAppsValue) => {
        localStorage.clear()
        indexedDB.deleteDatabase('ImmortalDB')
        localStorage.setItem(jsonSafeKey, JSON.stringify(jsonSafeValue))
        localStorage.setItem(jsonABKey, JSON.stringify(jsonABValue))
        localStorage.setItem(jsonAppsKey, JSON.stringify(jsonAppsValue))
        window.location.reload()
      },
      SAFES_KEY,
      SAFES_VALUES,
      ADDRESSBOOK_KEY,
      ADDRESSBOOK_VALUES,
      APPS_KEY,
      APPS_VALUES,
    )
    await assertElementPresent({ selector: '[data-testid = "sidebar"]', type: 'css' }, gnosisPage)
    await clickElement({ selector: '[data-testid="sidebar"] button', type: 'css' }, gnosisPage)
    await assertElementPresent({ selector: '[aria-label = "Add Safe"]', type: 'css' }, gnosisPage)
    // Obtaining the address from the href property of the safes in the sidebar, saving them in an Array
    const safeAddresses = await gnosisPage.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="SIDEBAR_SAFELIST_ROW_TESTID"]'), (element) => {
        const addressStartIndex = element.href.indexOf('0x')
        const ADDRESS_LENGTH = 42
        return element.href.substring(addressStartIndex, addressStartIndex + ADDRESS_LENGTH)
      }),
    )
    // Creating an array containg the addresses from the safes in the file. Comparing the 2 arrays to be equal
    const localStorageSafeAddresses = Object.keys(SAFES_VALUES)
    expect(safeAddresses).toStrictEqual(localStorageSafeAddresses)
    await gnosisPage.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] })
    await assertElementPresent({ selector: '[data-testid = "sidebar"]', type: 'css' }, gnosisPage)
    await clickByText('span', 'ADDRESS BOOK', gnosisPage)
    await assertElementPresent({ selector: '[aria-labelledby="Owners"]', type: 'css' }, gnosisPage)
    // Obtaning the address of all the address book entries
    const addressBookEntries = await gnosisPage.evaluate(() =>
      Array.from(
        document.querySelectorAll('[data-testid="address-book-row"] td div div div div p'),
        (element) => element.innerText,
      ),
    )
    // Creating an array of all the addresses for the addressbook in the file
    const localStorageAddressBook = Array.from(Object.values(ADDRESSBOOK_VALUES), (entry) => entry.address)
    // Addresses in the AB are ordered by Name, so they might not be in the same order as they are in the localStorage
    addressBookEntries.forEach((address) => {
      const addressIncluded = localStorageAddressBook.includes(address)
      if (!addressIncluded) console.info('address not found = ', address)
      expect(addressIncluded).toBeTruthy()
    })
    // Check if the names of the apps added are in the list of Apps
    await clickByText('span', 'APPS', gnosisPage, 'css')
    await assertElementPresent({ selector: 'span[color="primary"]', type: 'css' }, gnosisPage)
    await isTextPresent('body', 'Gnosis Safe App Recorder', gnosisPage)
    await isTextPresent('body', 'ETH Wrapper', gnosisPage)
  }, 3000000)
})
