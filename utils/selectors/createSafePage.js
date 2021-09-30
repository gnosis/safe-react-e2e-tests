export const createSafePage = {
  form: "form[data-testid='create-safe-form']",

  select_network_step: { selector: "div[data-testid='select-network-step']", type: 'css' },
  select_network_dialog: { selector: "div[role='dialog']", type: 'css' },
  select_network_connect_wallet_btn: { selector: "button[data-testid='heading-connect-btn']", type: 'css' },

  naming_safe_step: { selector: "div[data-testid='create-safe-name-step']", type: 'css' },
  safe_name_field: { selector: "input[data-testid='create-safe-name-field']", type: 'css' },

  owners_and_confirmations_step: { selector: "div[data-testid='create-safe-owners-confirmation-step']", type: 'css' },
  add_new_owner_btn: { selector: "button[data-testid='add-new-owner']", type: 'css' },
  get_owner_name_field: (index) => ({ selector: `input[data-testid='owner-name-${index}']`, type: 'css' }),
  get_owner_address_field: (index) => ({ selector: `input[data-testid='owner-address-${index}']`, type: 'css' }),
  get_valid_address_check_icon: (index) => ({
    selector: `svg[data-testid='owner-address-${index}-valid-adornment']`,
    type: 'css',
  }),

  review_safe_step: { selector: "div[data-testid='create-safe-review-step']", type: 'css' },
  review_safe_name_label: { selector: "p[data-testid='create-safe-review-safe-name']", type: 'css' },
  review_safe_threshold_label: { selector: "p[data-testid='create-safe-review-threshold-label']", type: 'css' },
  review_owner_name: (address) => ({
    selector: `div[data-testid='create-safe-owner-details-${address}'] > div > div:nth-child(2) > p`,
    type: 'css',
  }),
  review_owner_address: (address) => ({
    selector: `div[data-testid='create-safe-owner-details-${address}'] > div > div:nth-child(2) > div > p`,
    type: 'css',
  }),

  safe_created_dialog: { selector: "div[data-testid='safe-created-popup']", type: 'css' },
  safe_created_button: { selector: "button[data-testid='safe-created-button']", type: 'css' },

  safe_creation_proccess_title: "h2['safe-creation-process-title']",
  back_btn: "button[data-testid='safe-creation-back-btn']",
  continue_btn: "button[data-testid='continue-btn']",
  submit_btn: "button[type='submit']",
  etherscan_link: "a[data-testid='safe-create-explorer-link']",
}
