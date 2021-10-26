#### [Add/remove Owners](./../src/add_remove_owner.test.js)
1. Enter add owner form
2. Validate Owner name and address required, invalid address, duplicated address
3. Input valid owner name and address
4. Checks them in review step and submits, confirms and executes
5. Finds new owner in the owners list, clicks on remove owner
6. Sets threshold value to "2"
7. Verifies owner to be removed name an address
8. Signs and executes. Verifies tx success status

#### [Create safe](./../src/create_safe.test.js)
1. Enters into the create safe form with the Create button
2. Shows Connect wallet & select network step
3. Switches the network and connect your wallet
4. Shows naming the Safe step
5. Type a name for the safe
6. Shows Owners and Confirmations step
7. Adds the current user address as default owner
8. Adds a new owner row with a valid address
9. Shows a "required" error if a owner address is empty
10. Shows a "Address already introduced" error if a owner address is duplicated
11. Loads a owner address with a QR code
12. Shows an error if it is an invalid address
13. Shows an error if the ENS Name Domain is not registered
14. Loads a owner address with a valid ENS address
15. Selects a custom Threshold for the new Safe
16. Removes a owner
17. sets less confirmations than owners, see [#2733](https://github.com/gnosis/safe-react/issues/2733)
18. Shows Review Safe step
19. Checks the name of the new Safe
20. Checks the threshold of the new Safe
21. Checks owners of the new Safe
22. Submits the Create Safe Form
23. Checks "block explorer" and "back" button during the safe creation
24. Checks if the Safe Created popup is showed
25. Checks safe name on the sidebar once the safe is loaded

#### [Create Safe with a Old MultiSig migration](./../src/create_safe_migration.test.js)
1. Shows Connect wallet & select network step
2. Shows naming the Safe step
3. Check the name of the safe
4. Shows Owners and Confirmations step
5. Shows Owners from migration URL
6. Selects the custom Threshold from the migration URL
7. Shows Review Safe step
8. Checks the name of the new Safe
9. Checks the threshold of the new Safe
10. Checks owners of the new Safe
11. Submits the Create Safe Form
12. Checks "block explorer" and "back" button during the safe creation
13. Checks if the Safe Created popup is showed
14. Checks safe name on the sidebar once the safe is loaded


#### [Modify policies](./../src/modify_policies.test.js)
1. Opens modify policies
2. Opens selector, selects "1" value
3. Signs transaction with current owner, confirm and executes with the 2nd owner

#### [Address book](./../src/read_only/address_book.test.js)
1. Enter the address book. Validates 3 entries present by name (the load safe process created them)
2. Creates an entry with valid name and address. Validates it in the entries list
3. Validate error messages in entry creation: "RandomString", duplicated entry.
4. Validates ENS names translation (is a hardcoded ENS name for this test)
5. Edits entry. First validates name to be required, then enters a valid new name and saves
6. Finds edited name and deletes the entry
7. Exports a file (no validations)
8. Imports a file. checks new expected name to be in the entries list

#### [Footer exists in the Welcome page and Settings](./../src/read_only/app_layout.test.js)
1. Footer is present in the Welcome page
2. Footer is not present in the Balances page
3. Footer is not present in the Address Book page
4. Footer is present in the Settings pages

#### [Load safe](./../src/read_only/load_safe.test.js)
1. Enters into the load form with the Load button component
2. Shows the select network step
3. Switches the network
4. Types name and address for the safe
5. Loads a Safe address with a QR code
6. Shows an error if it is an invalid address
7. Shows an error if it is an invalid Safe address
8. Shows an error if the ENS Name Domain is not registered
9. Shows an error if it is an invalid Safe address From a valid ENS Name Domain
10. Gets the Safe address From a valid ENS Name Domain
11. Types name and address for the safe
12. Enters the name of the 1st owner in the list
13. Checks in the 3rd step that the safe name and owner name are the ones set before
14. Loads the safe
15. Opens the QR code for the safe on the sidebar and checks the safe name again


#### [Safe Apps List](./../src/read_only/safe_apps_list.test.js)
1. Shows Bookmarked Apps Section
2. Shows All Apps Section
3. Opens a Safe App
4. Shows Disclaimer and clicks on accept
5. Loads Safe Apps in an iframe
6. Pins Safe Apps
7. Refresh the page should keep the Bookmarked Safe Apps
8. Unpins Safe Apps
9. Searches by Safe App Title
10. Searches by Safe App Description
11. Shows the add custom Safe Apps form
12. Populates the custom the Safe App url and name
13. "Add Custom Safe App" button should be disabled if the checkbox is unchecked
14. Adds a custom Safe Apps
15. Loads the Custom App in an iframe
16. Shows the Custom Safe App in the Apps List
17. Validates the custom Safe App Url
18. Validates if the Custom Safe App was already added
19. Removes a Custom Safe App

#### [Safe Balances](./../src/read_only/safe_balances.test.js)
1. Enters the Safe Balances page
2. USD currency by default
3. Safe Balances table shows the amounts in USD
4. selects a new default currency
5. Safe Balances table shows the amounts in the new selected currency
6. updates the new selected currency in the localStorage
7. refresh the page should keep the selected value

#### [Reject tx](./../src/reject_tx.test.js)
1. Checks current ETH funds in safe
2. Open send funds form
3. Fills address, eth amount and signs transaction
4. Open tx details and click reject button
5. Signs with current owner
6. Checks ON-CHAIN REJECTION text to assure rejection is waiting for execution
7. Executes Rejection
8. Opens history tab, checks last tx is a Rejection and checks the successful status

#### [Replace owner](./../src/replace_owners.test.js)
1. Find added owner. click "Replace" button
2. Add valid name and address for replacement owner
3. Signs and execute
4. Removes owner for replacement. Sets threshold to "2". Check owner name and address in review step
5. Signs and executes
6. Checks status success of executed tx

#### [Send funds](./../src/send_funds.test.js)
1. Open the send funds form
2. Types a receiver address
3. Validates error for invalid amounts: 0, "abc", 99999
4. Checks "Send max" button
5. Checks receiver address and amount input in the review step
6. Signs with current account, executes with the 2nd owner account
7. Goes to history tx tab, checks tx amount sent and receiver address
8. Goes to Assets, checks the amount of tokens was reduced by the sent amount

