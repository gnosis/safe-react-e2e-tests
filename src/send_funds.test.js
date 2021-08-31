import { approveAndExecuteWithOwner } from '../utils/actions/approveAndExecuteWithOwner'
import {
  assertElementPresent,
  assertAllElementPresent,
  assertTextPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getNumberInString,
  getInnerText,
  openDropdown,
} from '../utils/selectorsHelpers'
import { assetsTab } from '../utils/selectors/assetsTab'
import { generalInterface } from '../utils/selectors/generalInterface'
import { sendFundsForm } from '../utils/selectors/sendFundsForm'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { errorMsg } from '../utils/selectors/errorMsg'
import { initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import config from '../utils/config'
import { rejectPendingTxs } from '../utils/actions/rejectPendingTxs'

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

describe('Send funds and sign with two owners', () => {
  let currentEthFunds = ''
  let currentEthFundsOnText = ''
  let currentNonce = ''

  test('Send funds and return the funds', async () => {
    console.log('Open the send funds form\n')
    // Open the send funds form
    currentEthFundsOnText = await getInnerText(assetsTab.balance_value('eth'), gnosisPage, 'css')
    currentEthFunds = parseFloat(await getNumberInString(assetsTab.balance_value('eth'), gnosisPage, 'css'))
    await clickByText('button', 'New Transaction', gnosisPage)
    await clickElement({ selector: generalInterface.modal_send_funds_btn }, gnosisPage)
    await assertElementPresent(sendFundsForm.review_btn_disabled.selector, gnosisPage, 'css')
    await gnosisPage.waitForTimeout(3000)
    // Fill the form and check error messages when inputs are wrong
    await clickAndType(sendFundsForm.recipient_input, gnosisPage, FUNDS_RECEIVER_ADDRESS)

    await openDropdown(sendFundsForm.select_token, gnosisPage)
    await clickElement(sendFundsForm.select_token_ether, gnosisPage)

    await gnosisPage.waitForTimeout(1000)

    // Checking that 0 amount triggers an error
    await clickAndType(sendFundsForm.amount_input, gnosisPage, '0')
    await assertElementPresent(errorMsg.error(errorMsg.greater_than_0), gnosisPage)
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    // Checking that any string returns an error
    await clickAndType(sendFundsForm.amount_input, gnosisPage, 'abc')
    await assertElementPresent(errorMsg.error(errorMsg.not_a_number), gnosisPage)
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    // Checking that an amount over balance triggers an error
    await clickAndType(sendFundsForm.amount_input, gnosisPage, '99999')
    await assertElementPresent(errorMsg.error(errorMsg.max_amount_tokens(currentEthFunds)), gnosisPage)
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    // Checking that the value set by the "Send max" button is the same as the current balance
    await clickElement(sendFundsForm.send_max_btn, gnosisPage)
    const maxInputValue = await getNumberInString(sendFundsForm.amount_input.selector, gnosisPage, 'css')
    expect(parseFloat(maxInputValue)).toBe(currentEthFunds)
    await clearInput(sendFundsForm.amount_input, gnosisPage)

    await clickAndType(sendFundsForm.amount_input, gnosisPage, TOKEN_AMOUNT.toString())
    await assertElementPresent(sendFundsForm.valid_amount_msg.selector, gnosisPage)
    await clickElement(sendFundsForm.review_btn, gnosisPage)
    // Review information is correct and submit transaction with signature
    await assertAllElementPresent(
      [sendFundsForm.send_funds_review.selector, sendFundsForm.recipient_address_review.selector],
      gnosisPage,
      'css',
    )
    const recipientHash = await getInnerText(sendFundsForm.recipient_address_review.selector, gnosisPage, 'css')
    expect(recipientHash).toMatch(FUNDS_RECEIVER_ADDRESS)
    const tokenAmount = await getInnerText(sendFundsForm.amount_eth_review.selector, gnosisPage, 'css')
    expect(tokenAmount).toMatch(TOKEN_AMOUNT.toString())
    await assertElementPresent(sendFundsForm.advanced_options.selector, gnosisPage, 'Xpath')
    await clickElement(sendFundsForm.submit_btn, gnosisPage)
    await gnosisPage.waitForTimeout(4000)
    await metamask.signTransaction()
    // Approving and executing the transaction with owner 2
    await gnosisPage.bringToFront()
    await assertTextPresent(transactionsTab.tx_status, 'Needs confirmations', gnosisPage, 'css')
    currentNonce = await getNumberInString('div.tx-nonce > p', gnosisPage, 'css')
    console.log('CurrentNonce = ', currentNonce)
    // We approve and execute with account 1
    await approveAndExecuteWithOwner(1, gnosisPage, metamask)
    // Check that transaction was successfully executed
    await gnosisPage.bringToFront()
    await gnosisPage.waitForTimeout(2000)
    await assertTextPresent(transactionsTab.tx_status, 'Pending', gnosisPage, 'css')
    // waiting for the queue list to be empty and the executed tx to be on the history tab
    await assertElementPresent(transactionsTab.no_tx_in_queue, gnosisPage, 'css')
    await clickByText('button > span > p', 'History', gnosisPage)
    // Wating for the new tx to show in the history, looking for the nonce
    await gnosisPage.waitForTimeout(2000)
    const nonce = await getNumberInString(transactionsTab.tx_nonce, gnosisPage, 'css')
    expect(nonce).toBe(currentNonce)
    const sentAmount = await getInnerText(transactionsTab.tx_info, gnosisPage, 'css')
    expect(sentAmount).toBe(`-${TOKEN_AMOUNT.toString().replace('.', ',')} ETH`)
    await clickElement(transactionsTab.tx_type, gnosisPage)
    const recipientAddress = await getInnerText('div.tx-details > div p', gnosisPage, 'css')
    // regex to match an address hash
    expect(recipientAddress.match(/(0x[a-fA-F0-9]+)/)[0]).toMatch(FUNDS_RECEIVER_ADDRESS)
    await clickByText('span', 'ASSETS', gnosisPage)
    await assertElementPresent(assetsTab.balance_value('eth'), gnosisPage, 'css')
    const array = ['[data-testid="balance-ETH"]', currentEthFundsOnText]
    // check every 100ms an update in the ETH funds in the assets tab
    await gnosisPage.waitForFunction(
      (array) => {
        return document.querySelector(array[0]).innerText !== array[1]
      },
      { polling: 100 },
      array,
    )
    const newEthFunds = await getNumberInString(assetsTab.balance_value('eth'), gnosisPage, 'css')
    expect(parseFloat(newEthFunds.toFixed(3))).toBe(parseFloat((currentEthFunds - TOKEN_AMOUNT).toFixed(3)))
  }, 290000)
})
