#### address_book.test.js

Address Book
-- Loads safe form, giving name to the safe and the first 2 owners
-- Enter into address book. Validates 3 entries present by name (the load safe process created them)
-- Creates an entry with valid name and address. Validates it in the entries list
-- Validate error messages in entry creation: "RandomString", duplicated entry.
-- Validates ENS names translation (is a hardcoded ENS name for this test)
-- Edits entry. First validates name to be required, then enters a valid new name and saves
-- Finds edited name and deletes the entry
-- Exports a file (no validations)
-- Imports a file. checks new expected name to be in the entries list

#### add_remove_owner.test.js

Add/remove Owners
-- Enter add owner form
-- Validate Owner name and address required, invalid address, duplicated address
-- Input valid owner name and address,
-- Checks them in review step and submits, confirms and executes
-- Finds new owner in the owners list, clicks on remove owner
-- Sets threshold value to "2"
-- Verifies owner to be removed name an address
-- Signs and executes. Verifies tx success status

#### create_safe.test.js

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

#### load_safe.test.js

Load safe
-- Enters into the load form with the Load button
-- Types name and address for the safe
-- Enters the name of the 1st owner in the list
-- Checks in the 3rd step that the safe name and owner name are the ones set before
-- Loads the safe
-- Opens the QR code for the safe on the sidebar and checks the safe name again

#### modify_policies.test.js

Modify policies
-- Opens modify policies
-- Opens selector, selects "1" value
-- Signs transaction with current owner, confirm and executes with the 2nd owner
-- Opens modify policies again, changes it to "2"
-- Signs and execute
-- Checks in settings the successful change to "2 out of X"

#### reject_tx.test.js

Reject tx
-- Checks current ETH funds in safe
-- Open send funds form
-- Fills address, eth amount and signs transaction
-- Open tx details and click reject button
-- Signs with current owner
-- Checks ON-CHAIN REJECTION text to assure rejection is waiting for execution
-- Executes Rejection
-- Opens history tab, checks last tx is a Rejection and checks the successful status

#### replace_owners.test.js

Replace owner
-- Add owner form, inputs name and address, validates name and address in review step. Signs and executes
-- Find added owner. click "Replace" button
-- Add valid name and address for replacement owner
-- Validate owner being replaced name and address and owner for replacement name and address in review step
-- Signs and execute
-- Validate owner for replacement present in the owner list
-- Removes owner for replacement. Sets threshold to "2". Check owner name and address in review step
-- Signs and executes
-- Checks status success of executed tx

#### send_funds.test.js

Send funds
-- Open send funds form
-- Types a receiver address
-- Selects ETH token to send (is hardcoded to send only ETH, so it will fail for other networks currently)
-- Validates error for invalid amounts: 0, "abc", 99999
-- Checks "Send max" button
-- Checks receiver address and amount input in the review step
-- Signs with current account, executes with the 2nd owner account
-- Goes to history tx tab, checks tx amount sent and receiver address
-- Goes to Assets, checks the amount of tokens was reduced by the sent amount

