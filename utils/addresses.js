import config from './config'

const { NETWORK_ADDRESS_PREFIX } = config

export const getShortNameAddress = (address) => `${NETWORK_ADDRESS_PREFIX}:${address}`
