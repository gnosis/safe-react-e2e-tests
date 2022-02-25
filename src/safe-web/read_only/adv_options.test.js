import {
  assertElementPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getNumberInString,
  getInnerText,
  openDropdown,
  isTextPresent,
  getSiblingText,
} from '../../../utils/selectorsHelpers'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { generalInterface } from '../../../utils/selectors/generalInterface'
import { sendFundsForm, advancedOptions } from '../../../utils/selectors/sendFundsForm'
import { initWithDefaultSafeDirectNavigation } from '../../../utils/testSetup'
import { getShortNameAddress } from '../../../utils/addresses'
import { settingsPage } from '../../../utils/selectors/settings'
import config from '../../../utils/config'

/*
Review Advanced Options, GasLimit and GasPrice estimation and out of order nonce warning message
-- Open send funds form
-- Fill the form with valid values and enter review step
-- Check that the advanced options section is there
-- GasPrice and Gaslimit are different than 0
-- Modifie GasPrice and Gaslimit. Verify estimation message is the product of those numbers
-- Edit nonce to be 2 values higher than expected
-- Verify out of order nonce warning message
*/

let browser
let metamask
let gnosisPage

let recorder
const { FUNDS_RECEIVER_ADDRESS } = config
const TOKEN_AMOUNT = 0.01

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(false, 1) // Import only default account. Load a safe with a policy of 1 out of x
  if (metamask) return metamask // make eslint happy
}, 60000)

