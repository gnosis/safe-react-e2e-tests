import { approveAndExecuteWithOwner } from '../utils/actions/approveAndExecuteWithOwner'
import {
  assertElementPresent,
  assertTextPresent,
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
import { accountsSelectors } from '../utils/selectors/accounts'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { settingsPage } from '../utils/selectors/settings'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'
import { rejectPendingTxs } from '../utils/rejectPendingTxs'

const { NON_OWNER_ADDRESS } = config

let browser
let metamask
let gnosisPage
let MMpage

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] =  await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Owner Replacement', () => {
  let currentNonce = ''
  let executedNonce = ''

  //Varibles for owner replacement 
  const OwnerForReplacementName = accountsSelectors.otherAccountNames.owner5_name
  const OwnerForReplacementAddress = accountsSelectors.testAccountsHash.acc5

  //Variables for owner adding and removal
  const newOwnerName = accountsSelectors.otherAccountNames.owner6_name
  const newOwnerAddress = NON_OWNER_ADDRESS


  test('Replacement test. Adding, Replacing and Removing owner.', async (done) => {
    console.log('Replacement test. Adding, Replacing and Removing owner.')
    try {
      //Owner adding
      await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
      await clickByText('span', 'settings', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await clickElement(settingsPage.add_owner_btn, gnosisPage)
      await clickAndType(settingsPage.add_owner_name_input, gnosisPage, newOwnerName)
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
      await assertElementPresent(settingsPage.add_owner_submit_btn.selector, gnosisPage, 'css')
      await gnosisPage.waitForFunction(
        (selector) => !document.querySelector(selector),
        {},
        settingsPage.add_owner_submit_btn_disabled.selector,
      )
      // The submit button starts disabled. I wait for it to become enabled ^^^
      await clickElement(settingsPage.add_owner_submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      // Approving and executing the transaction with owner 2
      await gnosisPage.bringToFront()
      await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
      currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
      console.log('CurrentNonce = ', currentNonce)
      await approveAndExecuteWithOwner(1, gnosisPage, metamask)
      // Deleting owner form filling and tx creation
      await gnosisPage.bringToFront()
      await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
      await clickByText('button > span > p', 'History', gnosisPage)
      // Wating for the new tx to show in the history, looking for the nonce
      await gnosisPage.waitForTimeout(2000)
      executedNonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
      expect(executedNonce).toBe(currentNonce)
      //Owner adding

      //Owner replacement
      await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
      await clickByText('span', 'SETTINGS', gnosisPage)
      await isTextPresent('body', 'Contract Version', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await isTextPresent('body', 'Manage Safe Owners', gnosisPage)
      await gnosisPage.waitForTimeout(2000)
      let ownersList = await gnosisPage.evaluate((OwnerRowAddress) => 
        Array.from(document.querySelectorAll(OwnerRowAddress), element => element.textContent),
        settingsPage.owner_rows_address_block.selector)
      let removeIndex = ownersList.findIndex((address) => newOwnerAddress === address)
      await gnosisPage.evaluate((removeIndex, replaceButton) => {
        document.querySelectorAll(replaceButton)[removeIndex].click()
      }, removeIndex, settingsPage.replace_owner_btn.selector)
      //We get the list of owners, find the one we have to replace and take the index, then click the replace button with the same index
      await clickAndType(settingsPage.replace_owner_name_input, gnosisPage, OwnerForReplacementName)
      await clickAndType(settingsPage.replace_owner_address_input, gnosisPage, OwnerForReplacementAddress)
      await clickElement(settingsPage.replace_owner_next_btn, gnosisPage)
      await isTextPresent(settingsPage.add_remove_replace_modal.selector, "REMOVING OWNER ↓", gnosisPage)
      await isTextPresent(settingsPage.add_remove_replace_modal.selector, "ADDING NEW OWNER ↓", gnosisPage)
      await isTextPresent(settingsPage.add_remove_replace_modal.selector, OwnerForReplacementName, gnosisPage)
      await isTextPresent(settingsPage.add_remove_replace_modal.selector, OwnerForReplacementAddress, gnosisPage)
      //^^^----------------We probably have to add some test-id here, these isTextPresent are too vague.---------------------^^^
      await isTextPresent(settingsPage.add_remove_replace_modal.selector, "Submit", gnosisPage)
      //Making sure the Submit button is enabled before clicking
      await clickElement(settingsPage.replace_owner_submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      await gnosisPage.bringToFront()
      await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
      currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
      console.log('CurrentNonce = ', currentNonce)
      // We approve and execute with account 1
      await approveAndExecuteWithOwner(2, gnosisPage, metamask)
      // Check that transaction was successfully executed
      await gnosisPage.bringToFront()
      await gnosisPage.waitForTimeout(2000)
      await assertTextPresent(transactionsTab.tx_status, 'Pending', gnosisPage, 'css')
      // waiting for the queue list to be empty and the executed tx to be on the history tab
      await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
      await clickByText('button > span > p', 'History', gnosisPage)
      // Wating for the new tx to show in the history, looking for the nonce
      await gnosisPage.waitForTimeout(2000)
      executedNonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
      expect(executedNonce).toBe(currentNonce)
      await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
      await clickByText('span', 'SETTINGS', gnosisPage)
      await isTextPresent('body', 'Contract Version', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await isTextPresent('body', 'Manage Safe Owners', gnosisPage)
      await isTextPresent('body', OwnerForReplacementAddress, gnosisPage)
      //Owner replacement

      //Owner removal
      await clickByText('span', 'settings', gnosisPage)
      await clickElement(settingsPage.owners_tab, gnosisPage)
      await assertElementPresent(settingsPage.remove_owner_trashcan_icon.selector, gnosisPage, 'css')
      ownersList = await gnosisPage.evaluate((OwnerRowAddress) =>
        Array.from(document.querySelectorAll(OwnerRowAddress), (element) => element.textContent), 
        settingsPage.owner_rows_address_block.selector)
      removeIndex = ownersList.findIndex((address) => OwnerForReplacementAddress === address)
      await gnosisPage.evaluate((removeIndex, removeOwnerIcon) => {
        document.querySelectorAll(removeOwnerIcon)[removeIndex].click()
      }, removeIndex,settingsPage.remove_owner_trashcan_icon.selector)
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
      expect(removedName).toBe(OwnerForReplacementName)
      expect(removedAddress).toBe(OwnerForReplacementAddress)
      await assertElementPresent(settingsPage.remove_owner_submit_btn.selector, gnosisPage, 'css')
      await gnosisPage.waitForFunction(
        () => !document.querySelector("[data-testid='remove-owner-review-btn'][disabled]"),
      )
      await clickElement(settingsPage.remove_owner_submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      // Executing the owner deletion with owner 2
      await gnosisPage.bringToFront()
      await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
      currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
      console.log('CurrentNonce = ', currentNonce)
      await approveAndExecuteWithOwner(1, gnosisPage, metamask)
      // Verifying owner deletion
      await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
      await clickByText('button > span > p', 'History', gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      executedNonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
      expect(executedNonce).toBe(currentNonce)
      const executedTxStatus = await getInnerText(transactionsTab.tx_status, gnosisPage, 'css')
      expect(executedTxStatus).toBe('Success')
      //Owner removal
      done()
    } catch (error) {
      done(error)
    }
  }, 360000)
})
