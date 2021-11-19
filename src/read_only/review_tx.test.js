import {
  assertElementPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getNumberInString,
  getInnerText,
  openDropdown,
} from '../../utils/selectorsHelpers'
import { assetsTab } from '../../utils/selectors/assetsTab'
import { generalInterface } from '../../utils/selectors/generalInterface'
import { sendFundsForm } from '../../utils/selectors/sendFundsForm'
import { errorMsg } from '../../utils/selectors/errorMsg'
import { initWithDefaultSafeDirectNavigation } from '../../utils/testSetup'
import config from '../../utils/config'
import { rejectPendingTxs } from '../../utils/actions/rejectPendingTxs'

/*
Create and review a Send Funds transaction
-- Open send funds form
-- Types a receiver address
-- Selects ETH token to send (is hardcoded to send only ETH, so it will fail for other networks currently)
-- Validates error for invalid amounts: 0, "abc", 99999
-- Checks "Send max" button
-- Checks receiver address and amount input in the review step
-- Checks that advanced options are rendered'
*/

let browser
let metamask
let gnosisPage

const { FUNDS_RECEIVER_ADDRESS } = config
const TOKEN_AMOUNT = 0.01

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Read-only transaction creation and review', () => {
  let currentEthFunds = ''

  test('Create and review a Send Funds transaction', async () => {
    console.log('Create and review a Send Funds transaction')
    await getInnerText({ selector: assetsTab.balance_value('eth'), type: 'css' }, gnosisPage)
    currentEthFunds = parseFloat(
      await getNumberInString({ selector: assetsTab.balance_value('eth'), type: 'css' }, gnosisPage),
    )
    // Open the send funds form
    console.log('Open the send funds form')
    await clickByText('button', 'New Transaction', gnosisPage)
    console.log('Types a receiver address')
    await clickElement({ selector: generalInterface.modal_send_funds_btn }, gnosisPage)
    await assertElementPresent(sendFundsForm.review_btn_disabled, gnosisPage)
    await gnosisPage.waitForTimeout(3000)
    // Fill the form and check error messages when inputs are wrong

    // Input the receiver. Checks checksum validation
    await clickAndType(sendFundsForm.recipient_input, gnosisPage, FUNDS_RECEIVER_ADDRESS.toUpperCase())
    const receiverAddressChecksummed = await getInnerText(sendFundsForm.recipient_input_value_entered, gnosisPage)
    expect(receiverAddressChecksummed).toEqual(FUNDS_RECEIVER_ADDRESS) // The input should checksum the uppercase text automatically.

    console.log(
      'Selects ETH token to send (is hardcoded to send only ETH, so it will fail for other networks currently)',
    )
    await openDropdown(sendFundsForm.select_token, gnosisPage)
    await clickElement(sendFundsForm.select_token_ether, gnosisPage)

    await gnosisPage.waitForTimeout(1000)
    // Validates error fixed in #2758. Remove the comment when 2758 is merged. The Review button should be still be disabled by this point
    // await assertElementPresent(sendFundsForm.review_btn_disabled, gnosisPage)

    console.log('Validates error for invalid amounts: 0, "abc", 99999')
    // Checking that 0 amount triggers an error
    await clickAndType(sendFundsForm.amount_input, gnosisPage, '0')
    await assertElementPresent({ selector: errorMsg.error(errorMsg.greater_than_0), type: 'Xpath' }, gnosisPage)
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    // Checking that any string returns an error
    await clickAndType(sendFundsForm.amount_input, gnosisPage, 'abc')
    await assertElementPresent({ selector: errorMsg.error(errorMsg.not_a_number), type: 'Xpath' }, gnosisPage)
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    // Checking that an amount over balance triggers an error
    await clickAndType(sendFundsForm.amount_input, gnosisPage, '99999')
    await assertElementPresent(
      { selector: errorMsg.error(errorMsg.max_amount_tokens(currentEthFunds)), type: 'Xpath' },
      gnosisPage,
    )
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    console.log('Checks "Send max" button')
    // Checking that the value set by the "Send max" button is the same as the current balance
    await clickElement(sendFundsForm.send_max_btn, gnosisPage)
    const maxInputValue = await getNumberInString(sendFundsForm.amount_input, gnosisPage)
    expect(parseFloat(maxInputValue)).toBe(currentEthFunds)
    await clearInput(sendFundsForm.amount_input, gnosisPage)
    await clickAndType(sendFundsForm.amount_input, gnosisPage, TOKEN_AMOUNT.toString())
    await assertElementPresent(sendFundsForm.valid_amount_msg, gnosisPage)
    await clickElement(sendFundsForm.review_btn, gnosisPage)
    console.log('Checks receiver address and amount input in the review step')
    // Review information is correct and submit transaction with signature
    await assertElementPresent(sendFundsForm.send_funds_review, gnosisPage)
    await assertElementPresent(sendFundsForm.recipient_address_review, gnosisPage)
    const recipientHash = await getInnerText(sendFundsForm.recipient_address_review, gnosisPage)
    expect(recipientHash).toMatch(FUNDS_RECEIVER_ADDRESS)
    const tokenAmount = await getInnerText(sendFundsForm.amount_eth_review, gnosisPage)
    expect(tokenAmount).toMatch(TOKEN_AMOUNT.toString())
    console.log('Checks that advanced options are rendered')
    await assertElementPresent(sendFundsForm.advanced_options, gnosisPage)
  }, 290000)
})
