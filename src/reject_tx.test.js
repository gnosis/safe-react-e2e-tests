import * as gFunc from '../utils/selectorsHelpers'
import {
  assertElementPresent,
  assertTextPresent,
  clickAndType,
  clickByText,
  clickElement,
  getInnerText,
  openDropdown
} from '../utils/selectorsHelpers'
import { sels } from '../utils/selectors'
import { generalInterface } from '../utils/selectors/generalInterface'
import { sendFundsForm } from '../utils/selectors/sendFundsForm'
import { transactionsTab, statusLabel } from '../utils/selectors/transactionsTab'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'
import { rejectPendingTxs } from '../utils/rejectPendingTxs'

let browser
let metamask
let gnosisPage
let MMpage

const { FUNDS_RECEIVER_ADDRESS } = config

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Reject transaction flow', () => {
  let startBalance = 0.0

  const assetTab = sels.testIdSelectors.asset_tab

  test('Reject transaction flow', async (done) => {
    try {
      await assertElementPresent(assetTab.balance_value('eth'), gnosisPage, 'css')
      startBalance = await gFunc.getNumberInString(assetTab.balance_value('eth'), gnosisPage, 'css')
      await clickByText('button', 'New Transaction', gnosisPage)
      await clickElement({ selector: generalInterface.modal_send_funds_btn }, gnosisPage)
      await assertElementPresent(sendFundsForm.review_btn_disabled.selector, gnosisPage, 'css')
      // Filling the form
      await clickAndType(sendFundsForm.recipient_input, gnosisPage, FUNDS_RECEIVER_ADDRESS)
      await openDropdown(sendFundsForm.select_token, gnosisPage)
      await clickElement(sendFundsForm.select_token_ether, gnosisPage)
      await clickAndType(sendFundsForm.amount_input, gnosisPage, '0.01')
      await assertElementPresent(sendFundsForm.valid_amount_msg.selector, gnosisPage)
      await gnosisPage.waitForTimeout(2000)
      await clickElement(sendFundsForm.review_btn, gnosisPage)
      // Approving the transaction with the owner 1
      await assertElementPresent(sendFundsForm.submit_btn.selector, gnosisPage, 'css')
      await clickElement(sendFundsForm.submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      // Rejecting transaction with the 1st owner
      await gnosisPage.bringToFront()
      await assertTextPresent(transactionsTab.tx_status, statusLabel.needs_confirmations, gnosisPage, 'css')
      await assertTextPresent('#infinite-scroll-container > div > p', 'NEXT TRANSACTION', gnosisPage, 'css')
      await clickElement(transactionsTab.tx_type, gnosisPage)
      await gnosisPage.waitForTimeout(3000)
      await clickByText('button > span', 'Reject', gnosisPage)
      // making sure that a "Reject Transaction" text exist in the page first
      await gnosisPage.waitForFunction(() =>
        document.querySelector('body').innerText.includes('Reject transaction')
      )
      await assertElementPresent(sendFundsForm.advanced_options.selector, gnosisPage, 'Xpath')
      await assertElementPresent(generalInterface.submit_btn.selector, gnosisPage, 'css')
      await gnosisPage.waitForFunction(selector => !document.querySelector(selector), {}, generalInterface.submit_tx_btn_disabled)
      await clickElement(generalInterface.submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.sign()
      // Rejecting transaction with 2nd owner
      await gnosisPage.bringToFront()
      await assertElementPresent(transactionsTab.on_chain_rejection_type.selector, gnosisPage, 'css')
      await metamask.switchAccount(1) // changing to account 1
      await gnosisPage.bringToFront()
      await gnosisPage.waitForTimeout(3000)
      await clickElement(transactionsTab.on_chain_rejection_type, gnosisPage)
      await gnosisPage.waitForTimeout(1000)
      await clickByText('button > span', 'Confirm', gnosisPage)
      await gnosisPage.waitForFunction(() =>
        document.querySelector('body').innerText.includes('Approve Transaction')
      )
      await assertElementPresent(sendFundsForm.advanced_options.selector, gnosisPage, 'Xpath')
      await assertElementPresent(generalInterface.submit_btn.selector, gnosisPage, 'css')
      await gnosisPage.waitForFunction(selector => !document.querySelector(selector), {}, generalInterface.submit_tx_btn_disabled)
      await clickElement(generalInterface.submit_btn, gnosisPage)
      await gnosisPage.waitForTimeout(4000)
      await metamask.confirmTransaction()
      await gnosisPage.bringToFront()
      await gnosisPage.waitForTimeout(2000)
      // waiting for the queue list to be empty and the executed tx to be on the history tab
      await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
      await clickByText('button > span > p', 'History', gnosisPage)
      await gnosisPage.waitForTimeout(2000)
      const executedTxType = await getInnerText(transactionsTab.tx_type.selector, gnosisPage, 'css')
      expect(executedTxType).toBe('On-chain rejection')
      const executedTxStatus = await getInnerText(transactionsTab.tx_status, gnosisPage, 'css')
      expect(executedTxStatus).toBe('Success')
      await clickByText('span', 'ASSETS', gnosisPage)
      await assertElementPresent(assetTab.balance_value('eth'), gnosisPage, 'css')
      // await gnosisPage.waitForTimeout(4000)
      const finalBalance = await gFunc.getNumberInString(assetTab.balance_value('eth'), gnosisPage, 'css')
      // Balance should not have changed
      expect(finalBalance).toBe(startBalance)
      done()
    } catch (error) {
      console.log(error)
      done(error)
    }
  }, 345000)
})
