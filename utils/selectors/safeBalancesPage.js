export const safeBalancesPage = {
  currency_dropdown_btn: { selector: "button[data-testid='balances-currency-dropdown-btn']", type: 'css' },
  selected_currency_label: { selector: "button[data-testid='balances-currency-dropdown-btn'] > span", type: 'css' },
  currency_item_label: (label) => ({
    selector: `li[value='${label}']`,
    type: 'css',
  }),
  currency_showed_balances_table: {
    selector: "table[aria-labelledby='Balances'] > tbody > tr:nth-child(1) > td:nth-child(3) > div",
    type: 'css',
  },
}
