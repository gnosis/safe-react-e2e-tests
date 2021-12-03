export const sendFundsForm = {
  modal_title_send_funds: { selector: "div[data-testid='modal-title-send-funds']", type: 'css' },
  current_eth_balance: { selector: "b[data-testid='current-eth-balance']", type: 'css' },
  recipient_input: { selector: "input[id='address-book-input']", type: 'css' },
  recipient_input_value_entered: { selector: '.smaller-modal-window div div div div div p', type: 'css' }, // needs data-testid
  select_token: { selector: "div[id='mui-component-select-token']", type: 'css' },
  review_btn_disabled: { selector: "button[data-testid='review-tx-btn']:disabled", type: 'css' }, // send funds review button initially disabled
  review_btn: { selector: "button[data-testid='review-tx-btn']", type: 'css' },
  select_token_ether: { selector: "div[data-testid='select-token-Ether']", type: 'css' },
  send_max_btn: { selector: "button[data-testid='send-max-btn']", type: 'css' },
  amount_input: { selector: "input[data-testid='amount-input']", type: 'css' },
  // send_funds_review: { selector: "div[data-testid='send-funds-review-step']", type: 'css' }, Doesn't exist anymore, why?
  send_funds_review: { selector: "//p[contains(text(),'2 of 2')]", type: 'Xpath' },
  recipient_address_review: { selector: "[data-testid='recipient-review-step']", type: 'css' },
  amount_eth_review: { selector: "p[data-testid='amount-ETH-review-step']", type: 'css' },
  fee_msg_review: { selector: "p[data-testid='fee-meg-review-step']", type: 'css' },
  submit_btn: { selector: "button[data-testid='submit-tx-btn']:enabled", type: 'css' },
  submit_btn_disabled: { selector: "button[data-testid='submit-tx-btn']:disabled", type: 'css' },
  advanced_options: { selector: "//p[contains(text(),'Advanced options')]", type: 'Xpath' },
  valid_amount_msg: { selector: "//div/p[contains(text(), 'Amount*')]", type: 'Xpath' },
}
