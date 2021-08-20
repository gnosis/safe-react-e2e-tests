import {
  assertElementPresent,
  clickAndType,
  clickByText,
  clickElement,
  openDropdown,
  getNumberInString,
} from '../utils/selectorsHelpers'
import { generalInterface } from '../utils/selectors/generalInterface'
import { sendFundsForm } from '../utils/selectors/sendFundsForm'
import { assetsTab } from '../utils/selectors/assetsTab'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'
import { rejectNextTx } from '../utils/actions/rejectNextTx'
import { rejectPendingTxs } from '../utils/actions/rejectPendingTxs'

let browser
let metamask
let gnosisPage

const { FUNDS_RECEIVER_ADDRESS } = config

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Reject transaction flow', () => {
  let startBalance = 0.0

  test('Reject transaction flow', async (done) => {
    try {
      await assertElementPresent(assetsTab.balance_value('eth'), gnosisPage, 'css')
      startBalance = await getNumberInString(assetsTab.balance_value('eth'), gnosisPage, 'css')
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
      await metamask.signTransaction()
      // Rejecting transaction
      await rejectNextTx(gnosisPage, metamask)

      await clickByText('span', 'ASSETS', gnosisPage)
      await assertElementPresent(assetsTab.balance_value('eth'), gnosisPage, 'css')
      // await gnosisPage.waitForTimeout(4000)
      const finalBalance = await getNumberInString(assetsTab.balance_value('eth'), gnosisPage, 'css')
      // Balance should not have changed
      expect(finalBalance).toBe(startBalance)
      done()
    } catch (error) {
      console.log(error)
      done(error)
    }
  }, 345000)
})
