import {
  assertElementPresent,
  assertTextPresent,
  clickByText,
  clickElement
} from '../selectorsHelpers'

import { generalInterface } from '../selectors/generalInterface'
import { sendFundsForm } from '../selectors/sendFundsForm'
import { transactionsTab } from '../selectors/transactionsTab'

/**
 * Being in transaction queue tab, assuming a Safe with 2 required signatures and only last one is pending,
 * this method switches to the selected owner id in metamask, signs and execute the transaction
 *
 * @param {number} owner owner id number from metamask list
 * @param {gnosisPage} gnosisPage puppeteer instance of Gnosis Safe page
 * @param {metamask} metamask dappeteer metamask object
 *
 */
export const approveAndExecuteWithOwner = async (owner, gnosisPage, metamask) => {
  await metamask.switchAccount(owner)
  await gnosisPage.bringToFront()
  await gnosisPage.waitForTimeout(3000)
  await assertTextPresent({selector: transactionsTab.tx_status, type: 'css'}, 'Needs your confirmation', gnosisPage)
  await assertTextPresent({selector: 'div.tx-votes > div > p', type:'css'}, '1 out of 2', gnosisPage)
  await clickElement(transactionsTab.tx_type, gnosisPage)
  await gnosisPage.waitForTimeout(3000)
  await clickByText('button > span', 'Confirm', gnosisPage)
  await assertElementPresent({selector: generalInterface.execute_checkbox, type: 'css'}, gnosisPage)
  await assertElementPresent(sendFundsForm.advanced_options, gnosisPage)
  await assertElementPresent(generalInterface.submit_btn, gnosisPage)
  await gnosisPage.waitForFunction(selector => !document.querySelector(selector), {}, generalInterface.submit_tx_btn_disabled)
  await clickElement(generalInterface.submit_btn, gnosisPage)
  await gnosisPage.waitForTimeout(2000)
  await metamask.confirmTransaction()
}
