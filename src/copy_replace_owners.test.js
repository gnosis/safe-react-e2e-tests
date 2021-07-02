import * as gFunc from '../utils/selectorsHelpers'
import { sels } from '../utils/selectors'
import { accountsSelectors } from '../utils/selectors/accounts'
import { generalInterface } from '../utils/selectors/generalInterface'
import { initWithDefaultSafe } from '../utils/testSetup'
import { rejectPendingTxs } from '../utils/rejectPendingTxs'

let browser
let metamask
let gnosisPage
let MMpage

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] = await initWithDefaultSafe(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe.skip('Adding and removing owners', () => {
  const settingOwners = sels.xpSelectors.setting_owners
  const replaceOwner = sels.xpSelectors.replace_owner
  const errorMsg = sels.errorMsg
  const safeHub = sels.xpSelectors.safe_hub

  let ownerReplacedAddress
  let ownerForReplacementAddress
  let ownerForReplacementName
  let flag

  test('Adding and removing owners', async (done) => {
    // Enter in settings. Checking which owner replace
    flag = true
    ownerForReplacementName = 'Cory Barlog'
    try {
      await gFunc.isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
      await gFunc.clickByText('span', 'SETTINGS', gnosisPage)
      await gFunc.isTextPresent('body', 'Safe Version', gnosisPage)
      await gFunc.clickByText('p', 'Owners', gnosisPage)
      await gFunc.isTextPresent('body', 'Manage Safe Owners', gnosisPage)
      try {
        // I check which user replace, I check if owner 3 is present
        await gnosisPage.waitForXPath('//span[contains(text(),"0x6E45d69a383CECa3d54688e833Bd0e1388747e6B")]', { timeout: 2000 })
      } catch (e) {
        flag = false
      }
      if (flag) {
        // if acc3 is pressent, that will be replaced, if not then acc5 will be replaced
        ownerReplacedAddress = accountsSelectors.testAccountsHash.acc3
        ownerForReplacementAddress = accountsSelectors.testAccountsHash.acc5
      } else {
        ownerReplacedAddress = accountsSelectors.testAccountsHash.acc5
        ownerForReplacementAddress = accountsSelectors.testAccountsHash.acc3
      }
      // Open Replace Owner form
      const existingOwnerAddress = ownerReplacedAddress
      await gnosisPage.waitFor(2000)
      await gFunc.assertElementPresent(settingOwners.owner_row_options(ownerReplacedAddress, 2), gnosisPage)
      await gFunc.clickSomething(settingOwners.owner_row_options(ownerReplacedAddress, 2), gnosisPage)
      await gFunc.assertElementPresent(replaceOwner.onwer_replaced_address(ownerReplacedAddress), gnosisPage)
      await gFunc.clickSomething(settingOwners.next_btn, gnosisPage)
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // asserts error "required" in name
      await gFunc.clickAndType({ selector: replaceOwner.owner_name_input }, gnosisPage, ownerForReplacementName)
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // asserts error "required" in address
      await gFunc.clickAndType({ selector: replaceOwner.owner_address_input }, gnosisPage, '0xInvalidHash')
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.valid_ENS_name), gnosisPage) // assert invalid address error
      await gFunc.clearInput(replaceOwner.owner_address_input, gnosisPage)
      await gFunc.clickAndType({ selector: replaceOwner.owner_address_input }, gnosisPage, existingOwnerAddress)
      await gFunc.assertElementPresent(errorMsg.error(errorMsg.duplicated_address), gnosisPage) // assert duplicated address error
      await gFunc.clearInput(replaceOwner.owner_address_input, gnosisPage)
      await gFunc.clickAndType(replaceOwner.owner_address_input, gnosisPage, ownerForReplacementAddress)
      await gFunc.clickSomething(settingOwners.next_btn, gnosisPage)
      // Verify owner replacementen and submit
      await gFunc.assertAllElementPresent([
        replaceOwner.removing_owner_title,
        replaceOwner.new_owner_section,
        replaceOwner.replaced_owner_address(ownerReplacedAddress),
        replaceOwner.owner_for_replacement_name(ownerForReplacementName),
        replaceOwner.owner_for_replacement_address(ownerForReplacementAddress)
      ], gnosisPage)
      await gFunc.clickSomething(settingOwners.submit_btn, gnosisPage)
      await gnosisPage.waitFor(2000)
      await metamask.sign()
      // Sign with owner 2
      await MMpage.waitFor(5000)
      await gnosisPage.bringToFront()
      await gFunc.clickSomething(safeHub.needs_confirmations, gnosisPage)
      await gFunc.assertElementPresent(safeHub.confirmed_counter(1), gnosisPage)
      await metamask.switchAccount(1) // currently in account4, changing to account 1
      await gnosisPage.waitFor(2000)
      await gnosisPage.bringToFront()
      await gFunc.clickSomething(safeHub.confirm_btn, gnosisPage)
      await gFunc.clickSomething(safeHub.approve_tx_btn, gnosisPage)
      await gnosisPage.waitFor(2000)
      await metamask.sign()
      // Signing and executing with owner 3
      await MMpage.waitFor(5000)
      await gnosisPage.bringToFront()
      await gFunc.assertElementPresent(safeHub.confirmed_counter(2), gnosisPage)
      await metamask.switchAccount(2)
      await gnosisPage.bringToFront()
      await gnosisPage.waitFor(5000)
      await gFunc.clickSomething(safeHub.confirm_btn, gnosisPage)
      await gFunc.clickSomething(safeHub.approve_tx_btn, gnosisPage)
      await gnosisPage.waitFor(2000)
      await metamask.confirmTransaction()
      // Verify the Owner Replacement
      await MMpage.waitFor(2000)
      await gnosisPage.bringToFront()
      await gnosisPage.waitForXPath("//div[contains(text(),'Executor')]")
      await gFunc.assertAllElementPresent([
        replaceOwner.tx_remove_owner_title,
        replaceOwner.tx_removed_owner_address(ownerReplacedAddress),
        replaceOwner.tx_add_owner_title,
        // replace_owner.tx_add_owner_name(owner_for_replacement_name), // This is broken in the application. Issue #649
        replaceOwner.tx_add_owner_address(ownerForReplacementAddress)
      ], gnosisPage)
      await gFunc.clickSomething(settingOwners.settings_tab, gnosisPage)
      await gFunc.clickSomething(settingOwners.owners_tab, gnosisPage)
      await gFunc.assertElementPresent(settingOwners.owner_table_row_address(ownerForReplacementAddress), gnosisPage)
      done()
    } catch (error) {
      done(error)
    }
  }, 180000)
})
