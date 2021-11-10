import { assertElementPresent, clickByText, isTextPresent } from '../../utils/selectorsHelpers'
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
    const notLoadingApps = []
    const catchErrorApps = []
    console.log('Safe Apps liveness')
    console.log('Safe Apps List')

    const safeAppsListUrl = `${getEnvUrl()}${NETWORK_ADDRESS_PREFIX}:${TESTING_SAFE_ADDRESS}/apps`

    await gnosisPage.goto(safeAppsListUrl)

    console.log('Shows All Apps Section')
    await assertElementPresent(safeAppsList.allSafeAppsSection, gnosisPage)

    console.log('Get all apps')
    await gnosisPage.waitForSelector(safeAppsList.allSafeAppsTitles.selector)

    const safeApps = await gnosisPage.evaluate((selector) => {
      const elements = Array.from(document.querySelectorAll(selector))
      return elements.map((element, index) => {
        console.log(element)
        return {
          title: element.innerText,
          index,
        }
      })
    }, safeAppsList.allSafeAppsTitles.selector)

    await gnosisPage.$$(safeAppsList.allSafeAppsTitles.selector)
    console.log('Accept disclaimer')
    await clickByText('h5', safeApps[0].title, gnosisPage)
    await clickByText('button', 'Confirm', gnosisPage)
    await gnosisPage.goBack()

    for (const safeApp of safeApps.splice(1)) {
      try {
        await isTextPresent('body', 'Add custom app', gnosisPage)
        await clickByText('h5', safeApp.title, gnosisPage)
        const jsHandle = await Promise.race([
          // gnosisPage.waitForSelector('[name=safe-app-iframe]'),
          gnosisPage.waitForFunction(() => {
            const iframe = document.querySelector('[name=safe-app-iframe]')
            console.log(iframe)
            if (
              iframe &&
              iframe.contentDocument &&
              iframe.contentDocument.body &&
              iframe.contentDocument.body.querySelector &&
              iframe.contentDocument.body.querySelector('#root') !== null
            ) {
              console.log(iframe.contentDocument.body, 'loaded')
              return 'loaded'
            }

            if (
              iframe &&
              iframe.contentDocument &&
              iframe.contentDocument.body &&
              iframe.contentDocument.body.querySelector &&
              iframe.contentDocument.body.querySelector('#main-frame-error') !== null
            ) {
              console.log(iframe.contentDocument.body, 'error')
              return true
            }

            return false
          }),
          isTextPresent('body', 'Something went wrong, please try again', gnosisPage),
        ])
        const value = await jsHandle.evaluate((value) => value)

        if (value === true) {
          notLoadingApps.push(safeApp.title)
          await gnosisPage.goto(safeAppsListUrl)
        } else if (value === 'loaded') {
          await gnosisPage.goBack()
        } else {
          notLoadingApps.push(safeApp.title)
          await gnosisPage.goBack()
        }
      } catch (e) {
        catchErrorApps.push(safeApp.title)
        await gnosisPage.goBack()
      }
    }

    expect(notLoadingApps).toEqual([])
  })
})
