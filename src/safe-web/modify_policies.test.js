import { approveAndExecuteWithOwner } from '../../utils/actions/approveAndExecuteWithOwner'
import { verifySuccessfulExecution } from '../../utils/actions/verifySuccesfulExecution'

import {
  assertElementPresent,
  assertTextPresent,
  clickByText,
  clickElement,
  getNumberInString,
  isTextPresent,
  openDropdown,
  getInnerText,
} from '../../utils/selectorsHelpers'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { generalInterface } from '../../utils/selectors/generalInterface'
import { sendFundsForm } from '../../utils/selectors/sendFundsForm'
import { transactionsTab } from '../../utils/selectors/transactionsTab'
import { settingsTabs } from '../../utils/selectors/settings'
import { rejectPendingTxs } from '../../utils/actions/rejectPendingTxs'

import { initWithDefaultSafeDirectNavigation } from '../../utils/testSetup'

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

let recorder

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await recorder.stop()
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Change Policies', () => {
  console.log('Modify policies')
  let firsTransactionNonce = ''

  test('Change Policies', async () => {
    recorder = new PuppeteerScreenRecorder(gnosisPage)
    await recorder.start('./e2e-tests-assets/modify_policies.mp4')

    console.log('Opens modify policies')
    // Open Modify form
    await gnosisPage.waitForTimeout(2000)
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'policies', gnosisPage)
    await isTextPresent('body', 'Required confirmations', gnosisPage)
    await isTextPresent('body', '2 out of', gnosisPage)
    await clickByText('span', 'Change', gnosisPage)
    await isTextPresent('body', 'Change required confirmations', gnosisPage)
    console.log('Opens selector, selects "1" value')
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
    console.log('Signs transaction with current owner, confirm and executes with the 2nd owner')
    await metamask.signTransaction()
    // Approving Tx with owner 2
    await gnosisPage.bringToFront()
    await assertTextPresent({ selector: transactionsTab.tx_status, type: 'css' }, 'Needs confirmations', gnosisPage)
    firsTransactionNonce = await getNumberInString({ selector: 'div.tx-nonce > p', type: 'css' }, gnosisPage)
    // We approve and execute with account 1
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    // Verifying the change in the settings
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(2000)
    await assertTextPresent({ selector: transactionsTab.tx_status, type: 'css' }, 'Pending', gnosisPage)
    // waiting for the queue list to be empty and the executed tx to be on the history tab
    await assertElementPresent({ selector: transactionsTab.no_tx_in_queue, type: 'css' }, gnosisPage)
    await verifySuccessfulExecution(gnosisPage, firsTransactionNonce)
    await clickElement(transactionsTab.tx_type, gnosisPage)
    const changeConfirmationText = await getInnerText({ selector: 'div.tx-details > p', type: 'css' }, gnosisPage)
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
    // Wating for the tx execution notification, history should update after
    await isTextPresent('body', 'Transaction successfully executed', gnosisPage)
    const secondTransactionNonce = firsTransactionNonce + 1
    await verifySuccessfulExecution(gnosisPage, secondTransactionNonce)
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'policies', gnosisPage)
    await isTextPresent('body', 'Required confirmations', gnosisPage)
    await isTextPresent('body', '2 out of', gnosisPage)
  }, 210000)
})
