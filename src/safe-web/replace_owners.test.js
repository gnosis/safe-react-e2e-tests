import { approveAndExecuteWithOwner } from '../../utils/actions/approveAndExecuteWithOwner'
import { verifySuccessfulExecution } from '../../utils/actions/verifySuccesfulExecution'
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
} from '../../utils/selectorsHelpers'
import { generalInterface } from '../../utils/selectors/generalInterface'
import { accountsSelectors } from '../../utils/selectors/accounts'
import { transactionsTab } from '../../utils/selectors/transactionsTab'
import { settingsPage } from '../../utils/selectors/settings'
import { initWithDefaultSafeDirectNavigation } from '../../utils/testSetup'
import config from '../../utils/config'
import { rejectPendingTxs } from '../../utils/actions/rejectPendingTxs'

/*
Replace owner
-- Add owner form, inputs name and address, validates name and address in review step. Signs and executes
-- Find added owner. click "Replace" button
-- Add valid name and address for replacement owner
-- Validate owner being replaced name and address and owner for replacement name and address in review step
-- Signs and execute
-- Validate owner for replacement present in the owner list
-- Removes owner for replacement. Sets threshold to "2". Check owner name and address in review step
-- Signs and executes
-- Checks status success of executed tx
*/

const { NON_OWNER_ADDRESS } = config

