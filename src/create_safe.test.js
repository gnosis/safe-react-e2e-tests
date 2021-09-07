import {
  clickByText,
  assertElementPresent,
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

/*
Create safe
-- Enters into the create safe form with the Create button
-- Type a name for the safe
-- Adds a new owner row
-- Check that owner names and addresses are required when clicking submit
-- Type names and addresses only for "owner2"
-- Checks that the policies selector matches the amount of owners
-- Checks in review step the name of the safe, name and address of owner2
-- Checks "block explorer" and "back" button during the safe creation
-- Checks safe name on the sidebar once the safe is loaded
*/

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
  test('Create Safe', async () => {
    console.log('Open Create Safe Form\n')
    // Open Create Safe Form
    await clickByText('p', '+ Create New Safe', gnosisPage)
    await assertElementPresent(createSafePage.form, gnosisPage, 'css')
    // Naming The Safe
    await clickAndType({ selector: createSafePage.safe_name_field, type: 'css' }, gnosisPage, newSafeName)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    // Adding Owners
    await assertElementPresent(createSafePage.step_two, gnosisPage, 'css')
    await clickElement({ selector: createSafePage.add_owner_btn }, gnosisPage) // adding new row
    await gnosisPage.waitForTimeout(1000)
    await clickElement(generalInterface.submit_btn, gnosisPage) // making "Required error" show up for the new owner fields
    await assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // check first "required" error in name field
    await clickAndType({ selector: createSafePage.owner_name_field(1), type: 'css' }, gnosisPage, owner2Name) // filling name field
    await assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // checking "required" error in address field
    await clickAndType({ selector: createSafePage.address_field(1), type: 'css' }, gnosisPage, owner2Address)
    await assertElementPresent(createSafePage.valid_address(1), gnosisPage, 'css')
    rowsAmount = await gnosisPage.$$eval(createSafePage.owner_row, (x) => x.length) // see how many owner I've created
    await assertElementPresent(createSafePage.req_conf_limit(rowsAmount), gnosisPage, 'css') // that amount should be in the text "out of X owners"
    // Setting Required Confirmation
    await clickElement({ selector: createSafePage.threshold_select_input }, gnosisPage)
    await clickElement({ selector: createSafePage.select_input(rowsAmount) }, gnosisPage)
    await gnosisPage.waitForTimeout(2000) // gotta wait before clickin review_btn or doesn't work
    await clickElement(generalInterface.submit_btn, gnosisPage)
    // Reviewing Safe Info
    await assertElementPresent(createSafePage.step_three, gnosisPage, 'css')
    await assertTextPresent(createSafePage.review_safe_name, newSafeName, gnosisPage, 'css')
    await assertElementPresent(createSafePage.review_req_conf(rowsAmount), gnosisPage, 'css')
    await assertTextPresent(createSafePage.review_owner_name(1), owner2Name, gnosisPage, 'css')
    await assertTextPresent(createSafePage.review_owner_address(1), owner2Address, gnosisPage, 'css')
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await MMpage.bringToFront()
    await MMpage.waitForTimeout(2000)
    await metamask.confirmTransaction()
    // Assert Safe Creation
    await gnosisPage.bringToFront()
    await assertElementPresent(createSafePage.back_btn, gnosisPage, 'css')
    await assertElementPresent(createSafePage.etherscan_link, gnosisPage, 'css')
    await assertElementPresent(createSafePage.continue_btn, gnosisPage, 'css')
    await clickElement({ selector: createSafePage.continue_btn }, gnosisPage)
    await isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.create_safe_name, gnosisPage)
  }, 180000)
})
