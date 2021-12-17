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
  send_funds_review: { selector: "div[data-testid='send-funds-review-step']", type: 'css' },
  recipient_address_review: { selector: "[data-testid='recipient-review-step'] div div div p", type: 'css' },
  amount_eth_review: { selector: "p[data-testid='amount-ETH-review-step']", type: 'css' },
  fee_msg_review: { selector: "p[data-testid='fee-meg-review-step']", type: 'css' },
  submit_btn: { selector: "button[data-testid='submit-tx-btn']:enabled", type: 'css' },
  submit_btn_disabled: { selector: "button[data-testid='submit-tx-btn']:disabled", type: 'css' },
  advanced_options: { selector: "//p[contains(text(),'Advanced options')]", type: 'Xpath' },
  valid_amount_msg: { selector: "//div/p[contains(text(), 'Amount*')]", type: 'Xpath' },
  edit_advanced_options_btn: { selector: "//button/p[contains(text(), 'Edit')]", type: 'Xpath' },
  safe_nonce_input: { selector: "input[name='safeNonce']", type: 'css' },
  confirm_advanced_options_btn: { selector: "//button/span[contains(text(), 'Confirm')]", type: 'Xpath' },
  sendModal: { selector: '.paper.smaller-modal-window', type: 'css' },
}

export const advancedOptions = {
  gasLimitInput: { selector: '[placeholder="Gas limit"]', type: 'css' },
  gasPriceInput: { selector: '[placeholder="Gas price (GWEI)"]', type: 'css' },
  nonce: { selector: '//div[2]//div/div/div/div[1]/p[2]', type: 'Xpath' },
  gasLimit: { selector: '//div[4]/p[2]', type: 'Xpath' },
  gasPrice: { selector: '//div[5]/p[2]', type: 'Xpath' },
}
