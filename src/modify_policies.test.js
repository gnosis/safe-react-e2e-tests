import { approveAndExecuteWithOwner } from '../utils/actions/approveAndExecuteWithOwner'
import {
  assertElementPresent,
  assertTextPresent,
  clickByText,
  clickElement,
  getNumberInString,
  isTextPresent,
  openDropdown,
  getInnerText,
} from '../utils/selectorsHelpers'
import { generalInterface } from '../utils/selectors/generalInterface'
import { sendFundsForm } from '../utils/selectors/sendFundsForm'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { settingsTabs } from '../utils/selectors/settings'
import { rejectPendingTxs } from '../utils/actions/rejectPendingTxs'

import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'

/*
Modify policies
-- Opens modify policies
-- Opens selector, selects "1" value
-- Signs transaction with current owner, confirm and executes with the 2nd owner
-- Opens modify policies again, changes it to "2"
-- Signs and execute
-- Checks in settings the successful change to "2 out of X"
*/

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

describe('Change Policies', () => {
  let transactionNonce = ''

  // let owner_amount = false //amount of owners, will be taken from the owners tab in the settings
  // let req_conf = false //current required confirmations. taken from the message in the policies tab
  // let max_req_conf = false //max required confirmations. taken from the message in the policies tab

  test('Change Policies', async (done) => {
    // Open Modify form
    await gnosisPage.waitForTimeout(2000)
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'policies', gnosisPage)
    await isTextPresent('body', 'Required confirmations', gnosisPage)
    await isTextPresent('body', '2 out of', gnosisPage)
    await clickByText('span', 'Change', gnosisPage)
    await isTextPresent('body', 'Change required confirmations', gnosisPage)
    // Creating and approving Tx with owner 1
    await openDropdown(settingsTabs.req_conf_dropdown, gnosisPage)
    await clickElement({ selector: '[data-value="1"]' }, gnosisPage)
    await assertElementPresent(sendFundsForm.advanced_options, gnosisPage)
    await assertElementPresent(generalInterface.submit_btn, gnosisPage)
    await gnosisPage.waitForFunction(
      (selector) => !document.querySelector(selector),
      {},
      generalInterface.submit_tx_btn_disabled,
    )
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await metamask.signTransaction()
    // Approving Tx with owner 2
    await gnosisPage.bringToFront()
    await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
    transactionNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
    console.log('CurrentNonce = ', transactionNonce)
    // We approve and execute with account 1
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    // Verifying the change in the settings
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(2000)
    await assertTextPresent(transactionsTab.tx_status, 'Pending', gnosisPage, 'css')
    // waiting for the queue list to be empty and the executed tx to be on the history tab
    await assertElementPresent({selector: transactionsTab.no_tx_in_queue, type: 'css'}, gnosisPage)
    await clickByText('button > span > p', 'History', gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    // Wating for the new tx to show in the history, looking for the nonce
    let nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
    expect(nonce).toBe(transactionNonce)
    await clickElement(transactionsTab.tx_type, gnosisPage)
    const changeConfirmationText = await getInnerText('div.tx-details > p', gnosisPage, 'css')
    expect(changeConfirmationText).toBe('Change required confirmations:')
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'policies', gnosisPage)
    await isTextPresent('body', 'Required confirmations', gnosisPage)
    await isTextPresent('body', '1 out of', gnosisPage)
    // Create Tx to revert it back to initial state
    await clickByText('span', 'Change', gnosisPage)
    await isTextPresent('body', 'Change required confirmations', gnosisPage)
    await openDropdown(settingsTabs.req_conf_dropdown, gnosisPage)
    await clickElement({ selector: '[data-value="2"]' }, gnosisPage)
    await assertElementPresent(sendFundsForm.advanced_options, gnosisPage)
    await assertElementPresent(generalInterface.submit_btn, gnosisPage)
    await gnosisPage.waitForFunction(
      (selector) => !document.querySelector(selector),
      {},
      generalInterface.submit_tx_btn_disabled,
    )
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await metamask.confirmTransaction()
    // Verifying the rollback
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(2000)
    await clickByText('button > span > p', 'History', gnosisPage)
    // Wating for the tx execution notification, history should update after
    await isTextPresent('body', 'Transaction successfully executed', gnosisPage)
    const expectedNonce = transactionNonce + 1
    await gnosisPage.waitForTimeout(1000)
    nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
    expect(nonce).toBe(expectedNonce)
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'policies', gnosisPage)
    await isTextPresent('body', 'Required confirmations', gnosisPage)
    await isTextPresent('body', '2 out of', gnosisPage)
    done()
  }, 180000)
})