let browser
let metamask
let gnosisPage

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Owner Replacement', () => {
  // Varibles for owner replacement
  const ownerForReplacementName = accountsSelectors.otherAccountNames.owner5_name
  const ownerForReplacementAddress = accountsSelectors.testAccountsHash.acc5

  // Variables for owner adding and removal
  const newOwnerName = accountsSelectors.otherAccountNames.owner6_name
  const newOwnerAddress = NON_OWNER_ADDRESS

  test('Replacement test. Adding, Replacing and Removing owner.', async () => {
    console.log('Replace owner')
    // Owner adding
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'owners', gnosisPage)
    console.log(
      'Add owner form, inputs name and address, validates name and address in review step. Signs and executes',
    )
    await clickElement(settingsPage.add_owner_btn, gnosisPage)
    await clickAndType(settingsPage.add_owner_name_input, gnosisPage, newOwnerName)
    // Validating checksum
    await clickAndType(settingsPage.add_owner_address_input, gnosisPage, newOwnerAddress.toUpperCase())
    const newOwnerAddressChecksummed = await getInnerText(settingsPage.add_owner_address_input, gnosisPage)
    expect(newOwnerAddressChecksummed).toEqual(newOwnerAddress)
    await clickElement(settingsPage.add_owner_next_btn, gnosisPage)
    await clickElement(settingsPage.add_owner_review_btn, gnosisPage)
    const addedName = await getInnerText(settingsPage.add_owner_name_review, gnosisPage)
    const addedAddress = await getInnerText(settingsPage.add_owner_address_review, gnosisPage)
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
    await assertTextPresent({ selector: transactionsTab.tx_status, type: 'css' }, 'Needs confirmations', gnosisPage)
    const addOwnerTxNonce = await getNumberInString({ selector: 'div.tx-nonce > p', type: 'css' }, gnosisPage)
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    // Deleting owner form filling and tx creation
    await gnosisPage.bringToFront()
    await assertElementPresent({ selector: transactionsTab.no_tx_in_queue, type: 'css' }, gnosisPage)
    await verifySuccessfulExecution(gnosisPage, addOwnerTxNonce)
    // Owner adding

    console.log('Find added owner. click "Replace" button')
    // Owner replacement
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'owners', gnosisPage)
    await isTextPresent('body', 'Manage Safe Owners', gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    let ownersList = await gnosisPage.evaluate(
      (OwnerRowAddress) => Array.from(document.querySelectorAll(OwnerRowAddress), (element) => element.textContent),
      settingsPage.owner_rows_address_block.selector,
    )
    let removeIndex = ownersList.findIndex((address) => newOwnerAddress === address)
    await gnosisPage.evaluate(
      (removeIndex, replaceButton) => {
        document.querySelectorAll(replaceButton)[removeIndex].click()
      },
      removeIndex,
      settingsPage.replace_owner_btn.selector,
    )
    console.log('Add valid name and address for replacement owner')
    // We get the list of owners, find the one we have to replace and take the index, then click the replace button with the same index
    await clickAndType(settingsPage.replace_owner_name_input, gnosisPage, ownerForReplacementName)
    // Validating Checksum
    await clickAndType(settingsPage.replace_owner_address_input, gnosisPage, ownerForReplacementAddress.toUpperCase())
    const replaceOwnerAddressChecksummed = await getInnerText(settingsPage.replace_owner_address_input, gnosisPage)
    expect(replaceOwnerAddressChecksummed).toEqual(ownerForReplacementAddress)
    await clickElement(settingsPage.replace_owner_next_btn, gnosisPage)
    const toReplaceName = await getInnerText(settingsPage.add_owner_name_review, gnosisPage)
    const toReplaceAddress = await getInnerText(settingsPage.add_owner_address_review, gnosisPage)
    const replacedName = await getInnerText(settingsPage.remove_owner_name_review, gnosisPage)
    const replacedAddress = await getInnerText(settingsPage.remove_owner_address_review, gnosisPage)
    console.log(
      'Validate owner being replaced name and address and owner for replacement name and address in review step',
    )
    expect(toReplaceName).toBe(ownerForReplacementName)
    expect(toReplaceAddress).toBe(ownerForReplacementAddress)
    expect(replacedName).toBe(newOwnerName)
    expect(replacedAddress).toBe(newOwnerAddress)

    await isTextPresent(settingsPage.add_remove_replace_modal.selector, 'Submit', gnosisPage)
    // Making sure the Submit button is enabled before clicking
    console.log('Signs and execute')
    await clickElement(settingsPage.replace_owner_submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(4000)
    await metamask.signTransaction()
    await gnosisPage.bringToFront()
    await assertTextPresent({ selector: transactionsTab.tx_status, type: 'css' }, 'Needs confirmations', gnosisPage)
    const replaceOwnerTxNonce = await getNumberInString({ selector: 'div.tx-nonce > p', type: 'css' }, gnosisPage)
    // We approve and execute with account 1
    await approveAndExecuteWithOwner(2, gnosisPage, metamask)
    // Check that transaction was successfully executed
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(2000)
    await assertTextPresent({ selector: transactionsTab.tx_status, type: 'css' }, 'Pending', gnosisPage)
    // waiting for the queue list to be empty and the executed tx to be on the history tab
    await assertElementPresent({ selector: transactionsTab.no_tx_in_queue, type: 'css' }, gnosisPage)
    await verifySuccessfulExecution(gnosisPage, replaceOwnerTxNonce)
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'owners', gnosisPage)
    await isTextPresent('body', 'Manage Safe Owners', gnosisPage)
    await isTextPresent('body', ownerForReplacementAddress, gnosisPage)
    // Owner replacement

    // Owner removal
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'owners', gnosisPage)
    await assertElementPresent(settingsPage.remove_owner_trashcan_icon, gnosisPage)
    ownersList = await gnosisPage.evaluate(
      (OwnerRowAddress) => Array.from(document.querySelectorAll(OwnerRowAddress), (element) => element.textContent),
      settingsPage.owner_rows_address_block.selector,
    )
    removeIndex = ownersList.findIndex((address) => ownerForReplacementAddress === address)
    await gnosisPage.evaluate(
      (removeIndex, removeOwnerIcon) => {
        document.querySelectorAll(removeOwnerIcon)[removeIndex].click()
      },
      removeIndex,
      settingsPage.remove_owner_trashcan_icon.selector,
    )
    console.log('Removes owner for replacement. Sets threshold to "2". Check owner name and address in review step')
    await clickElement(settingsPage.remove_owner_next_btn, gnosisPage)
    await openDropdown({ selector: '[id="mui-component-select-threshold"]', type: 'css' }, gnosisPage)
    await clickElement({ selector: "[data-value='2']", type: 'css' }, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await clickElement(settingsPage.remove_owner_review_btn, gnosisPage)
    const removedName = await getInnerText(settingsPage.remove_owner_name_review, gnosisPage)
    const removedAddress = await getInnerText(settingsPage.remove_owner_address_review, gnosisPage)
    expect(removedName).toBe(ownerForReplacementName)
    expect(removedAddress).toBe(ownerForReplacementAddress)
    await assertElementPresent(settingsPage.remove_owner_submit_btn, gnosisPage)
    await gnosisPage.waitForFunction(() => !document.querySelector("[data-testid='remove-owner-review-btn'][disabled]"))
    console.log('Signs and executes')
    await clickElement(settingsPage.remove_owner_submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(4000)
    await metamask.signTransaction()
    // Executing the owner deletion with owner 2
    await gnosisPage.bringToFront()
    await assertTextPresent({ selector: transactionsTab.tx_status, type: 'css' }, 'Needs confirmations', gnosisPage)
    const deleteOwnerTxNonce = await getNumberInString({ selector: 'div.tx-nonce > p', type: 'css' }, gnosisPage)
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    console.log('Checks status success of executed tx')
    // Verifying owner deletion
    await gnosisPage.bringToFront()
    await assertElementPresent({ selector: transactionsTab.no_tx_in_queue, type: 'css' }, gnosisPage)
    await verifySuccessfulExecution(gnosisPage, deleteOwnerTxNonce)
    // Owner removal
  }, 480000)
})
