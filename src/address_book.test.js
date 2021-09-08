import {
  assertElementPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getInnerText,
  isTextPresent,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { addressBook } from '../utils/selectors/addressBook'
import { initWithDefaultSafe } from '../utils/testSetup'
import { generalInterface } from '../utils/selectors/generalInterface'
import config from '../utils/config'
import path from 'path'

let browser
let gnosisPage

const { TESTING_SAFE_ADDRESS } = config

beforeAll(async () => {
  const context = await initWithDefaultSafe(true)
  browser = context[0]
  gnosisPage = context[2]
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Address book', () => {
  const editedName = 'Edited owner name'
  const filePath = path.relative(process.cwd(), path.join(__dirname, '/../utils/files/address_book_test.csv'))
  const ENSName = 'francotest.eth'

  test('Addrress book', async (done) => {
    console.log('Addrress book')
    console.log('Loads safe form, giving name to the safe and the first 2 owners')
    console.log('Enter into address book. Validates 3 entries present by name (the load safe process created them)')
    await isTextPresent(generalInterface.sidebar, 'ADDRESS BOOK', gnosisPage)
    await clickByText('span', 'ADDRESS BOOK', gnosisPage)
    await isTextPresent('body', 'Create entry', gnosisPage)
    const tableRowsAmount = await gnosisPage.evaluate(() => document.querySelector('tbody').childElementCount)
    expect(tableRowsAmount).toBe(3) // the safe and 2 owners is expected to be there.

    await isTextPresent('tbody', TESTING_SAFE_ADDRESS, gnosisPage)
    await isTextPresent('tbody', accountsSelectors.accountNames.owner_name, gnosisPage)
    await isTextPresent('tbody', accountsSelectors.accountNames.owner2_name, gnosisPage)
    // adding an entry
    console.log('Creates an entry with valid name and address. Validates it in the entries list')
    await clickByText('p', 'Create entry', gnosisPage)
    await clickAndType(addressBook.createEntryNameInput, gnosisPage, accountsSelectors.otherAccountNames.owner5_name)
    await clickAndType(addressBook.createEntryAddressInput, gnosisPage, accountsSelectors.testAccountsHash.acc1)
    await clickElement(addressBook.createSubmitBtn, gnosisPage)
    await isTextPresent('tbody', accountsSelectors.otherAccountNames.owner5_name, gnosisPage)
    await isTextPresent('tbody', accountsSelectors.testAccountsHash.acc1, gnosisPage)
    // validating errors for add entry
    await clickByText('p', 'Create entry', gnosisPage)
    console.log('Validate error messages in entry creation: "RandomString", duplicated entry.')
    await clickAndType(addressBook.createEntryAddressInput, gnosisPage, 'RandomInvalidString')
    await isTextPresent(
      addressBook.entryModal.selector,
      'Must be a valid address, ENS or Unstoppable domain',
      gnosisPage,
    )
    await clearInput(addressBook.createEntryAddressInput, gnosisPage)
    console.log('Validates ENS names translation (is a hardcoded ENS name for this test)')
    // Testing ENS name, it will create a duplicated name so is validating the "duplicated address error"
    await clickAndType(addressBook.createEntryAddressInput, gnosisPage, ENSName) // This name becomes acc1 address
    await gnosisPage.waitForTimeout(1000)
    const convertedValue = await getInnerText(addressBook.createEntryAddressInput.selector, gnosisPage, 'css')
    expect(convertedValue).toBe(accountsSelectors.testAccountsHash.acc1)
    await isTextPresent(addressBook.entryModal.selector, 'Address already introduced', gnosisPage)
    await clearInput(addressBook.createEntryAddressInput, gnosisPage)
    await clickByText('.paper.modal span', 'cancel', gnosisPage)
    console.log('Edits entry. First validates name to be required, then enters a valid new name and saves')
    // Opening Edit entry modal, editing and validating name
    await gnosisPage.evaluate(
      (editName, rowSelector, editEntryBtn) => {
        const rows = Array.from(document.querySelectorAll(rowSelector))
        const index = rows.findIndex((e) => e.querySelector('td').innerText.includes(editName))
        rows[index].querySelector(editEntryBtn).click()
      },
      accountsSelectors.otherAccountNames.owner5_name,
      addressBook.entryRowSelector.selector,
      addressBook.editEntryBtn.selector,
    )
    await clearInput(addressBook.createEntryNameInput, gnosisPage)
    await isTextPresent(addressBook.entryModal.selector, 'Required', gnosisPage) // Empty name error validation
    await clickAndType(addressBook.createEntryNameInput, gnosisPage, editedName)
    await clickElement(addressBook.createSubmitBtn, gnosisPage)
    await isTextPresent('tbody', editedName, gnosisPage)
    console.log('Finds edited name and deletes the entry')
    // Open Delete entry modal, deleting name, validating entry deleted
    await gnosisPage.evaluate(
      (editName, rowSelector, deleteEntryBtn) => {
        const rows = Array.from(document.querySelectorAll(rowSelector))
        const index = rows.findIndex((e) => e.querySelector('td').innerText.includes(editName))
        rows[index].querySelector(deleteEntryBtn).click()
      },
      editedName,
      addressBook.entryRowSelector.selector,
      addressBook.deleteEntryBtn.selector,
    )
    await clickElement(addressBook.deleteSubmitBtn, gnosisPage)
    const OwnerRemovedIndex = await gnosisPage.evaluate(
      (rowSelector, editedName) => {
        const rows = Array.from(document.querySelectorAll(rowSelector))
        const index = rows.findIndex((e) => e.innerText.includes(editedName))
        return index
      },
      addressBook.entryRowSelector.selector,
      editedName,
    )
    await gnosisPage.waitForTimeout(2000)
    expect(OwnerRemovedIndex).toBe(-1) // didn't find the name in the table, the owner has been removed
    // Open send funds modal
    await gnosisPage.waitForTimeout(6000) // The notifications are over the button, I have to wait for them to dissapear
    console.log('Exports a file (no validations)')
    // Open Export -- A verification of the file downloaded is needed
    await clickByText('p', 'Export', gnosisPage)
    await assertElementPresent(addressBook.entryModal.selector, gnosisPage, 'css')
    await clickByText('span', 'Download', gnosisPage)
    console.log('Imports a file. checks new expected name to be in the entries list')
    // Open Import
    await clickByText('p', 'Import', gnosisPage)
    await gnosisPage.waitForSelector("input[type='file']")
    const button = await gnosisPage.$("input[type='file']")
    await button.uploadFile(filePath)
    await gnosisPage.waitForTimeout(1000)
    await clickByText('button', 'Import', gnosisPage)
    await isTextPresent('tbody', 'user 1', gnosisPage)
  }, 120000)
})
