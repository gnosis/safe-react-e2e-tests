import {
  assertElementPresent,
  assertTextPresent,
  clickByText,
  clickElement,
  getInnerText,
} from '../selectorsHelpers'
import { generalInterface } from '../selectors/generalInterface'
import { sendFundsForm } from '../selectors/sendFundsForm'
import { transactionsTab } from '../selectors/transactionsTab'

/**
 * Being in transaction queue tab, assuming a Safe with 2 required signatures,
 * this method rejects the NEXT transaction using the first two owners. It checks that rejection is executed.
 *
 * @param {gnosisPage} gnosisPage puppeteer instance of Gnosis Safe page
 * @param {metamask} metamask dappeteer metamask object
 *
 */
export const rejectNextTx = async (gnosisPage, metamask) => {
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
    await metamask.signTransaction()
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
    // We wait until tx with expected nonce get into the history list
    await gnosisPage.waitForFunction((nonce) =>
      document.querySelector('div.tx-nonce').innerText.includes(nonce), {}, currentNonce
    )
    const executedTxType = await getInnerText(transactionsTab.tx_type.selector, gnosisPage, 'css')
    expect(executedTxType).toBe('On-chain rejection')
    const executedTxStatus = await getInnerText(transactionsTab.tx_status, gnosisPage, 'css')
    expect(executedTxStatus).toBe('Success')
}