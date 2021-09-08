#### address_book.test.js

Address Book\
1.
 Loads safe form, giving name to the safe and the first 2 owners\
2.
 Enter into address book. Validates 3 entries present by name (the load safe process created them)\
3.
 Creates an entry with valid name and address. Validates it in the entries list\
4.
 Validate error messages in entry creation: "RandomString", duplicated entry.\
5.
 Validates ENS names translation (is a hardcoded ENS name for this test)\
6.
 Edits entry. First validates name to be required, then enters a valid new name and saves\
7.
 Finds edited name and deletes the entry\
8.
 Exports a file (no validations)\
9.
 Imports a file. checks new expected name to be in the entries list

#### add_remove_owner.test.js

Add/remove Owners\
1.
 Enter add owner form\
2.
 Validate Owner name and address required, invalid address, duplicated address\
3.
 Input valid owner name and address,\
4.
 Checks them in review step and submits, confirms and executes\
5.
 Finds new owner in the owners list, clicks on remove owner\
6.
 Sets threshold value to "2"\
7.
 Verifies owner to be removed name an address\
8.
 Signs and executes. Verifies tx success status

#### create_safe.test.js

Create safe\
1.
 Enters into the create safe form with the Create button\
2.
 Type a name for the safe\
3.
 Adds a new owner row\
4.
 Check that owner names and addresses are required when clicking submit\
5.
 Type names and addresses only for "owner2"\
6.
 Checks that the policies selector matches the amount of owners\
7.
 Checks in review step the name of the safe, name and address of owner2\
8.
 Checks "block explorer" and "back" button during the safe creation\
9.
 Checks safe name on the sidebar once the safe is loaded

#### load_safe.test.js

Load safe\
1.
 Enters into the load form with the Load button component\
2.
 Types name and address for the safe\
3.
 Enters the name of the 1st owner in the list\
4.
 Checks in the 3rd step that the safe name and owner name are the ones set before\
5.
 Loads the safe\
6.
 Opens the QR code for the safe on the sidebar and checks the safe name again 

#### modify_policies.test.js

Modify policies\
1.
 Opens modify policies\
2.
 Opens selector, selects "1" value\
3.
 Signs transaction with current owner, confirm and executes with the 2nd owner\
4.
 Opens modify policies again, changes it to "2"\
5.
 Signs and execute\
6.
 Checks in settings the successful change to "2 out of X"

#### reject_tx.test.js

Reject tx\
1.
 Checks current ETH funds in safe\
2.
 Open send funds form\
3.
 Fills address, eth amount and signs transaction\
4.
 Open tx details and click reject button\
5.
 Signs with current owner\
6.
 Checks ON-CHAIN REJECTION text to assure rejection is waiting for execution\
7.
 Executes Rejection\
8.
 Opens history tab, checks last tx is a Rejection and checks the successful status

#### replace_owners.test.js

Replace owner\
1.
 Add owner form, inputs name and address, validates name and address in review step. Signs and executes\
2.
 Find added owner. click "Replace" button\
3.
 Add valid name and address for replacement owner\
4.
 Validate owner being replaced name and address and owner for replacement name and address in review step\
5.
 Signs and execute\
6.
 Validate owner for replacement present in the owner list\
7.
 Removes owner for replacement. Sets threshold to "2". Check owner name and address in review step\
8.
 Signs and executes\
9.
 Checks status success of executed tx

#### send_funds.test.js

Send funds\
1.
 Open send funds form\
2.
 Types a receiver address\
3.
 Selects ETH token to send (is hardcoded to send only ETH, so it will fail for other networks currently)\
4.
 Validates error for invalid amounts: 0, "abc", 99999\
5.
 Checks "Send max" button\
6.
 Checks receiver address and amount input in the review step\
7.
 Signs with current account, executes with the 2nd owner account\
8.
 Goes to history tx tab, checks tx amount sent and receiver address\
9.
 Goes to Assets, checks the amount of tokens was reduced by the sent amount

