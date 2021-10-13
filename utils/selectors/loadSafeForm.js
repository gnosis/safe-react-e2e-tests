export const loadSafeForm = {
  form: { selector: "form[data-testid='load-safe-form']", type: 'css' },

  select_network_step: { selector: "div[data-testid='select-network-step']", type: 'css' },
  select_network_label: { selector: "div[data-testid='select-network-step'] > p > span", type: 'css' },
  select_network_dialog: { selector: "div[role='dialog']", type: 'css' },
  select_network_dialog_body: { selector: "div[role='dialog']", type: 'css' },

  name_and_address_safe_step: { selector: "div[data-testid='load-safe-address-step']", type: 'css' },
  load_safe_address_qr: { selector: "img[role='button']", type: 'css' },
  safe_name_field: { selector: "input[data-testid='load-safe-name-field']", type: 'css' },
  safe_address_field: { selector: "input[data-testid='load-safe-address-field']", type: 'css' },

  safe_owners_step: { selector: "p[data-testid='load-safe-owners-step']", type: 'css' },
  valid_address: { selector: "svg[data-testid='safeAddress-valid-address-adornment']", type: 'css' },
  owner_row: { selector: "div[data-testid='owner-row']", type: 'css' }, // all the rows, to count
  owner_name: (index = 0) => ({ selector: `input[data-testid='load-safe-owner-name-${index}']`, type: 'css' }),
  step_three: { selector: "p[data-testid='load-safe-step-three']", type: 'css' },
  review_safe_name: { selector: "p[data-testid='load-form-review-safe-name']", type: 'css' },
  review_owner_name: (index = 0) => ({
    selector: `[data-testid='load-safe-review-owner-name-${index}'] p`,
    type: 'css',
  }),
  valid_safe_name: { selector: "//p[contains(text(),'Safe name')]", type: 'Xpath' },
}
