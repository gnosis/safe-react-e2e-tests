import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import {
  getAllAppTitles,
  clickByText,
  isSafeAppLoaded,
  isTextPresent,
  scrollIntoApp,
} from '../../utils/selectorsHelpers'
import { getEnvUrl, initHeadlessConnection } from '../../utils/testSetup'
import { getShortNameAddress } from '../../utils/addresses'
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

const { TESTING_SAFE_ADDRESS, SLACK_WEBHOOK_URL } = config

beforeAll(async () => {
  ;[browser, gnosisPage] = await initHeadlessConnection()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Safe Apps List', () => {
  test('Safe Apps List', async () => {
    const recorder = new PuppeteerScreenRecorder(gnosisPage)
    await recorder.start('./e2e-tests-assets/test-safe-apps.mp4')

    console.log('Safe Apps liveness')
    const failingToLoadApps = []
    const safeAppsListUrl = `${getEnvUrl()}${getShortNameAddress(TESTING_SAFE_ADDRESS)}/apps`

    console.log('Open Safe Apps List')
    await gnosisPage.goto(safeAppsListUrl)
    await gnosisPage.waitForSelector(safeAppsList.allSafeAppsTitles.selector)

    console.log('Get all apps')
    const safeApps = await getAllAppTitles(safeAppsList.allSafeAppsTitles.selector, gnosisPage)

    console.log('Accept cookies')
    await clickByText('a', 'Accept all', gnosisPage)

    console.log('Accept disclaimer')
    await clickByText('h5', safeApps[0].title, gnosisPage)
    await clickByText('button', 'Confirm', gnosisPage)
    await gnosisPage.goBack()

    console.log('Test apps sequentially')

    let safeAppIndex = 1

    for (const safeApp of safeApps) {
      console.log(`${safeAppIndex}. Testing ${safeApp.title}`)
      safeAppIndex++
      try {
        await isTextPresent('body', safeApp.title, gnosisPage)
        await scrollIntoApp(gnosisPage, safeApp.title)
        await clickByText('h5', safeApp.title, gnosisPage)
        const loadResult = await isSafeAppLoaded(TESTING_SAFE_ADDRESS, safeApp.title, gnosisPage)

        console.log(loadResult)

        if (loadResult?.status === 'error') {
          failingToLoadApps.push({ title: safeApp.title, ...loadResult })
        }
      } catch {
        failingToLoadApps.push({
          title: safeApp.title,
          status: 'error',
          description: 'Unable to reach and click app card',
        })
      }

      await gnosisPage.goto(safeAppsListUrl)
    }

    await recorder.stop()

    console.log('Send Slack message')
    console.log(failingToLoadApps)
    await sendSlackMessage(SLACK_WEBHOOK_URL, safeAppsListUrl, failingToLoadApps)
  }, 1800000)
})
