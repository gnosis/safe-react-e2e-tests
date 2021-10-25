import path from 'path'

import {
  clickByText,
  assertElementPresent,
  clickElement,
  clickAndType,
  assertTextPresent,
  isTextPresent,
  getInnerText,
  clickSomething,
  clearInput,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { createSafePage } from '../utils/selectors/createSafePage'
import { generalInterface } from '../utils/selectors/generalInterface'
import { initWithWalletConnected } from '../utils/testSetup'
import { errorMsg } from '../utils/selectors/errorMsg'
import config from '../utils/config'

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
let MMpage

const { FUNDS_RECEIVER_ADDRESS, QR_CODE_ADDRESS } = config

const safeQRCodeFilePath = path.relative(process.cwd(), path.join(__dirname, '/../utils/files/safe-address-QR.png'))

beforeAll(async () => {
  ;[browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await gnosisPage.waitForTimeout(2000)
  await browser.close()
})

describe('Create New Safe', () => {
  const newSafeName = accountsSelectors.safeNames.create_safe_name
  const firstOwnerIndex = 0

  test('Create Safe', async () => {
    console.log('Create safe')
    console.log('Enters into the create safe form with the Create button')
    await clickByText('p', '+ Create New Safe', gnosisPage)
    await assertElementPresent({ selector: createSafePage.form, type: 'css' }, gnosisPage)

    // [Step 1] Select Network
    console.log('Shows Connect wallet & select network step')
    await assertElementPresent(createSafePage.select_network_step, gnosisPage)
    await assertTextPresent(createSafePage.select_network_step, 'Rinkeby', gnosisPage)

    console.log('Switches the network and connect your wallet')
    // opens the network dialog
    await clickByText('button', 'Switch Network', gnosisPage)
    await assertElementPresent(createSafePage.select_network_dialog, gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'Mainnet', gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'Rinkeby', gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'XDai', gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'EWC', gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'Volta', gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'Polygon', gnosisPage)
    await assertTextPresent(createSafePage.select_network_dialog, 'BSC', gnosisPage)

    // selects the Volta network
    await clickByText("div[role='button'] > span", 'Volta', gnosisPage)

    // check if connect wallet button is present
    await assertElementPresent(createSafePage.select_network_connect_wallet_btn, gnosisPage)

    // connect to volta wallet
    await clickByText('button > span', 'Connect', gnosisPage)
    await clickByText('button > span', 'MetaMask', gnosisPage)
    await clickByText('button > span', 'Switch Wallet', gnosisPage)

    await assertTextPresent(createSafePage.select_network_step, 'Volta', gnosisPage)

    // selects the Rinkeby network again (this time clicking in the network label)
    await clickByText('p > span', 'Volta', gnosisPage)
    await assertElementPresent(createSafePage.select_network_dialog, gnosisPage)
    await clickByText("div[role='button'] > span", 'Rinkeby', gnosisPage)

    await gnosisPage.waitForTimeout(1000)
    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 2] Naming The Safe
    console.log('Shows naming the Safe step')
    await assertElementPresent(createSafePage.naming_safe_step, gnosisPage)

    console.log('Type a name for the safe')
    await clickAndType(createSafePage.safe_name_field, gnosisPage, newSafeName)
    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 3] Owners and Confirmations
    console.log('Shows Owners and Confirmations step')
    await assertElementPresent(createSafePage.owners_and_confirmations_step, gnosisPage)

    // current user address as default owner
    console.log('Adds the current user address as default owner')
    const firstOwnerAddress = await getInnerText(createSafePage.get_owner_address_field(firstOwnerIndex), gnosisPage)
    expect(firstOwnerAddress).toBe(FUNDS_RECEIVER_ADDRESS)
    const firstOwnerDefaultName = await getInnerText(createSafePage.get_owner_name_field(firstOwnerIndex), gnosisPage)
    expect(firstOwnerDefaultName).toBe('My Wallet')

    // we add a new valid owner (second owner)
    console.log('Adds a new owner row with a valid address')
    await gnosisPage.waitForTimeout(2000)
    await clickElement(createSafePage.add_new_owner_btn, gnosisPage)
    const secondOwnerIndex = 1
    const secondOwnerName = accountsSelectors.accountNames.owner2_name
    const secondOwnerAddress = accountsSelectors.testAccountsHash.acc2
    // filling name field
    await clickAndType(createSafePage.get_owner_name_field(secondOwnerIndex), gnosisPage, secondOwnerName)
    // filling address field
    await clickAndType(
      createSafePage.get_owner_address_field(secondOwnerIndex),
      gnosisPage,
      secondOwnerAddress.toUpperCase(),
    )
    // expects a valid second owner values
    expect(await getInnerText(createSafePage.get_owner_name_field(secondOwnerIndex), gnosisPage)).toBe(secondOwnerName)
    expect(await getInnerText(createSafePage.get_owner_address_field(secondOwnerIndex), gnosisPage)).toBe(
      secondOwnerAddress,
    )
    await assertElementPresent(createSafePage.get_valid_address_check_icon(secondOwnerIndex), gnosisPage)

    // required owner address error, we add a empty owner and click on next btn
    console.log('Shows a "required" error if a owner address is empty')
    await clickElement(createSafePage.add_new_owner_btn, gnosisPage)
    await clickElement(generalInterface.submit_btn, gnosisPage)
    expect(await getInnerText(createSafePage.error_field_label, gnosisPage)).toBe(errorMsg.required)
    await assertElementPresent(createSafePage.owners_and_confirmations_step, gnosisPage) // we should stay in the same step if errors are present

    // duplicated owner addresses error
    console.log('Shows a "Address already introduced" error if a owner address is duplicated')
    const thirdOwnerIndex = 2
    const alreadyIntroducedOwner = secondOwnerAddress
    // filling address field with a already introduced address
    await clickAndType(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage, alreadyIntroducedOwner)
    expect(await getInnerText(createSafePage.error_field_label, gnosisPage)).toBe(errorMsg.duplicated_address)

    // loads owner address with a QR code
    console.log('Loads a owner address with a QR code')
    gnosisPage.waitForFileChooser()
    await clickSomething(createSafePage.get_scan_QR_code_btn(thirdOwnerIndex).selector, gnosisPage, 'css')
    await clickByText('button > span', 'Upload an image', gnosisPage)
    await gnosisPage.waitForTimeout(2000)
    await gnosisPage.waitForSelector("input[type='file']")
    const button = await gnosisPage.$("input[type='file']")
    await button.uploadFile(safeQRCodeFilePath)
    await gnosisPage.waitForTimeout(2000)
    await gnosisPage.keyboard.press('Escape')
    expect(await getInnerText(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage)).toBe(
      QR_CODE_ADDRESS,
    )
    await assertElementPresent(createSafePage.get_valid_address_check_icon(thirdOwnerIndex), gnosisPage)

    // shows invalid owner Address error
    console.log('Shows an error if it is an invalid address')
    const invalidAddress = 'this-is-an-invalid-address'
    await clearInput(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage)
    await clickAndType(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage, invalidAddress)
    expect(await getInnerText(createSafePage.error_field_label, gnosisPage)).toBe(errorMsg.valid_ENS_name)

    // shows ENS resolution error
    console.log('Shows an error if the ENS Name Domain is not registered')
    const notExistingENSNameDomain = 'notExistingENSDomain.eth'
    await clearInput(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage)
    await clickAndType(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage, notExistingENSNameDomain)
    expect(await getInnerText(createSafePage.error_field_label, gnosisPage)).toBe(errorMsg.valid_ENS_name)

    // ENS resolution with a valid owner address
    console.log('Loads a owner address with a valid ENS address')
    const validENSAddress = 'francotest.eth'
    const addressFromENS = '0x61a0c717d18232711bC788F19C9Cd56a43cc8872'
    await clearInput(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage)
    await clickAndType(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage, validENSAddress)
    await assertElementPresent(createSafePage.get_valid_address_check_icon(thirdOwnerIndex), gnosisPage)
    expect(await getInnerText(createSafePage.get_owner_address_field(thirdOwnerIndex), gnosisPage)).toBe(addressFromENS)

    // Selects a custom Threshold for the new Safe
    console.log('Selects a custom Threshold for the new Safe')
    await clickElement(createSafePage.threshold_selector, gnosisPage)
    await clickElement(createSafePage.get_threshold_option(3), gnosisPage)
    expect(await getInnerText(createSafePage.threshold_hidden_input, gnosisPage)).toBe('3')

    // remove the third owner
    console.log('Removes a owner')
    await clickSomething(createSafePage.get_remove_owner_btn(thirdOwnerIndex).selector, gnosisPage, 'css')
    const removedOwner = await gnosisPage.waitForSelector(
      createSafePage.get_owner_address_field(thirdOwnerIndex).selector,
      { timeout: 1000, hidden: true },
    )
    expect(removedOwner).toBeNull()

    // updates the threshold value to make sure that you can not set more confirmations than owners
    // see https://github.com/gnosis/safe-react/issues/2733
    console.log('sets less confirmations than owners, see [#2733](https://github.com/gnosis/safe-react/issues/2733)')
    expect(await getInnerText(createSafePage.threshold_hidden_input, gnosisPage)).toBe('2')

    // goes to the last review safe step
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
    expect(await getInnerText(createSafePage.review_owner_name(firstOwnerAddress), gnosisPage)).toBe('My Wallet')
    expect(await getInnerText(createSafePage.review_owner_address(firstOwnerAddress), gnosisPage)).toBe(
      firstOwnerAddress,
    )
    expect(await getInnerText(createSafePage.review_owner_name(secondOwnerAddress), gnosisPage)).toBe(secondOwnerName)
    expect(await getInnerText(createSafePage.review_owner_address(secondOwnerAddress), gnosisPage)).toBe(
      secondOwnerAddress,
    )

    console.log('Submits the Create Safe Form')
    await clickSomething(generalInterface.submit_btn.selector, gnosisPage, 'css')
    await MMpage.bringToFront()
    await MMpage.waitForTimeout(2000)
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
