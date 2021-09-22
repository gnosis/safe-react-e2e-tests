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
  console.log('Modify policies')
  let firsTransactionNonce = ''

  test('Change Policies', async () => {
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
    await assertElementPresent(sendFundsForm.advanced_options.selector, gnosisPage, 'Xpath')
    await assertElementPresent(generalInterface.submit_btn.selector, gnosisPage, 'css')
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
    await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
    firsTransactionNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
    // We approve and execute with account 1
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    // Verifying the change in the settings
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(2000)
    await assertTextPresent(transactionsTab.tx_status, 'Pending', gnosisPage, 'css')
    // waiting for the queue list to be empty and the executed tx to be on the history tab
    await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
    await clickByText('button > span > p', 'History', gnosisPage)
    await gnosisPage.waitForFunction(
      (selector, nonce) => {
        console.log('nonce = ', nonce)
        // I have to keep asking if the tx with the nonce + 1 is in the history tab, assuring the tx was executed
        return Array.from(document.querySelectorAll(selector))
          .map((e) => e.innerText)
          .includes(nonce.toString())
      },
      {},
      transactionsTab.tx_nonce,
      firsTransactionNonce,
    )
    // Wating for the new tx to show in the history, looking for the nonce
    let nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
    expect(nonce).toBe(firsTransactionNonce)
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
    await assertElementPresent(sendFundsForm.advanced_options.selector, gnosisPage, 'Xpath')
    await assertElementPresent(generalInterface.submit_btn.selector, gnosisPage, 'css')
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
    const secondTransactionNonce = firsTransactionNonce + 1
    await gnosisPage.waitForFunction(
      (selector, nonce) => {
        console.log('nonce = ', nonce)
        // Once again I repeteadily ask if the latest executed tx nonce is present, should be secondTransactionNonce
        return Array.from(document.querySelectorAll(selector))
          .map((e) => e.innerText)
          .includes(nonce.toString())
      },
      {},
      transactionsTab.tx_nonce,
      secondTransactionNonce,
    )
    nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
    expect(nonce).toBe(secondTransactionNonce)
    await isTextPresent(generalInterface.sidebar, 'SETTINGS', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'settings', gnosisPage)
    await clickByText(generalInterface.sidebar + ' span', 'policies', gnosisPage)
    await isTextPresent('body', 'Required confirmations', gnosisPage)
    await isTextPresent('body', '2 out of', gnosisPage)
  }, 180000)
})
