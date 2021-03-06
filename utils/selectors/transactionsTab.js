export const transactionsTab = {
  confirmed_tx_check: "img[data-testid='confirmed-tx-check']",
  not_confirmed_tx_check: "img[data-testid='not-confirmed-tx-check']",
  confirmed_counter: (owners) => `div[data-testid='confirmed-${owners}-out-of-2']`,
  rejected_counter: (owners) => `div[data-testid='rejected-${owners}-out-of-2']`,
  confirm_tx_btn: "button[data-testid='confirm-btn']",
  reject_tx_btn: "button[data-testid='reject-btn']:enabled",
  tx_description_send: "div[data-testid='tx-description-send']",
  transaction_row: (index = 0) => `[data-testid='transaction-row-${index}']`,
  no_tx_in_queue: '[alt=\'No Transactions yet\']',
  tx_nonce: 'div.tx-nonce',
  tx_type: { selector: 'div.tx-type', type: 'css' },
  tx_info: 'div.tx-info',
  tx_votes: 'div.tx-votes',
  tx_status: 'div.tx-status',
  on_chain_rejection_type: { selector: 'div.tx-type.on-chain-rejection', type: 'css' }
}

export const statusLabel = {
  success: 'Success',
  cancelled: 'Cancelled',
  failed: 'Failed',
  awaiting_your_confirmation: 'Needs your confirmation',
  needs_confirmations: 'Needs confirmations',
  awaiting_execution: 'Awaiting execution',
  pending: 'Pending',
}
