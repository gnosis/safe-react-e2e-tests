import {
  assertElementPresent,
  assertTextPresent,
  clickByText,
  clickElement,
  getInnerText,
} from '../selectorsHelpers'
import { generalInterface } from '../selectors/generalInterface'
import { sendFundsForm } from '../selectors/sendFundsForm'
import { transactionsTab, statusLabel } from '../selectors/transactionsTab'

export const rejectPendingTxs = async (gnosisPage, metamask) => {
  let element
  let elementText
  let pendingTx = false
  await gnosisPage.bringToFront()
  await gnosisPage.waitForTimeout(2000)
  await clickByText('span', 'transactions', gnosisPage)
  try {
    element = await gnosisPage.waitForSelector(transactionsTab.tx_status, { timeout: 10000 })
    elementText = await gnosisPage.evaluate(x => x.innerText, element)
    pendingTx = elementText === statusLabel.needs_confirmations || elementText === statusLabel.awaiting_your_confirmation
  } catch (err) {
    pendingTx = false
  }
  while (pendingTx) {
    await metamask.switchAccount(2)
    await gnosisPage.bringToFront()
    const currentNonce = await getInnerText('div.tx-nonce > p', gnosisPage, 'css')
    await gnosisPage.waitForTimeout(3000)
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
    await gnosisPage.bringToFront()
    await assertElementPresent(transactionsTab.on_chain_rejection_type.selector, gnosisPage, 'css')

    await metamask.switchAccount(1) // changing to account 1
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(3000)
    await clickElement(transactionsTab.on_chain_rejection_type, gnosisPage)
    // await clickByText(transactionsTab.tx_type.selector, 'On-chain rejection', gnosisPage)
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
    await clickByText('button > span > p', 'History', gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    const executedTxType = await getInnerText(transactionsTab.tx_type.selector, gnosisPage, 'css')
    expect(executedTxType).toBe('On-chain rejection')
    const executedTxStatus = await getInnerText(transactionsTab.tx_status, gnosisPage, 'css')
    await gnosisPage.waitForFunction((nonce) =>
      document.querySelector('div.tx-nonce').innerText.includes(nonce), {}, currentNonce
    )
    expect(executedTxStatus).toBe('Success')
    // Check if there are pending txs
    await clickByText('button > span > p', 'Queue', gnosisPage)
    try {
      element = await gnosisPage.waitForSelector(transactionsTab.tx_status, { timeout: 10000 })
      elementText = await gnosisPage.evaluate(x => x.innerText, element)
      pendingTx = elementText === statusLabel.needs_confirmations || elementText === statusLabel.awaiting_your_confirmation
    } catch (err) {
      pendingTx = false
    }
  }
}
