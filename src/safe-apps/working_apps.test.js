import { getAllAppTitles, clickByText, isSafeAppLoaded, isTextPresent } from '../../utils/selectorsHelpers'
import { getEnvUrl, initWithWalletConnected } from '../../utils/testSetup'
import config from '../../utils/config'
import { safeAppsList } from '../../utils/selectors/safeAppsList'

/*
Working Apps
-- Shows the Safe Apps List
-- Opens the different apps and test:
  - Check that the app is loading  
  - Check that we can find the Safe address somewhere in the interface (so we assume it's connected) We should check complete or partial match in the first approach
  - We will need some way to report which specific app is failing
  - Add a Github action job that checks the list. We can schedule it once a day
  - We should report to a slack channel the result of this check
*/

let browser
let gnosisPage

const { TESTING_SAFE_ADDRESS, NETWORK_ADDRESS_PREFIX } = config

beforeAll(async () => {
  ;[browser, , gnosisPage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Safe Apps List', () => {
  test('Safe Apps List', async () => {
    const failingToLoadApps = []

    console.log('Safe Apps liveness')

    console.log('Open Safe Apps List')
    const safeAppsListUrl = `${getEnvUrl()}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/apps`
    await gnosisPage.goto(safeAppsListUrl)
    await gnosisPage.waitForSelector(safeAppsList.allSafeAppsTitles.selector)

    console.log('Get all apps')
    const safeApps = await getAllAppTitles(safeAppsList.allSafeAppsTitles.selector, gnosisPage)

    console.log('Accept disclaimer')
    await clickByText('h5', safeApps[0].title, gnosisPage)
    await clickByText('button', 'Confirm', gnosisPage)
    await gnosisPage.goBack()

    console.log('Test apps sequentially')
    for (const safeApp of safeApps.splice(1)) {
      try {
        console.log(`Testing ${safeApp.title}`)
        await isTextPresent('body', 'Add custom app', gnosisPage)
        await clickByText('h5', safeApp.title, gnosisPage)
        const isLoaded = await isSafeAppLoaded(gnosisPage)

        if (isLoaded) {
          await gnosisPage.goBack()
        } else {
          failingToLoadApps.push(safeApp.title)
          await gnosisPage.goto(safeAppsListUrl)
        }
      } catch (e) {
        await gnosisPage.goBack()
      }
    }

    console.log('Check failing apps')
    expect(failingToLoadApps).toEqual([])
  })
})
