import { getAllAppTitles, clickByText, isSafeAppLoaded, isTextPresent } from '../../utils/selectorsHelpers'
import { getEnvUrl, initNoWalletConnection } from '../../utils/testSetup'
import { sendSlackMessage } from '../../utils/slack'
import config from '../../utils/config'
import { safeAppsList } from '../../utils/selectors/safeAppsList'

/*
Working Apps
-- Shows the Safe Apps List
-- Opens the different apps and test:
  - Check that the app is loading
  - Add a Github action job that checks the list. We can schedule it once a day
  - We should report to a slack channel the result of this check
*/

let browser
let gnosisPage

const { NETWORK_ADDRESS_PREFIX, TESTING_SAFE_ADDRESS, SLACK_WEBHOOK_URL } = config

beforeAll(async () => {
  ;[browser, gnosisPage] = await initNoWalletConnection()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Safe Apps List', () => {
  test('Safe Apps List', async () => {
    console.log('Safe Apps liveness')
    const failingToLoadApps = []
    const safeAppsListUrl = `${getEnvUrl()}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/apps`

    console.log('Open Safe Apps List')
    await gnosisPage.goto(safeAppsListUrl)
    await gnosisPage.waitForSelector(safeAppsList.allSafeAppsTitles.selector)

    console.log('Get all apps')
    const safeApps = await getAllAppTitles(safeAppsList.allSafeAppsTitles.selector, gnosisPage)

    console.log('Accept disclaimer')
    await clickByText('h5', safeApps[0].title, gnosisPage)
    await clickByText('button', 'Confirm', gnosisPage)
    await gnosisPage.goBack()

    console.log('Test apps sequentially')
    for (const safeApp of safeApps.splice(-4)) {
      console.log(`Testing ${safeApp.title}`)
      gnosisPage.screenshot({ path: `./screenshots/${safeApp.title}-1.png` })
      await isTextPresent('body', 'Add custom app', gnosisPage)
      gnosisPage.screenshot({ path: `./screenshots/${safeApp.title}-2.png` })
      await clickByText('h5', safeApp.title, gnosisPage)
      gnosisPage.screenshot({ path: `./screenshots/${safeApp.title}-3.png` })
      const loadResult = await isSafeAppLoaded(TESTING_SAFE_ADDRESS, safeApp.title, gnosisPage)
      gnosisPage.screenshot({ path: `./screenshots/${safeApp.title}-4.png` })

      console.log(loadResult)

      if (loadResult?.status === 'error') {
        failingToLoadApps.push({ title: safeApp.title, ...loadResult })
      }

      await gnosisPage.goto(safeAppsListUrl)
    }

    console.log('Send Slack message')
    await sendSlackMessage(SLACK_WEBHOOK_URL, safeAppsListUrl, failingToLoadApps)
  }, 1800000)
})
