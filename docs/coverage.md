#### [Add/remove Owners](./../src/add_remove_owner.test.js)
1. Enter add owner form
2. Validate Owner name and address required, invalid address, duplicated address
3. Input valid owner name and address
4. Checks them in review step and submits, confirms and executes
5. Finds new owner in the owners list, clicks on remove owner
6. Sets threshold value to "2"
7. Verifies owner to be removed name an address
8. Signs and executes. Verifies tx success status

#### [Address book](./../src/address_book.test.js)
1. Enter the address book. Validates 3 entries present by name (the load safe process created them)
2. Creates an entry with valid name and address. Validates it in the entries list
3. Validate error messages in entry creation: "RandomString", duplicated entry.
4. Validates ENS names translation (is a hardcoded ENS name for this test)
5. Edits entry. First validates name to be required, then enters a valid new name and saves
6. Finds edited name and deletes the entry
7. Exports a file (no validations)
8. Imports a file. checks new expected name to be in the entries list

#### [Footer exists in the Welcome page and Settings](./../src/app_layout.test.js)
1. Footer is present in the Welcome page
2. Footer is not present in the Balances page
3. Footer is not present in the Address Book page
4. Footer is present in the Settings pages

#### [Create safe](./../src/create_safe.test.js)
1. Enters into the create safe form with the Create button
2. Type a name for the safe
3. Adds a new owner row
4. Type names and addresses only for "owner2"
5. Check that owner names and addresses are required when clicking submit
6. Checks that the policies selector matches the amount of owners
7. Checks in review step the name of the safe, name and address of owner2
8. Checks "block explorer" and "back" button during the safe creation
9. Checks safe name on the sidebar once the safe is loaded


#### [Load safe](./../src/load_safe.test.js)
1. Enters into the load form with the Load button component
2. Types name and address for the safe
3. Enters the name of the 1st owner in the list
4. Checks in the 3rd step that the safe name and owner name are the ones set before
5. Loads the safe
6. Opens the QR code for the safe on the sidebar and checks the safe name again


#### [Modify policies](./../src/modify_policies.test.js)
1. Opens modify policies
2. Opens selector, selects "1" value
3. Signs transaction with current owner, confirm and executes with the 2nd owner

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

