import {
    clickByText,
    getInnerText,
    getNumberInString,
  } from '../selectorsHelpers'
import { transactionsTab } from '../selectors/transactionsTab'

/**
 * This tx verifies the successful execution of a signed tx. After the submit of the tx by the first owner, in the queue tab
 * you must get the nonce number of the new tx with:
 * const nonce = await getNumberInString({ selector: 'div.tx-nonce > p', type: 'css' }, gnosisPage)
 * After the execution of the tx call this function with that nonce
 * 
 * @param {number} nonce is the nonce of the current tx 
 * @param {gnosisPage} gnosisPage puppeteer instance of Gnosis Safe page
 *
 */

export const verifySuccessfulExecution = async (gnosisPage, nonce) => {
await clickByText('button > span > p', 'History', gnosisPage)
await gnosisPage.waitForFunction(
    (selector, nonce) => document.querySelector(selector).innerText.includes(nonce),
    { timeout: 0 },
    transactionsTab.tx_nonce,
    nonce,
  )
  const currentNonce = await getNumberInString({ selector: transactionsTab.tx_nonce, type: 'css' }, gnosisPage)
  expect(currentNonce).toBe(nonce)
  const executedTxStatus = await getInnerText({ selector: transactionsTab.tx_status, type: 'css' }, gnosisPage)
  expect(executedTxStatus).toBe('Success')
}
