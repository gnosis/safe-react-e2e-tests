import {
  assertElementPresent,
  assertTextPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  isTextPresent,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { generalInterface } from '../utils/selectors/generalInterface'
import { loadSafeForm } from '../utils/selectors/loadSafeForm'
import { initWithWalletConnected } from '../utils/testSetup'
import config from '../utils/config'

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
  test('Add an existing safe', async (done) => {
    await clickByText('p', 'Add existing Safe', gnosisPage)
    await assertElementPresent(loadSafeForm.form, gnosisPage)
    await clickAndType(loadSafeForm.safe_name_field, gnosisPage, accountsSelectors.safeNames.load_safe_name)
    await assertTextPresent(loadSafeForm.valid_safe_name.selector, 'Safe name', gnosisPage)
    await clickAndType(loadSafeForm.safe_address_field, gnosisPage, TESTING_SAFE_ADDRESS)
    await assertElementPresent(loadSafeForm.valid_address, gnosisPage)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    // Add Safe owner step edition
    await assertElementPresent(loadSafeForm.step_two, gnosisPage)
    await clearInput(loadSafeForm.owner_name(), gnosisPage)
    await clickAndType(loadSafeForm.owner_name(), gnosisPage, accountsSelectors.accountNames.owner_name)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    // Add Safe review details
    await assertElementPresent(loadSafeForm.step_three, gnosisPage)
    await assertTextPresent(
      loadSafeForm.review_safe_name.selector,
      accountsSelectors.safeNames.load_safe_name,
      gnosisPage,
      'css',
    )
    await assertTextPresent(
      loadSafeForm.review_owner_name().selector,
      accountsSelectors.accountNames.owner_name,
      gnosisPage,
      'css',
    )
    await gnosisPage.waitForTimeout(2000)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await assertElementPresent(generalInterface.show_qr_btn, gnosisPage)
    await clickElement(generalInterface.show_qr_btn, gnosisPage)
    await isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.load_safe_name, gnosisPage)
    await clickByText('button > span', 'Done', gnosisPage)
  }, 180000)
})
