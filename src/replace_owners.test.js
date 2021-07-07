import { approveAndExecuteWithOwner } from '../utils/actions/approveAndExecuteWithOwner'
import {
  assertElementPresent,
  assertAllElementPresent,
  assertTextPresent,
  clearInput,
  clickAndType,
  clickByText,
  isTextPresent,
  clickElement,
  getNumberInString,
  getInnerText,
  openDropdown,
} from '../utils/selectorsHelpers'
import { sels } from '../utils/selectors'
import { generalInterface } from '../utils/selectors/generalInterface'
import { sendFundsForm } from '../utils/selectors/sendFundsForm'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { settingsPage } from '../utils/selectors/settings'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'
import { rejectPendingTxs } from '../utils/rejectPendingTxs'

const { NON_OWNER_ADDRESS } = config
const OWNER_FOR_REPLACEMT = "0xc293f6eAE3E9170766C74f0867cb4Ad2c8d8fa0c"

let browser
let metamask
let gnosisPage
let MMpage

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] =  await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Adding and removing owners', () => {
  const setting_owners = sels.xpSelectors.setting_owners
  const replace_owner = sels.xpSelectors.replace_owner
  const errorMsg = sels.errorMsg
  const safe_hub = sels.xpSelectors.safe_hub

  let owner_replaced_address
  let owner_for_replacement_address
  let owner_for_replacement_name

  test('Enter in settings. Checking which owner replace', async (done) => {
    console.log('Enter in settings. Checking which owner replace')
    owner_for_replacement_name = 'Cory Barlog'
    try {
      await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
      await clickByText('span', 'SETTINGS', gnosisPage)
      await isTextPresent('body', 'Contract Version', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await isTextPresent('body', 'Manage Safe Owners', gnosisPage)
      try {
        // I check which user replace
        await gnosisPage.waitForXPath(`//p[contains(text(), "${OWNER_FOR_REPLACEMT}")]`, {timeout:5000})
        owner_replaced_address = OWNER_FOR_REPLACEMT 
        owner_for_replacement_address = NON_OWNER_ADDRESS
      } catch (e) {
        console.log(e)
        owner_replaced_address = NON_OWNER_ADDRESS 
        owner_for_replacement_address = OWNER_FOR_REPLACEMT
      }
      console.log('Owner_replaced_address = ', owner_replaced_address, '\nOwner_for_replacement_address = ', owner_for_replacement_address)   
      await gnosisPage.waitForTimeout(2000)
      const existing_owner_address = owner_replaced_address // I save it in another variable to check that the owner was swapped out.
      const ownersList = await gnosisPage.evaluate(() => Array.from(document.querySelectorAll("[data-testid='owners-row'] p"), element => element.textContent))
      const removeIndex = ownersList.findIndex((address) => owner_replaced_address === address)
      await gnosisPage.evaluate((removeIndex, replaceButton) => {
        document.querySelectorAll(replaceButton)[removeIndex].click()
      }, removeIndex, settingsPage.replace_owner_btn.selector)

      done()
    } catch (error) {
      done(error)
    }
  }, 60000)
  test.skip('Step 2 - Verify owner replacementen and submit', async (done) => {
    console.log('Step 2 - Verify owner replacementen and submit')
    try {
      await assertAllElementPresent([
        replace_owner.removing_owner_title,
        replace_owner.new_owner_section,
        replace_owner.replaced_owner_address(owner_replaced_address),
        replace_owner.owner_for_replacement_name(owner_for_replacement_name),
        replace_owner.owner_for_replacement_address(owner_for_replacement_address),
      ], gnosisPage)
      await clickSomething(setting_owners.submit_btn, gnosisPage)
      await gnosisPage.waitFor(2000)
      await metamask.sign()
      done()
    } catch (error) {
      done(error)
    }
  }, 60000)
  test.skip('Sign with owner 2', async (done) => {
    console.log('Sign with owner 2')
    try {
      await MMpage.waitFor(5000)
      await gnosisPage.bringToFront()
      await clickSomething(safe_hub.awaiting_confirmations, gnosisPage)
      await assertElementPresent(safe_hub.confirmed_counter(1), gnosisPage)
      await metamask.switchAccount(1) // currently in account4, changing to account 1
      await gnosisPage.waitFor(2000)
      await gnosisPage.bringToFront()
      await clickSomething(safe_hub.confirm_btn, gnosisPage)
      await clickSomething(safe_hub.approve_tx_btn, gnosisPage)
      await gnosisPage.waitFor(2000)
      await metamask.sign()
      done()
    } catch (error) {
      done(error)
    }
  }, 60000)
  test.skip('Signing and executing with owner 3', async (done) => {
    console.log('Signing and executing with owner 3')
    try {
      await MMpage.waitFor(5000)
      await gnosisPage.bringToFront()
      await assertElementPresent(safe_hub.confirmed_counter(2), gnosisPage)
      await metamask.switchAccount(2)
      await gnosisPage.bringToFront()
      await gnosisPage.waitFor(5000)
      await clickSomething(safe_hub.confirm_btn, gnosisPage)
      await clickSomething(safe_hub.approve_tx_btn, gnosisPage)
      await gnosisPage.waitFor(2000)
      await metamask.confirmTransaction()
      done()
    } catch (error) {
      done(error)
    }
  }, 60000)
  test.skip('Verify the Owner Replacement', async (done) => {
    console.log('Verify the Owner Replacement')
    try {
      await MMpage.waitFor(2000)
      await gnosisPage.bringToFront()
      await gnosisPage.waitForXPath("//div[contains(text(),'Executor')]")
      await assertAllElementPresent([
        replace_owner.tx_remove_owner_title,
        replace_owner.tx_removed_owner_address(owner_replaced_address),
        replace_owner.tx_add_owner_title,
        // replace_owner.tx_add_owner_name(owner_for_replacement_name), // This is broken in the application. Issue #649
        replace_owner.tx_add_owner_address(owner_for_replacement_address),
      ], gnosisPage)
      await clickSomething(setting_owners.settings_tab, gnosisPage)
      await clickSomething(setting_owners.owners_tab, gnosisPage)
      await assertElementPresent(setting_owners.owner_table_row_address(owner_for_replacement_address), gnosisPage)
      done()
    } catch (error) {
      done(error)
    }
  }, 150000)
})
