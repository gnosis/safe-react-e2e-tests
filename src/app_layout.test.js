import { getEnvUrl, initWithWalletConnected } from '../utils/testSetup'
import { appLayout } from '../utils/selectors/appLayout'
import config from '../utils/config'

let browser
let gnosisPage
let envUrl

const { TESTING_SAFE_ADDRESS } = config

beforeAll(async () => {
  ;[browser, , gnosisPage] = await initWithWalletConnected()
  envUrl = getEnvUrl()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(5000)
  const pages = await browser.pages()
  await Promise.all(pages.map((page) => page.close()))
  await browser.close()
})

describe('Navigate through the app routes', () => {
  test('Footer exists in the Welcome page and Settings', async () => {
    const footerSelector = appLayout.footer.selector

    let footer = await gnosisPage.waitForSelector(footerSelector, { timeout: 1000 })
    expect(footer).toBeDefined()

    await gnosisPage.goto(envUrl + '#/safes/' + TESTING_SAFE_ADDRESS + '/balances/collectibles')
    footer = await gnosisPage.waitForSelector(footerSelector, { timeout: 1000, hidden: true })
    expect(footer).toBeNull()

    await gnosisPage.goto(envUrl + '#/safes/' + TESTING_SAFE_ADDRESS + '/address-book')
    footer = await gnosisPage.waitForSelector(footerSelector, { timeout: 1000, hidden: true })
    expect(footer).toBeNull()

    await gnosisPage.goto(envUrl + '#/safes/' + TESTING_SAFE_ADDRESS + '/settings/policies')
    footer = await gnosisPage.waitForSelector(footerSelector, { timeout: 1000 })
    expect(footer).toBeDefined()
  })
})
