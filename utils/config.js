import dotenv from 'dotenv'

dotenv.config()

const config = {
  SLOWMO: 3,
  ENVIRONMENT: {
    rinkeby: 'https://rinkeby.gnosis-safe.io/app/',
    dev: 'https://safe-team.dev.gnosisdev.com/app/',
    PR: (id) => `https://pr${id}--safereact.review.gnosisdev.com/rinkeby/app/`,
    stg: 'https://safe-team-rinkeby.staging.gnosisdev.com/app/',
    local: 'http://localhost:3000/'
  },
  MNEMONIC: process.env.MNEMONIC || 'range smoke crisp install cross shine hold grief ripple cabin sudden special', // it imports the wallet with "acc1" as owner
  PASSWORD: process.env.PASSWORD || 'password',
  TESTING_ENV: process.env.TESTING_ENV || 'dev',
  TESTING_SAFE_ADDRESS: process.env.TESTING_SAFE_ADDRESS || '0x5BC79B27731589B43c51f745315ca899b4056f33' // default testing safe
}

export default config
