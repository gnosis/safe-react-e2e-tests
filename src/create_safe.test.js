import {
  clickByText,
  assertAllElementPresent,
  clickElement,
  clickAndType,
  assertTextPresent,
  isTextPresent,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { createSafePage } from '../utils/selectors/createSafePage'
import { generalInterface } from '../utils/selectors/generalInterface'
import { initWithWalletConnected } from '../utils/testSetup'
import { rejectPendingTxs } from '../utils/actions/rejectPendingTxs'
import { errorMsg } from '../utils/selectors/errorMsg'

let browser
let metamask
let gnosisPage
let MMpage

beforeAll(async () => {
  ;[browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Create New Safe', () => {
  let rowsAmount = ''
  const newSafeName = accountsSelectors.safeNames.create_safe_name
  const owner2Name = accountsSelectors.accountNames.owner2_name
  const owner2Address = accountsSelectors.testAccountsHash.acc2
  test('Create Safe', async (done) => {
    console.log('Open Create Safe Form\n')
    // Open Create Safe Form
    try {
      await clickByText('p', '+ Create New Safe', gnosisPage)
      await assertAllElementPresent(createSafePage.form, gnosisPage, 'css')
      // Naming The Safe
      await clickElement(generalInterface.submit_btn, gnosisPage) // click with empty safe field
      await assertAllElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // check error message
      await clickAndType({ selector: createSafePage.safe_name_field, type: 'css' }, gnosisPage, newSafeName)
      await clickElement(generalInterface.submit_btn, gnosisPage)
      // Adding Owners
      await assertAllElementPresent(createSafePage.step_two, gnosisPage, 'css')
      await clickElement({ selector: createSafePage.add_owner_btn }, gnosisPage) // adding new row
      await gnosisPage.waitForTimeout(1000)
      await clickElement(generalInterface.submit_btn, gnosisPage) // making "Required error" show up for the new owner fields
      await assertAllElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // check first "required" error in name field
      await clickAndType({ selector: createSafePage.owner_name_field(1), type: 'css' }, gnosisPage, owner2Name) // filling name field
      await assertAllElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // checking "required" error in address field
      await clickAndType({ selector: createSafePage.address_field(1), type: 'css' }, gnosisPage, owner2Address)
      await assertAllElementPresent(createSafePage.valid_address(1), gnosisPage, 'css')
      rowsAmount = await gnosisPage.$$eval(createSafePage.owner_row, (x) => x.length) // see how many owner I've created
      await assertAllElementPresent(createSafePage.req_conf_limit(rowsAmount), gnosisPage, 'css') // that amount should be in the text "out of X owners"
      // Setting Required Confirmation
      await clickElement({ selector: createSafePage.threshold_select_input }, gnosisPage)
      await clickElement({ selector: createSafePage.select_input(rowsAmount) }, gnosisPage)
      await gnosisPage.waitForTimeout(2000) // gotta wait before clickin review_btn or doesn't work
      await clickElement(generalInterface.submit_btn, gnosisPage)
      // Reviewing Safe Info
      await assertAllElementPresent(createSafePage.step_three, gnosisPage, 'css')
      await assertTextPresent(createSafePage.review_safe_name, newSafeName, gnosisPage, 'css')
      await assertAllElementPresent(createSafePage.review_req_conf(rowsAmount), gnosisPage, 'css')
      await assertTextPresent(createSafePage.review_owner_name(1), owner2Name, gnosisPage, 'css')
      await assertTextPresent(createSafePage.review_owner_address(1), owner2Address, gnosisPage, 'css')
      await clickElement(generalInterface.submit_btn, gnosisPage)
      await MMpage.bringToFront()
      await MMpage.waitForTimeout(2000)
      await metamask.confirmTransaction()
      // Assert Safe Creation
      await gnosisPage.bringToFront()
      await assertAllElementPresent(createSafePage.back_btn, gnosisPage, 'css')
      await assertAllElementPresent(createSafePage.etherscan_link, gnosisPage, 'css')
      await assertAllElementPresent(createSafePage.continue_btn, gnosisPage, 'css')
      await clickElement({ selector: createSafePage.continue_btn }, gnosisPage)
      await isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.create_safe_name, gnosisPage)
      done()
    } catch (error) {
      done(error)
    }
  }, 180000)
})
