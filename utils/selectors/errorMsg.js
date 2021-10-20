export const errorMsg = {
  error: (msg) => `//p[contains(text(),"${msg}")]`,
  required: 'Required',
  greater_than_0: 'Should be greater than 0',
  valid_ENS_name: 'Must be a valid address, ENS or Unstoppable domain',
  invalid_Safe_Address: 'Address given is not a valid Safe address',
  duplicated_address: 'Address already introduced',
  not_a_number: 'Must be a number',
  max_amount_tokens: (value = 0) => `Maximum value is ${value}`,
  modify_policy: (value = 0) => `Value should be different than ${value}`,
}
