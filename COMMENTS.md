#### address_book.test.js

Address Boo\
1.k
 Loads safe form, giving name to the safe and the first 2 owner\
2.s
 Enter into address book. Validates 3 entries present by name (the load safe process created them\
3.)
 Creates an entry with valid name and address. Validates it in the entries lis\
4.t
 Validate error messages in entry creation: "RandomString", duplicated entry\
5..
 Validates ENS names translation (is a hardcoded ENS name for this test\
6.)
 Edits entry. First validates name to be required, then enters a valid new name and save\
7.s
 Finds edited name and deletes the entr\
8.y
 Exports a file (no validations\
9.)
 Imports a file. checks new expected name to be in the entries list

#### add_remove_owner.test.js

Add/remove Owner\
1.s
 Enter add owner for\
2.m
 Validate Owner name and address required, invalid address, duplicated addres\
3.s
 Input valid owner name and address\
4.,
 Checks them in review step and submits, confirms and execute\
5.s
 Finds new owner in the owners list, clicks on remove owne\
6.r
 Sets threshold value to "2\
7."
 Verifies owner to be removed name an addres\
8.s
 Signs and executes. Verifies tx success status

#### create_safe.test.js

Create saf\
1.e
 Enters into the create safe form with the Create butto\
2.n
 Type a name for the saf\
3.e
 Adds a new owner ro\
4.w
 Check that owner names and addresses are required when clicking submi\
5.t
 Type names and addresses only for "owner2\
6."
 Checks that the policies selector matches the amount of owner\
7.s
 Checks in review step the name of the safe, name and address of owner\
8.2
 Checks "block explorer" and "back" button during the safe creatio\
9.n
 Checks safe name on the sidebar once the safe is loaded

#### load_safe.test.js

Load saf\
1.e
 Enters into the load form with the Load butto\
2.n
 Types name and address for the saf\
3.e
 Enters the name of the 1st owner in the lis\
4.t
 Checks in the 3rd step that the safe name and owner name are the ones set befor\
5.e
 Loads the saf\
6.e
 Opens the QR code for the safe on the sidebar and checks the safe name again 

#### modify_policies.test.js

Modify policie\
1.s
 Opens modify policie\
2.s
 Opens selector, selects "1" valu\
3.e
 Signs transaction with current owner, confirm and executes with the 2nd owne\
4.r
 Opens modify policies again, changes it to "2\
5."
 Signs and execut\
6.e
 Checks in settings the successful change to "2 out of X"

#### reject_tx.test.js

Reject t\
1.x
 Checks current ETH funds in saf\
2.e
 Open send funds for\
3.m
 Fills address, eth amount and signs transactio\
4.n
 Open tx details and click reject butto\
5.n
 Signs with current owne\
6.r
 Checks ON-CHAIN REJECTION text to assure rejection is waiting for executio\
7.n
 Executes Rejectio\
8.n
 Opens history tab, checks last tx is a Rejection and checks the successful status

#### replace_owners.test.js

Replace owne\
1.r
 Add owner form, inputs name and address, validates name and address in review step. Signs and execute\
2.s
 Find added owner. click "Replace" butto\
3.n
 Add valid name and address for replacement owne\
4.r
 Validate owner being replaced name and address and owner for replacement name and address in review ste\
5.p
 Signs and execut\
6.e
 Validate owner for replacement present in the owner lis\
7.t
 Removes owner for replacement. Sets threshold to "2". Check owner name and address in review ste\
8.p
 Signs and execute\
9.s
 Checks status success of executed tx

#### send_funds.test.js

Send fund\
1.s
 Open send funds for\
2.m
 Types a receiver addres\
3.s
 Selects ETH token to send (is hardcoded to send only ETH, so it will fail for other networks currently\
4.)
 Validates error for invalid amounts: 0, "abc", 9999\
5.9
 Checks "Send max" butto\
6.n
 Checks receiver address and amount input in the review ste\
7.p
 Signs with current account, executes with the 2nd owner accoun\
8.t
 Goes to history tx tab, checks tx amount sent and receiver addres\
9.s
 Goes to Assets, checks the amount of tokens was reduced by the sent amount

