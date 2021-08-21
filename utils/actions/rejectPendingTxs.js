import { clickByText } from '../selectorsHelpers'
import { transactionsTab, statusLabel } from '../selectors/transactionsTab'

import { rejectNextTx } from './rejectNextTx'

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
    // Reject next transaction
    await rejectNextTx(gnosisPage, metamask)
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
