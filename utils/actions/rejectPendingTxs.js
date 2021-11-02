import { clickByText } from '../selectorsHelpers'
import { transactionsTab, statusLabel } from '../selectors/transactionsTab'

import { rejectNextTx } from './rejectNextTx'

const hasPendingTxs = async (gnosisPage) => {
  try {
    const element = await gnosisPage.waitForSelector(transactionsTab.tx_status, { timeout: 5000 })
    const elementText = await gnosisPage.evaluate((x) => x.innerText, element)
    return elementText === statusLabel.needs_confirmations || elementText === statusLabel.awaiting_your_confirmation
  } catch (err) {
    return false
  }
}

export const rejectPendingTxs = async (gnosisPage, metamask) => {
  let pendingTx = false
  await gnosisPage.bringToFront()
  await gnosisPage.waitForTimeout(2000)
  await clickByText('span', 'transactions', gnosisPage)
  await clickByText('span', 'Queue', gnosisPage)
  pendingTx = await hasPendingTxs(gnosisPage)

  while (pendingTx) {
    // Reject next transaction
    await rejectNextTx(gnosisPage, metamask)
    // Check if there are pending txs
    await clickByText('button > span > p', 'Queue', gnosisPage)
    pendingTx = await hasPendingTxs(gnosisPage)
  }
}