afterAll(async () => {
  await recorder.stop()
  if (!browser) return
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Read-only transaction creation and review', () => {
  test('Read-only transaction creation and review', async () => {
    recorder = new PuppeteerScreenRecorder(gnosisPage)
    await recorder.start('./e2e-tests-assets/adv_options.mp4')

    console.log('Read-only transaction creation and review')
    await clickByText('span', 'Settings', gnosisPage)
    await clickByText('span', 'Advanced', gnosisPage)
    await assertElementPresent(settingsPage.current_nonce, gnosisPage)
    const safeCurrentNonce = await getNumberInString(settingsPage.current_nonce, gnosisPage)

    // Toggle to PROD CGW
    await clickByText('span', 'Use prod CGW', gnosisPage)
    await gnosisPage.waitForTimeout(8000)

    console.log('Open the send funds form')
    await clickByText('button', 'New Transaction', gnosisPage)

    console.log('Types a receiver address')
    await clickElement({ selector: generalInterface.modal_send_funds_btn }, gnosisPage)
    await assertElementPresent(sendFundsForm.review_btn_disabled, gnosisPage)
    await gnosisPage.waitForTimeout(1000)

    console.log('Input the receiver, token, and amount with valid values')
    await clickAndType(sendFundsForm.recipient_input, gnosisPage, FUNDS_RECEIVER_ADDRESS.toUpperCase())
    const receiverAddressChecksummed = await getInnerText(sendFundsForm.recipient_input_value_entered, gnosisPage)
    expect(receiverAddressChecksummed).toBe(getShortNameAddress(FUNDS_RECEIVER_ADDRESS)) // The input should checksum the uppercase text automatically.)

    await openDropdown(sendFundsForm.select_token, gnosisPage)
    await clickElement(sendFundsForm.select_token_ether, gnosisPage)

    await gnosisPage.waitForTimeout(1000)
    await clearInput(sendFundsForm.amount_input, gnosisPage)
    await clickAndType(sendFundsForm.amount_input, gnosisPage, TOKEN_AMOUNT.toString())
    await assertElementPresent(sendFundsForm.valid_amount_msg, gnosisPage)
    await clickElement(sendFundsForm.review_btn, gnosisPage)

    console.log('Checks receiver address in the review step')
    await assertElementPresent(sendFundsForm.recipient_address_review, gnosisPage)
    const recipientHash = await getInnerText(sendFundsForm.recipient_address_review, gnosisPage)
    expect(recipientHash).toMatch(getShortNameAddress(FUNDS_RECEIVER_ADDRESS))

    console.log('Open advanced options')
    await assertElementPresent(sendFundsForm.advanced_parameters, gnosisPage)
    await clickElement(sendFundsForm.advanced_parameters, gnosisPage)

    console.log('Verify current nonce is the same as the one in advanced options')
    await gnosisPage.waitForTimeout(2000)
    await isTextPresent('.smaller-modal-window', 'Safe nonce', gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    const advancedOptionsNonce = parseInt(await getSiblingText('p', 'Safe nonce', gnosisPage), 10)
    expect(advancedOptionsNonce).toBe(safeCurrentNonce)

    console.log('Gas limit & Gas Price != than 0')
    await assertElementPresent(sendFundsForm.estimated_fee_price, gnosisPage)
    await clickElement(sendFundsForm.estimated_fee_price, gnosisPage)
    await gnosisPage.waitForTimeout(3000) // Wait for gas estimations, if not all values are 0
    const advancedOptionsGasLimit = parseFloat(await getSiblingText('p', 'Gas limit', gnosisPage), 10)
    expect(advancedOptionsGasLimit).not.toBe(0) // If these are 0 gas estimation failed
    const advancedOptionsGasPrice = parseFloat(await getSiblingText('p', 'Max fee per gas', gnosisPage), 10)
    expect(advancedOptionsGasPrice).not.toBe(0)
    const advancedOptionsGasPrioFee = parseFloat(await getSiblingText('p', 'Max priority fee', gnosisPage), 10)
    expect(advancedOptionsGasPrioFee).not.toBe(0)

    console.log('Click the Edit button')
    await assertElementPresent(sendFundsForm.edit_advanced_options_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await clickElement(sendFundsForm.edit_advanced_options_btn, gnosisPage)

    console.log('Editing Gas Limit & Gas Price')
    await clearInput(advancedOptions.gasLimitInput, gnosisPage)
    await clickAndType(advancedOptions.gasLimitInput, gnosisPage, '200000')

    await clearInput(advancedOptions.gasPriceInput, gnosisPage)
    await clickAndType(advancedOptions.gasPriceInput, gnosisPage, '60')

    await clearInput(advancedOptions.gasPrioFee, gnosisPage)
    await clickAndType(advancedOptions.gasPrioFee, gnosisPage, '2')

    console.log('Confirm Advanced Options. Checking new estimation message')
    await assertElementPresent(sendFundsForm.confirm_advanced_options_btn, gnosisPage)
    await clickElement(sendFundsForm.confirm_advanced_options_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000) // wait for the message to update
    // 0.0124 is (GasPrice + GasPrioFee) * GasLimit
    const estimatedFee = await getSiblingText('p', 'Estimated fee price', gnosisPage)
    expect(estimatedFee).toBe('0.0124 ETH')

    console.log('Open advanced options. Reopening to edit to invalid nonce value')
    await gnosisPage.waitForTimeout(2000)
    await assertElementPresent(sendFundsForm.estimated_fee_price, gnosisPage)
    await clickElement(sendFundsForm.estimated_fee_price, gnosisPage)

    console.log('Click the Edit button')
    await assertElementPresent(sendFundsForm.edit_advanced_options_btn, gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await clickElement(sendFundsForm.edit_advanced_options_btn, gnosisPage)

    console.log('Edit the Safe Nonce Value')
    const offset = 2 // editing nonce to be 2 more than the nonce expected
    await clearInput(sendFundsForm.safe_nonce_input, gnosisPage)
    await clickAndType(sendFundsForm.safe_nonce_input, gnosisPage, `${advancedOptionsNonce + offset}`)

    console.log('Confirm Advanced Options')
    await assertElementPresent(sendFundsForm.confirm_advanced_options_btn, gnosisPage)
    await clickElement(sendFundsForm.confirm_advanced_options_btn, gnosisPage)
    // checking if the warning message is present in the modal
    const nonceWarningMessage = await gnosisPage.evaluate((offset) => {
      const reviewInfoText = Array.from(document.querySelectorAll('.smaller-modal-window > div'))[4]
      return reviewInfoText.innerText.includes(offset.toString()) && reviewInfoText.innerText.includes('will need to')
    }, offset)
    expect(nonceWarningMessage).toBeTruthy()
  }, 150000)
})
