export const settingsPage = {
  owners_tab: { selector: "[data-testid='owner-settings-tab']", type: 'css' },
  add_remove_replace_modal: { selector: '.bigger-modal-window', type: 'css' },
  add_owner_btn: { selector: "[data-testid='add-owner-btn']", type: 'css' },
  add_owner_name_input: { selector: "[data-testid='add-owner-name-input']", type: 'css' },
  add_owner_address_input: { selector: "[data-testid='add-owner-address-testid']", type: 'css' },
  add_owner_next_btn: { selector: "[data-testid='add-owner-next-btn']", type: 'css' },
  add_owner_review_btn: { selector: "[data-testid='add-owner-threshold-next-btn']", type: 'css' },
  add_owner_submit_btn: { selector: "[data-testid='add-owner-submit-btn']", type: 'css' },
  add_owner_submit_btn_disabled: { selector: "[data-testid='add-owner-submit-btn'][disabled]", type: 'css' },
  add_owner_name_review: { selector: "[data-testid='add-owner-review'] div div div p", type: 'css' },
  add_owner_address_review: { selector: "[data-testid='add-owner-review'] div div div div p", type: 'css' },
  remove_owner_trashcan_icon: { selector: "[data-testid='remove-owner-btn']", type: 'css' },
  remove_owner_next_btn: { selector: "[data-testid='remove-owner-next-btn']", type: 'css' },
  remove_owner_review_btn: { selector: "[data-testid='remove-owner-threshold-next-btn']", type: 'css' },
  remove_owner_submit_btn: { selector: "[data-testid='remove-owner-review-btn']", type: 'css' },
  remove_owner_name_review: { selector: "[data-testid='remove-owner-review'] div div div p", type: 'css' },
  remove_owner_address_review: { selector: "[data-testid='remove-owner-review'] div div div div p", type: 'css' },
  owner_rows: { selector: "[data-testid='owners-row']", type: 'css' },
  owner_rows_address_block: { selector: "[data-testid='owners-row'] td:nth-child(2)", type: 'css' }, // use textContent to get the owner address
  replace_owner_btn: { selector: "[data-testid='replace-owner-btn']", type: 'css' },
  replace_owner_name_input: { selector: "[data-testid='replace-owner-name-input']", type: 'css' },
  replace_owner_address_input: { selector: "[data-testid='replace-owner-address-testid']", type: 'css' },
  replace_owner_next_btn: { selector: "[data-testid='replace-owner-next-btn']", type: 'css' },
  replace_owner_submit_btn: { selector: "[data-testid='replace-owner-submit-btn']", type: 'css' },
  current_nonce: { selector: "[data-testid='current-nonce']", type: 'css' },
}

export const settingsTabs = {
  req_conf_dropdown: { selector: "div[data-testid='threshold-select-input']", type: 'css' }, // req confirmation dropdown for the safe creation form
}
