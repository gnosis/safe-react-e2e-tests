import { approveAndExecuteWithOwner } from '../utils/actions/approveAndExecuteWithOwner'
import {
  assertElementPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getInnerText,
  getNumberInString,
  assertTextPresent,
  openDropdown,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { settingsPage } from '../utils/selectors/settings'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'
import { generalInterface } from '../utils/selectors/generalInterface'
import { rejectPendingTxs } from '../utils/actions/rejectPendingTxs'
import { errorMsg } from '../utils/selectors/errorMsg'

/*
Add/remove Owners
-- Enter add owner form
-- Validate Owner name and address required, invalid address, duplicated address
-- Input valid owner name and address,
-- Checks them in review step and submits, confirms and executes
-- Finds new owner in the owners list, clicks on remove owner
-- Sets threshold value to "2"
-- Verifies owner to be removed name an address
-- Signs and executes. Verifies tx success status
*/

let browser
let metamask
let gnosisPage

const { FUNDS_RECEIVER_ADDRESS, NON_OWNER_ADDRESS } = config

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Adding and removing owners', () => {
  const newOwnerName = accountsSelectors.otherAccountNames.owner6_name
  const newOwnerAddress = NON_OWNER_ADDRESS
  let currentNonce = ''

  test('Add and remove an owner', async (done) => {
    console.log('Test Add and remove an owner')
    const existingOwnerHash = FUNDS_RECEIVER_ADDRESS
    // Filling Form and submitting tx
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'owners', gnosisPage)
    await clickElement(settingsPage.add_owner_btn, gnosisPage)

    await clickElement(settingsPage.add_owner_next_btn, gnosisPage)
    await assertElementPresent({selector: errorMsg.error(errorMsg.required), type: 'Xpath'}, gnosisPage) // asserts error "required" in name
    await clickAndType(settingsPage.add_owner_name_input, gnosisPage, newOwnerName)

    await clickElement(settingsPage.add_owner_next_btn, gnosisPage)
    await assertElementPresent({selector: errorMsg.error(errorMsg.required), type: 'Xpath'}, gnosisPage) // asserts error "required" in name

    await clickAndType(settingsPage.add_owner_address_input, gnosisPage, '0xInvalidHash')
    await assertElementPresent({selector: errorMsg.error(errorMsg.valid_ENS_name), type: 'Xpath'}, gnosisPage)
    await clearInput(settingsPage.add_owner_address_input, gnosisPage)

    await clickAndType(settingsPage.add_owner_address_input, gnosisPage, existingOwnerHash)
    await assertElementPresent({selector: errorMsg.error(errorMsg.duplicated_address), type: 'Xpath'}, gnosisPage)
    await clearInput(settingsPage.add_owner_address_input, gnosisPage)

    await clickAndType(settingsPage.add_owner_address_input, gnosisPage, newOwnerAddress)
    await clickElement(settingsPage.add_owner_next_btn, gnosisPage)

    await clickElement(settingsPage.add_owner_review_btn, gnosisPage)
    const addedName = await getInnerText(
      settingsPage.add_owner_name_review.selector,
      gnosisPage,
      settingsPage.add_owner_name_review.type,
    )
    const addedAddress = await getInnerText(
      settingsPage.add_owner_address_review.selector,
      gnosisPage,
      settingsPage.add_owner_address_review.type,
    )
    expect(addedName).toBe(newOwnerName)
    expect(addedAddress).toBe(newOwnerAddress)
    // Checking the new owner name and address is present in the review step ^^^. Do we need an Id for this?
    await gnosisPage.waitForTimeout(2000)
    await assertElementPresent(settingsPage.add_owner_submit_btn, gnosisPage)
    await gnosisPage.waitForFunction(
      (selector) => !document.querySelector(selector),
      {},
      settingsPage.add_owner_submit_btn_disabled.selector,
    )
    // The submit button starts disabled. I wait for it to become enabled ^^^
    await clickElement(settingsPage.add_owner_submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(4000)
    await metamask.signTransaction()
    // Approving and executing the transaction with owner 2
    await gnosisPage.bringToFront()
    await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
    currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
    console.log('CurrentNonce = ', currentNonce)
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    // Deleting owner form filling and tx creation
    await gnosisPage.bringToFront()
    await assertElementPresent({selector: transactionsTab.no_tx_in_queue, type: 'css'}, gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'owners', gnosisPage)
    await assertElementPresent({selector: "[data-testid='remove-owner-btn']", type: 'css'}, gnosisPage)
    await gnosisPage.waitForTimeout(1000)
    // the new owner takes a moment to show up, if we don't wait then OwnerList will have the list of owners without the new one added
    const ownersList = await gnosisPage.evaluate(() =>
      Array.from(document.querySelectorAll("[data-testid='owners-row'] p"), (element) => element.textContent),
    )
    const removeIndex = ownersList.findIndex((address) => newOwnerAddress === address)
    await gnosisPage.evaluate((removeIndex) => {
      document.querySelectorAll("[data-testid='remove-owner-btn']")[removeIndex].click()
    }, removeIndex)
    await clickElement(settingsPage.remove_owner_next_btn, gnosisPage)
    await openDropdown({ selector: '[id="mui-component-select-threshold"]', type: 'css' }, gnosisPage)
    await clickElement({ selector: "[data-value='2']", type: 'css' }, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await clickElement(settingsPage.remove_owner_review_btn, gnosisPage)
    const removedName = await getInnerText(
      settingsPage.remove_owner_name_review.selector,
      gnosisPage,
      settingsPage.remove_owner_name_review.type,
    )
    const removedAddress = await getInnerText(
      settingsPage.remove_owner_address_review.selector,
      gnosisPage,
      settingsPage.remove_owner_address_review.type,
    )
    expect(removedName).toBe(newOwnerName)
    expect(removedAddress).toBe(newOwnerAddress)
    await assertElementPresent({selector: "[data-testid='remove-owner-review-btn']", type: 'css'}, gnosisPage)
    await gnosisPage.waitForFunction(() => !document.querySelector("[data-testid='remove-owner-review-btn'][disabled]"))
    await clickElement(settingsPage.remove_owner_submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(4000)
    await metamask.signTransaction()
    // Executing the owner deletion with owner 2
    await gnosisPage.bringToFront()
    await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
    currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
    console.log('CurrentNonce = ', currentNonce)
    await approveAndExecuteWithOwner(2, gnosisPage, metamask)
    // Verifying owner deletion
    await assertElementPresent({selector: transactionsTab.no_tx_in_queue, type: 'css'}, gnosisPage)
    await clickByText('button > span > p', 'History', gnosisPage)
    await gnosisPage.waitForTimeout(4000)
    const nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
    expect(nonce).toBe(currentNonce)
    const executedTxStatus = await getInnerText(transactionsTab.tx_status, gnosisPage, 'css')
    expect(executedTxStatus).toBe('Success')
    done()
  }, 540000)
})
