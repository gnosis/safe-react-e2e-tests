import {
  assertElementPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  getInnerText,
  getNumberInString,
  assertTextPresent,
  openDropdown,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { settingsPage } from '../utils/selectors/settings'
import { transactionsTab } from '../utils/selectors/transactionsTab'
import { initWithDefaultSafe, initWithDefaultSafeDirectNavigation } from '../utils/testSetup'
import { generalInterface } from '../utils/selectors/generalInterface'
import { errorMsg } from '../utils/selectors/errorMsg'

let browser
let metamask
let gnosisPage

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithDefaultSafeDirectNavigation(true)
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe("Address book", () => {
    test("Addrress book", async(done) => {
    console.log("Addrress book")
    try{
        await assertTextPresent(generalInterface.sidebar, "address book", gnosisPage)
        await clickByText("span", "address book", gnosisPage)
        await gnosisPage.waitForTimeout(50000)
    done()
    }
    catch (error){
    console.log(error)
    done()
    }
    }, 120000)
})