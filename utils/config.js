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
  PRIVATE_KEY_GROUP: process.env.PRIVATE_KEY_GROUP || [
    'E0334B3F5CA1C4FBB26B3845F295DF12FE65EA052F31A5F800194958DCBDCB04',
    '3F23488883EE1A6346641D77ABF6ECDC78B03A0A9233EC6FAD1AB02FFC093CC5',
    '471F28E1C41C5FCF89A7BC76072F1A17644AE166F4FEBC31DAE2BAAF0AD8AA06'
  ],
  PASSWORD: process.env.PASSWORD || 'password',
  TESTING_ENV: process.env.TESTING_ENV || 'dev',
  TESTING_SAFE_ADDRESS: process.env.TESTING_SAFE_ADDRESS || '0x5BC79B27731589B43c51f745315ca899b4056f33' // default testing safe
}

export default config
