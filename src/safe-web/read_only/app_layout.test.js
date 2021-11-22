import { getEnvUrl, initWithWalletConnected } from '../../../utils/testSetup'
import { appLayout } from '../../../utils/selectors/appLayout'
import { assertElementPresent, assertElementNotPresent } from '../../../utils/selectorsHelpers'
import config from '../../../utils/config'

let browser
let gnosisPage
let envUrl

const { NETWORK_ADDRESS_PREFIX, TESTING_SAFE_ADDRESS } = config

beforeAll(async () => {
  ;[browser, , gnosisPage] = await initWithWalletConnected()
  envUrl = getEnvUrl()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Application Layout', () => {
  test('Footer exists in the Welcome page and Settings', async () => {
    console.log('Footer exists in the Welcome page and Settings')

    const footerSelector = appLayout.footer.selector

    console.log('Footer is present in the Welcome page')
    await assertElementPresent({ selector: footerSelector, type: 'css' }, gnosisPage)

    console.log('Footer is not present in the Balances page')
    await gnosisPage.goto(`${envUrl}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/balances/collectibles`)
    await assertElementNotPresent({ selector: footerSelector, type: 'css' }, gnosisPage)

    console.log('Footer is not present in the Address Book page')
    await gnosisPage.goto(`${envUrl}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/address-book`)
    await assertElementNotPresent({ selector: footerSelector, type: 'css' }, gnosisPage)

    console.log('Footer is present in the Settings pages')
    await gnosisPage.goto(`${envUrl}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/settings/policies`)
    await assertElementPresent({ selector: footerSelector, type: 'css' }, gnosisPage)
  })
})
