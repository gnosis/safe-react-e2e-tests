import {
  clickByText,
  assertElementPresent,
  clickElement,
  clickAndType,
  assertTextPresent,
  isTextPresent,
  getInnerText,
} from '../utils/selectorsHelpers'
import { accountsSelectors } from '../utils/selectors/accounts'
import { createSafePage } from '../utils/selectors/createSafePage'
import { generalInterface } from '../utils/selectors/generalInterface'
import { initWithWalletConnected } from '../utils/testSetup'
import { rejectPendingTxs } from '../utils/actions/rejectPendingTxs'
// import { errorMsg } from '../utils/selectors/errorMsg'
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

const { FUNDS_RECEIVER_ADDRESS } = config

beforeAll(async () => {
  ;[browser, metamask, gnosisPage, MMpage] = await initWithWalletConnected()
}, 60000)

afterAll(async () => {
  await rejectPendingTxs(gnosisPage, metamask)
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
    await clickAndType(createSafePage.get_owner_address_field(secondOwnerIndex), gnosisPage, secondOwnerAddress)
    // expects a valid second owner values
    expect(await getInnerText(createSafePage.get_owner_name_field(secondOwnerIndex), gnosisPage)).toBe(secondOwnerName)
    expect(await getInnerText(createSafePage.get_owner_address_field(secondOwnerIndex), gnosisPage)).toBe(
      secondOwnerAddress,
    )
    await assertElementPresent(
      createSafePage.get_valid_address_check_icon(secondOwnerIndex),
      gnosisPage,
      secondOwnerAddress,
    )

    await clickElement(generalInterface.submit_btn, gnosisPage)

    // [Step 4] Owners and Confirmations
    console.log('Shows Review Safe step')
    await assertElementPresent(createSafePage.review_safe_step, gnosisPage)

    // review the name
    console.log('Checks the name of the new Safe')
    expect(await getInnerText(createSafePage.review_safe_name_label, gnosisPage)).toBe(newSafeName)

    // review the threshold
    console.log('Checks the threshold of the new Safe')
    expect(await getInnerText(createSafePage.review_safe_threshold_label, gnosisPage)).toBe('1 out of 2 owners')

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
    await clickElement(generalInterface.submit_btn, gnosisPage)
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
