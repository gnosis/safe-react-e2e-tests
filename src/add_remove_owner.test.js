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
  openDropdown
} from '../utils/selectorsHelpers'
import { sels } from '../utils/selectors'
import { accountsSelectors } from '../utils/selectors/accounts'
import { settingsPage } from '../utils/selectors/settings'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'

let browser
let metamask
let gnosisPage
let MMpage

const { FUNDS_RECEIVER_ADDRESS, NON_OWNER_ADDRESS } = config

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Adding and removing owners', () => {
  const errorMsg = sels.errorMsg
  const newOwnerName = accountsSelectors.otherAccountNames.owner6_name
  const newOwnerAddress = NON_OWNER_ADDRESS
  let currentNonce = ''

  test('Filling Form and submitting tx', async (done) => {
    console.log('Filling Form and submitting tx')
    const existingOwnerHash = FUNDS_RECEIVER_ADDRESS
    try {
      await clickByText('span', 'settings', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await clickElement(settingsPage.add_owner_btn, gnosisPage)

      await clickElement(settingsPage.add_owner_next_btn, gnosisPage)
      await assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // asserts error "required" in name
      await clickAndType(settingsPage.add_owner_name_input, gnosisPage, newOwnerName)

      await clickElement(settingsPage.add_owner_next_btn, gnosisPage)
      await assertElementPresent(errorMsg.error(errorMsg.required), gnosisPage) // asserts error "required" in name

      await clickAndType(settingsPage.add_owner_address_input, gnosisPage, '0xInvalidHash')
      await assertElementPresent(errorMsg.error(errorMsg.valid_ENS_name), gnosisPage)
      await clearInput(settingsPage.add_owner_address_input, gnosisPage)

      await clickAndType(settingsPage.add_owner_address_input, gnosisPage, existingOwnerHash)
      await assertElementPresent(errorMsg.error(errorMsg.duplicated_address), gnosisPage)
      await clearInput(settingsPage.add_owner_address_input, gnosisPage)

      await clickAndType(settingsPage.add_owner_address_input, gnosisPage, newOwnerAddress)
      await clickElement(settingsPage.add_owner_next_btn, gnosisPage)

      await clickElement(settingsPage.add_owner_review_btn, gnosisPage)
      const addedName = await getInnerText(settingsPage.add_owner_name_review.selector, gnosisPage, settingsPage.add_owner_name_review.type)
      const addedAddress = await getInnerText(settingsPage.add_owner_address_review.selector, gnosisPage, settingsPage.add_owner_address_review.type)
      expect(addedName).toBe(newOwnerName)
      expect(addedAddress).toBe(newOwnerAddress)
      // Checking the new owner name and address is present in the review step ^^^. Do we need an Id for this?
      await gnosisPage.waitForTimeout(2000)
      await assertElementPresent(settingsPage.add_owner_submit_btn.selector, gnosisPage, 'css')
      await gnosisPage.waitForFunction(
        selector => !document.querySelector(selector),
        {},
        settingsPage.add_owner_submit_btn_disabled.selector
      )
      // The submit button starts disabled. I wait for it to become enabled ^^^
      await clickElement(settingsPage.add_owner_submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      done()
    } catch (error) {
      console.log(error)
      done(error)
    }
  }, 60000)
  test('Approving and executing the transaction with owner 2', async (done) => {
    console.log('Approving the Tx with the owner 2')
    try {
      await gnosisPage.bringToFront()
      await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
      currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
      console.log('CurrentNonce = ', currentNonce)
      // We are currently using account 2
      // We approve and execute with account 1
      await approveAndExecuteWithOwner(1, gnosisPage, metamask)
      done()
    } catch (error) {
      console.log(error)
      done(error)
    }
  }, 120000)
  test('Deleting owner form filling and tx creation', async (done) => {
    console.log('Deleting owner form filling and tx creation')
    try {
      await gnosisPage.bringToFront()
      await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
      // we need a better way to know if the Queue tab is empty ^^^
      await clickByText('span', 'settings', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await assertElementPresent("[data-testid='remove-owner-btn']", gnosisPage, 'css')
      const ownersList = await gnosisPage.evaluate(() => Array.from(document.querySelectorAll("[data-testid='owners-row'] p"), element => element.textContent))
      const removeIndex = ownersList.findIndex((address) => newOwnerAddress === address)
      await gnosisPage.evaluate((removeIndex) => {
        document.querySelectorAll("[data-testid='remove-owner-btn']")[removeIndex].click()
      }, removeIndex)
      await clickElement(settingsPage.remove_owner_next_btn, gnosisPage)
      await openDropdown({ selector: '[id="mui-component-select-threshold"]', type: 'css' }, gnosisPage)
      await clickElement({ selector: "[data-value='2']", type: 'css' }, gnosisPage)
      await gnosisPage.waitForTimeout(2000)
      await clickElement(settingsPage.remove_owner_review_btn, gnosisPage)
      const removedName = await getInnerText(settingsPage.remove_owner_name_review.selector, gnosisPage, settingsPage.remove_owner_name_review.type)
      const removedAddress = await getInnerText(settingsPage.remove_owner_address_review.selector, gnosisPage, settingsPage.remove_owner_address_review.type)
      expect(removedName).toBe(newOwnerName)
      expect(removedAddress).toBe(newOwnerAddress)
      await assertElementPresent("[data-testid='remove-owner-review-btn']", gnosisPage, 'css')
      await gnosisPage.waitForFunction(
        () => !document.querySelector("[data-testid='remove-owner-review-btn'][disabled]")
      )
      await clickElement(settingsPage.remove_owner_submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      done()
    } catch (error) {
      console.log(error)
      done(error)
    }
  }, 120000)
  test('Executing the owner deletion with owner 2', async (done) => {
    console.log('Executing the owner deletion with owner 2')
    try {
      await gnosisPage.bringToFront()
      await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
      currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
      console.log('CurrentNonce = ', currentNonce)
      // We are currently using account 1
      // We approve and execute with account 2
      await approveAndExecuteWithOwner(2, gnosisPage, metamask)
      done()
    } catch (error) {
      console.log(error)
      done(error)
    }
  }, 120000)
  test('Verifying owner deletion', async (done) => {
    console.log('Verifying owner deletion')
    try {
      await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
      await clickByText('button > span > p', 'History', gnosisPage)
      const nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
      expect(nonce).toBe(currentNonce)
      const executedTxStatus = await getInnerText(transactionsTab.tx_status, gnosisPage, 'css')
      expect(executedTxStatus).toBe('Success')
      done()
    } catch (error) {
      console.log(error)
      done()
    }
  }, 120000)
})
