import path from 'path'

import {
  assertElementPresent,
  assertTextPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getInnerText,
  isTextPresent,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { generalInterface } from '../utils/selectors/generalInterface'
import { loadSafeForm } from '../utils/selectors/loadSafeForm'
import { initWithWalletConnected } from '../utils/testSetup'
import config from '../utils/config'
import { errorMsg } from '../utils/selectors/errorMsg'

/*
Load safe
-- Enters into the load form with the load button component
-- Types name and address for the safe
-- Enters the name of the 1st owner in the list
-- Checks in the 3rd step that the safe name and owner name are the ones set before
-- Loads the safe
-- Opens the QR code for the safe on the sidebar and checks the safe name again
*/

let browser
let gnosisPage

const { TESTING_SAFE_ADDRESS } = config
const safeQRCodeFilePath = path.relative(process.cwd(), path.join(__dirname, '/../utils/files/safe-address-QR.png'))

beforeAll(async () => {
  const context = await initWithWalletConnected(true)
  browser = context[0]
  gnosisPage = context[2]
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  const pages = await browser.pages()
  await Promise.all(pages.map((page) => page.close()))
  await browser.close()
})

describe('Add an existing safe', () => {
  test('Add an existing safe', async () => {
    console.log('Load safe')
    console.log('Enters into the load form with the Load button component')
    await clickByText('a', 'Add existing Safe', gnosisPage)
    await assertElementPresent(loadSafeForm.form, gnosisPage)

    // [Step 1] Select Network
    console.log('Shows the select network step')
    await assertElementPresent(loadSafeForm.select_network_step, gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_step, 'Rinkeby', gnosisPage)

    console.log('Switches the network')
    // opens the network dialog
    await clickByText('button', 'Switch Network', gnosisPage)
    await assertElementPresent(loadSafeForm.select_network_dialog, gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'Mainnet', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'Rinkeby', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'XDai', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'EWC', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'Volta', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'Polygon', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_dialog, 'BSC', gnosisPage)

    // selects the Volta network
    await clickByText("div[role='button'] > span", 'Volta', gnosisPage)
    await assertTextPresent(loadSafeForm.select_network_step, 'Volta', gnosisPage)

    // selects the Rinkeby network again (this time clicking in the network label)
    await clickByText('p > span', 'Volta', gnosisPage)
    await assertElementPresent(loadSafeForm.select_network_dialog, gnosisPage)
    await clickByText("div[role='button'] > span", 'Rinkeby', gnosisPage)

    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 2] Name and address
    console.log('Types name and address for the safe')
    await assertElementPresent(loadSafeForm.name_and_address_safe_step, gnosisPage)

    // loads a safe address with QR code
    console.log('Load Safe address with a QR code')
    gnosisPage.waitForFileChooser()
    await gnosisPage.evaluate(() => {
      return document.querySelector("img[role='button']").click()
    })
    await clickByText('button > span', 'Upload an image', gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await gnosisPage.waitForSelector("input[type='file']")
    const button = await gnosisPage.$("input[type='file']")
    await button.uploadFile(safeQRCodeFilePath)
    await gnosisPage.waitForTimeout(2000)
    await gnosisPage.keyboard.press('Escape')
    const safeAddress = await getInnerText(loadSafeForm.safe_address_field, gnosisPage)
    expect(safeAddress).toBe('0x57CB13cbef735FbDD65f5f2866638c546464E45F')
    await assertElementPresent(loadSafeForm.valid_address, gnosisPage)

    // Invalid Address validation
    console.log('Invalid Safe address validation')
    const invalidAddress = 'this-is-an-invalid-address'
    await clearInput(loadSafeForm.safe_address_field, gnosisPage)
    await clickAndType(loadSafeForm.safe_address_field, gnosisPage, invalidAddress)
    expect(await getInnerText(loadSafeForm.safe_address_field, gnosisPage)).toBe(invalidAddress)
    await isTextPresent(loadSafeForm.name_and_address_safe_step.selector, errorMsg.valid_ENS_name, gnosisPage)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await assertElementPresent(loadSafeForm.name_and_address_safe_step, gnosisPage)

    // Address given is not a valid Safe address
    console.log('Address given is not a valid Safe address')
    const invalidSafeAddress = '0x726fD6f875951c10cEc96Dba52F0AA987168Fa97'
    await clearInput(loadSafeForm.safe_address_field, gnosisPage)
    await clickAndType(loadSafeForm.safe_address_field, gnosisPage, invalidSafeAddress)
    expect(await getInnerText(loadSafeForm.safe_address_field, gnosisPage)).toBe(invalidSafeAddress)
    await isTextPresent(loadSafeForm.name_and_address_safe_step.selector, errorMsg.invalid_Safe_Address, gnosisPage)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await assertElementPresent(loadSafeForm.name_and_address_safe_step, gnosisPage)

    // Types name and address for the safe
    await clickAndType(loadSafeForm.safe_name_field, gnosisPage, accountsSelectors.safeNames.load_safe_name)
    await assertTextPresent(loadSafeForm.valid_safe_name, 'Safe name', gnosisPage)
    await clearInput(loadSafeForm.safe_address_field, gnosisPage)
    await clickAndType(loadSafeForm.safe_address_field, gnosisPage, TESTING_SAFE_ADDRESS)
    await assertElementPresent(loadSafeForm.valid_address, gnosisPage)
    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 3] Owners
    // Add Safe owner step edition
    await assertElementPresent(loadSafeForm.safe_owners_step, gnosisPage)
    console.log('Enters the name of the 1st owner in the list')
    await clearInput(loadSafeForm.owner_name(), gnosisPage)
    await clickAndType(loadSafeForm.owner_name(), gnosisPage, accountsSelectors.accountNames.owner_name)
    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 4] Review
    // Add Safe review details
    console.log('Checks in the 3rd step that the safe name and owner name are the ones set before')
    await assertElementPresent(loadSafeForm.step_three, gnosisPage)
    await assertTextPresent(loadSafeForm.review_safe_name, accountsSelectors.safeNames.load_safe_name, gnosisPage)
    await assertTextPresent(loadSafeForm.review_owner_name(), accountsSelectors.accountNames.owner_name, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    console.log('Loads the safe')
    await clickElement(generalInterface.submit_btn, gnosisPage)

    // Redirects to balances
    console.log('Opens the QR code for the safe on the sidebar and checks the safe name again')
    await isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.load_safe_name, gnosisPage)
    await clickByText('button > span', 'Done', gnosisPage)
  }, 180000)
})
