import * as gFunc from '../utils/selectorsHelpers'
import { sels } from '../utils/selectors'
import { accountsSelectors } from '../utils/selectors/accounts'
import { createSafePage } from '../utils/selectors/createSafePage'
import { generalInterface } from '../utils/selectors/generalInterface'
import { initWithWalletConnected } from '../utils/testSetup'
import { rejectPendingTxs } from '../utils/rejectPendingTxs'

let browser
let metamask
let gnosisPage
let MMpage

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Create New Safe', () => {
  const errorMsg = sels.errorMsg

  let rowsAmount = ''
  const newSafeName = accountsSelectors.safeNames.create_safe_name
  const owner2Name = accountsSelectors.accountNames.owner2_name
  const owner2Address = accountsSelectors.testAccountsHash.acc2
  test('Create Safe', async (done) => {
    console.log('Open Create Safe Form\n')
    // Open Create Safe Form
    try {
      await gFunc.clickByText('p', '+ Create New Safe', gnosisPage)
      await gFunc.assertElementPresent(createSafePage.form, gnosisPage, 'css')
      // Naming The Safe
      await gFunc.clickElement(generalInterface.submit_btn, gnosisPage) // click with empty safe field
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // check error message
      await gFunc.clickAndType({ selector: createSafePage.safe_name_field, type: 'css' }, gnosisPage, newSafeName)
      await gFunc.clickElement(generalInterface.submit_btn, gnosisPage)
      // Adding Owners
      await gFunc.assertElementPresent(createSafePage.step_two, gnosisPage, 'css')
      await gFunc.clickElement({ selector: createSafePage.add_owner_btn }, gnosisPage) // adding new row
      await gnosisPage.waitForTimeout(1000)
      await gFunc.clickElement(generalInterface.submit_btn, gnosisPage) // making "Required error" show up for the new owner fields
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // check first "required" error in name field
      await gFunc.clickAndType({ selector: createSafePage.owner_name_field(1), type: 'css' }, gnosisPage, owner2Name) // filling name field
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // checking "required" error in address field
      await gFunc.clickAndType({ selector: createSafePage.address_field(1), type: 'css' }, gnosisPage, owner2Address)
      await gFunc.assertElementPresent(createSafePage.valid_address(1), gnosisPage, 'css')
      rowsAmount = await gnosisPage.$$eval(createSafePage.owner_row, x => x.length) // see how many owner I've created
      await gFunc.assertElementPresent(createSafePage.req_conf_limit(rowsAmount), gnosisPage, 'css') // that amount should be in the text "out of X owners"
      // Setting Required Confirmation
      await gFunc.clickElement({ selector: createSafePage.threshold_select_input }, gnosisPage)
      await gFunc.clickElement({ selector: createSafePage.select_input(rowsAmount) }, gnosisPage)
      await gnosisPage.waitForTimeout(2000) // gotta wait before clickin review_btn or doesn't work
      await gFunc.clickElement(generalInterface.submit_btn, gnosisPage)
      // Reviewing Safe Info
      await gFunc.assertElementPresent(createSafePage.step_three, gnosisPage, 'css')
      await gFunc.assertTextPresent(createSafePage.review_safe_name, newSafeName, gnosisPage, 'css')
      await gFunc.assertElementPresent(createSafePage.review_req_conf(rowsAmount), gnosisPage, 'css')
      await gFunc.assertTextPresent(createSafePage.review_owner_name(1), owner2Name, gnosisPage, 'css')
      await gFunc.assertTextPresent(createSafePage.review_owner_address(1), owner2Address, gnosisPage, 'css')
      await gFunc.clickElement(generalInterface.submit_btn, gnosisPage)
      await MMpage.bringToFront()
      await MMpage.waitForTimeout(2000)
      await metamask.confirmTransaction()
      // Assert Safe Creation
      await gnosisPage.bringToFront()
      await gFunc.assertElementPresent(createSafePage.back_btn, gnosisPage, 'css')
      await gFunc.assertElementPresent(createSafePage.etherscan_link, gnosisPage, 'css')
      await gFunc.assertElementPresent(createSafePage.continue_btn, gnosisPage, 'css')
      await gFunc.clickElement({ selector: createSafePage.continue_btn }, gnosisPage)
      await gFunc.isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.create_safe_name, gnosisPage)
      done()
    } catch (error) {
      done(error)
    }
  }, 180000)
})
