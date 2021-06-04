import {
  assertElementPresent,
  assertTextPresent,
  clearInput,
  clickAndType,
  clickByText,
  clickElement,
  isTextPresent
} from '../utils/selectorsHelpers'
import { sels } from '../utils/selectors'
import { accountsSelectors } from '../utils/selectors/accounts'
import { generalInterface } from '../utils/selectors/generalInterface'
import { loadSafeForm } from '../utils/selectors/loadSafeForm'
import { initWithWalletConnected } from '../utils/testSetup'
import config from '../utils/config'

let browser
let metamask
let gnosisPage
let MMpage

const { TESTING_SAFE_ADDRESS } = config

beforeAll(async () => {
  [browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Add an existing safe', () => {
  test('Open add Safe form', async () => {
    console.log('Open add Safe form\n')
    await clickByText('p', 'Add existing Safe', gnosisPage)
    await assertElementPresent(loadSafeForm.form.selector, gnosisPage, 'css')
    await clickAndType(loadSafeForm.safe_name_field, gnosisPage, accountsSelectors.safeNames.load_safe_name)
    await assertTextPresent(loadSafeForm.valid_safe_name.selector, sels.assertions.valid_safe_name_field, gnosisPage)
    await clickAndType(loadSafeForm.safe_address_field, gnosisPage, TESTING_SAFE_ADDRESS)
    await assertElementPresent(loadSafeForm.valid_address.selector, gnosisPage, 'css')
    await clickElement(generalInterface.submit_btn, gnosisPage)
  }, 60000)

  test('Add Safe owner step edition', async () => {
    console.log('Add Safe owner step edition\n')
    await assertElementPresent(loadSafeForm.step_two.selector, gnosisPage, 'css')
    await clearInput(loadSafeForm.owner_name(), gnosisPage)
    await clickAndType(loadSafeForm.owner_name(), gnosisPage, accountsSelectors.accountNames.owner_name)
    await clickElement(generalInterface.submit_btn, gnosisPage)
  }, 60000)

  test('Add Safe review details', async () => {
    console.log('Add Safe review details\n')
    await assertElementPresent(loadSafeForm.step_three.selector, gnosisPage, 'css')
    await assertTextPresent(loadSafeForm.review_safe_name.selector, accountsSelectors.safeNames.load_safe_name, gnosisPage, 'css')
    await assertTextPresent(loadSafeForm.review_owner_name().selector, accountsSelectors.accountNames.owner_name, gnosisPage, 'css')
    await gnosisPage.waitForTimeout(2000)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    await assertElementPresent(generalInterface.show_qr_btn.selector, gnosisPage, 'css')
    await clickElement(generalInterface.show_qr_btn, gnosisPage)
    await isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.load_safe_name, gnosisPage)
    // await gFunc.assertAllElementPresent([
    //     generalInterface.receiver_modal_safe_name,
    //     generalInterface.receiver_modal_safe_address
    // ], gnosisPage, "css")
    // const safeName = await gFunc.getInnerText(generalInterface.receiver_modal_safe_name, gnosisPage, "css")
    // const safeAddress = await gFunc.getInnerText(generalInterface.receiver_modal_safe_address, gnosisPage, "css")
    // expect(safeName).toBe(accountsSelectors.safeNames.load_safe_name)
    // expect(safeAddress).toBe(TESTING_SAFE_ADDRESS)
  }, 60000)
})
