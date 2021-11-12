import {
  assertElementPresent,
  clickElement,
  assertTextPresent,
  isTextPresent,
  getInnerText,
  clickSomething,
} from '../../utils/selectorsHelpers'
import { accountsSelectors } from '../../utils/selectors/accounts'
import { createSafePage } from '../../utils/selectors/createSafePage'
import { generalInterface } from '../../utils/selectors/generalInterface'
import { getEnvUrl, initWithWalletConnected } from '../../utils/testSetup'
import config from '../../utils/config'

/*
Create safe
-- Enters into the create safe form with the Create button
-- Type a name for the safe
-- Adds a new owner row
-- Check that owner names and addresses are required when clicking submit
-- Type names and addresses only for "owner2"
-- Checks that the policies selector matches the amount of owners
-- Checks in review step the name of the safe, name and address of owner2
-- Checks "block explorer" and "back" button during the safe creation
-- Checks safe name on the sidebar once the safe is loaded
*/

let browser
let metamask
let gnosisPage

const { FUNDS_RECEIVER_ADDRESS } = config

beforeAll(async () => {
  ;[browser, metamask, gnosisPage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Create New Safe Migration', () => {
  test('Create Safe with a Old MultiSig migration url', async () => {
    console.log('Create Safe with a Old MultiSig migration')

    const newSafeName = accountsSelectors.safeNames.create_safe_name
    const firstOwnerName = 'custom_first_owner_name'
    const firstOwnerAddress = FUNDS_RECEIVER_ADDRESS
    const secondOwnerName = accountsSelectors.accountNames.owner2_name
    const secondOwnerAddress = accountsSelectors.testAccountsHash.acc2
    const customThresholdValue = '2'

    const firstOwnerIndex = 0
    const secondOwnerIndex = 1

    const migrationUrl = `${getEnvUrl()}app/open?name=${newSafeName}&threshold=${customThresholdValue}&owneraddresses=${firstOwnerAddress},${secondOwnerAddress}&ownernames=${firstOwnerName},${secondOwnerName}`

    await gnosisPage.goto(migrationUrl)

    await assertElementPresent({ selector: createSafePage.form, type: 'css' }, gnosisPage)

    // [Step 1] Select Network
    console.log('Shows Connect wallet & select network step')
    await assertElementPresent(createSafePage.select_network_step, gnosisPage)
    await assertTextPresent(createSafePage.select_network_step, 'Rinkeby', gnosisPage)

    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 2] Naming The Safe
    console.log('Shows naming the Safe step')
    await assertElementPresent(createSafePage.naming_safe_step, gnosisPage)

    console.log('Check the name of the safe')
    expect(await getInnerText(createSafePage.safe_name_field, gnosisPage)).toBe(newSafeName)

    await clickSomething(generalInterface.submit_btn.selector, gnosisPage, 'css')

    // [Step 3] Owners and Confirmations
    console.log('Shows Owners and Confirmations step')
    await assertElementPresent(createSafePage.owners_and_confirmations_step, gnosisPage)

    console.log('Shows Owners from migration URL')
    // assert first owner
    expect(await getInnerText(createSafePage.get_owner_name_field(firstOwnerIndex), gnosisPage)).toBe(firstOwnerName)
    expect(await getInnerText(createSafePage.get_owner_address_field(firstOwnerIndex), gnosisPage)).toBe(
      firstOwnerAddress,
    )
    await assertElementPresent(createSafePage.get_valid_address_check_icon(firstOwnerIndex), gnosisPage)

    // assert second owner
    expect(await getInnerText(createSafePage.get_owner_name_field(secondOwnerIndex), gnosisPage)).toBe(secondOwnerName)
    expect(await getInnerText(createSafePage.get_owner_address_field(secondOwnerIndex), gnosisPage)).toBe(
      secondOwnerAddress,
    )
    await assertElementPresent(createSafePage.get_valid_address_check_icon(secondOwnerIndex), gnosisPage)

    // assert custom Threshold
    console.log('Selects the custom Threshold from the migration URL')
    expect(await getInnerText(createSafePage.threshold_hidden_input, gnosisPage)).toBe(customThresholdValue)

    await clickSomething(generalInterface.submit_btn.selector, gnosisPage, 'css')

    // [Step 4] Owners and Confirmations
    console.log('Shows Review Safe step')
    await assertElementPresent(createSafePage.review_safe_step, gnosisPage)

    // review the name
    console.log('Checks the name of the new Safe')
    expect(await getInnerText(createSafePage.review_safe_name_label, gnosisPage)).toBe(newSafeName)

    // review the threshold
    console.log('Checks the threshold of the new Safe')
    expect(await getInnerText(createSafePage.review_safe_threshold_label, gnosisPage)).toBe('2 out of 2 owners')

    // review the owners
    console.log('Checks owners of the new Safe')
    expect(await getInnerText(createSafePage.review_owner_name(firstOwnerAddress), gnosisPage)).toBe(firstOwnerName)
    expect(await getInnerText(createSafePage.review_owner_address(firstOwnerAddress), gnosisPage)).toBe(
      firstOwnerAddress,
    )
    expect(await getInnerText(createSafePage.review_owner_name(secondOwnerAddress), gnosisPage)).toBe(secondOwnerName)
    expect(await getInnerText(createSafePage.review_owner_address(secondOwnerAddress), gnosisPage)).toBe(
      secondOwnerAddress,
    )

    console.log('Submits the Create Safe Form')
    await clickSomething(generalInterface.submit_btn.selector, gnosisPage, 'css')
    await gnosisPage.waitForTimeout(2000)
    await metamask.confirmTransaction()

    // Assert Safe Creation
    await gnosisPage.bringToFront()
    console.log('Checks "block explorer" and "back" button during the safe creation')
    await assertElementPresent({ selector: createSafePage.back_btn, type: 'css' }, gnosisPage)
    await assertElementPresent({ selector: createSafePage.etherscan_link, type: 'css' }, gnosisPage)
    await assertElementPresent({ selector: createSafePage.continue_btn, type: 'css' }, gnosisPage)
    await clickElement({ selector: createSafePage.continue_btn }, gnosisPage)

    // Safe Created Popup
    console.log('Checks if the Safe Created popup is showed')
    await assertElementPresent(createSafePage.safe_created_dialog, gnosisPage)
    await clickElement(createSafePage.safe_created_button, gnosisPage)

    // Checks your created safe
    console.log('Checks safe name on the sidebar once the safe is loaded')
    await isTextPresent(generalInterface.sidebar, accountsSelectors.safeNames.create_safe_name, gnosisPage)
  }, 180000)
})
