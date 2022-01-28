import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { assertTextPresent, clickElement, clickSomething, getInnerText } from '../../../utils/selectorsHelpers'
import { getEnvUrl, initNoWalletConnection } from '../../../utils/testSetup'
import config from '../../../utils/config'
import { safeBalancesPage } from '../../../utils/selectors/safeBalancesPage'
import { getShortNameAddress } from '../../../utils/addresses'

/*
Safe Balances
-- Enters the Safe Balances page
-- check the currency dropdown
*/

let browser
let gnosisPage

let recorder

const { TESTING_SAFE_ADDRESS } = config

beforeAll(async () => {
  ;[browser, gnosisPage] = await initNoWalletConnection()
}, 60000)

afterAll(async () => {
  await recorder.stop()
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

function getCurrencyChar(amountShowed) {
  // amount format is "XXX $"
  return amountShowed.split(' ')[1]
}

describe('Safe Balances', () => {
  test('Safe Balances', async () => {
    recorder = new PuppeteerScreenRecorder(gnosisPage)
    await recorder.start('./e2e-tests-assets/safe_balances.mp4')

    console.log('Safe Balances')

    console.log('Enters the Safe Balances page')
    const safeBalancesUrl = `${getEnvUrl()}${getShortNameAddress(TESTING_SAFE_ADDRESS)}/balances`
    await gnosisPage.goto(safeBalancesUrl)

    console.log('USD currency by default')
    const defaultSelectedCurrency = 'USD'
    await assertTextPresent(safeBalancesPage.selected_currency_label, defaultSelectedCurrency, gnosisPage)

    console.log('Safe Balances table shows the amounts in USD')
    const amountShowed = await getInnerText(safeBalancesPage.currency_showed_balances_table, gnosisPage)
    const currencyShowed = getCurrencyChar(amountShowed)
    expect(currencyShowed).toBe(defaultSelectedCurrency)

    console.log('selects a new default currency')
    const newSelectedCurrency = 'EUR'
    await clickSomething(safeBalancesPage.currency_dropdown_btn.selector, gnosisPage, 'css')
    await clickElement(safeBalancesPage.currency_item_label(newSelectedCurrency), gnosisPage)
    await gnosisPage.waitForTimeout(6000)
    await assertTextPresent(safeBalancesPage.selected_currency_label, newSelectedCurrency, gnosisPage)

    console.log('Safe Balances table shows the amounts in the new selected currency')
    const newAmountShowed = await getInnerText(safeBalancesPage.currency_showed_balances_table, gnosisPage)
    const newCurrencyShowed = getCurrencyChar(newAmountShowed)
    await gnosisPage.waitForTimeout(2000)
    expect(newCurrencyShowed).toBe(newSelectedCurrency)

    console.log('updates the new selected currency in the localStorage')
    const selectedCurrencyFromStorage = await gnosisPage.evaluate(() => {
      const selectedCurrencyLocalStorageKey = 'SAFE__currencyValues.selectedCurrency'
      return localStorage.getItem(selectedCurrencyLocalStorageKey)
    })
    expect(selectedCurrencyFromStorage).toBe(JSON.stringify(newSelectedCurrency))

    console.log('refresh the page should keep the selected value')
    await gnosisPage.goto(safeBalancesUrl)
    await assertTextPresent(safeBalancesPage.selected_currency_label, newSelectedCurrency, gnosisPage)
  }, 180000)
})
