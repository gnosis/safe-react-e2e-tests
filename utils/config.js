import dotenv from 'dotenv'

dotenv.config()

const config = {
  SLOWMO: 3,
  ENVIRONMENT: {
    rinkeby: 'https://rinkeby.gnosis-safe.io/app/',
    dev: 'https://safe-team.dev.gnosisdev.com/app/',
    PR: (id) => `https://pr${id}--safereact.review-safe.gnosisdev.com/app/`,
    stg: 'https://safe-team.staging.gnosisdev.com/app/',
    prod: 'https://gnosis-safe.io/app',
    local: 'http://localhost:3000/',
  },
  MNEMONIC: process.env.MNEMONIC || 'range smoke crisp install cross shine hold grief ripple cabin sudden special', // it imports the wallet with "acc1" as owner
  PRIVATE_KEY_GROUP: process.env.PRIVATE_KEY_GROUP
    ? process.env.PRIVATE_KEY_GROUP.split(',')
    : [
        'E0334B3F5CA1C4FBB26B3845F295DF12FE65EA052F31A5F800194958DCBDCB04',
        '3F23488883EE1A6346641D77ABF6ECDC78B03A0A9233EC6FAD1AB02FFC093CC5',
        '471F28E1C41C5FCF89A7BC76072F1A17644AE166F4FEBC31DAE2BAAF0AD8AA06',
      ],
  PASSWORD: process.env.PASSWORD || 'password',
  TESTING_ENV: process.env.TESTING_ENV || 'dev',
  TESTING_SAFE_ADDRESS: process.env.TESTING_SAFE_ADDRESS || '0x5BC79B27731589B43c51f745315ca899b4056f33', // default testing safe
  FUNDS_RECEIVER_ADDRESS: process.env.FUNDS_RECEIVER_ADDRESS || '0x61a0c717d18232711bC788F19C9Cd56a43cc8872',
  NON_OWNER_ADDRESS: process.env.NON_OWNER_ADDRESS || '0xc8b99Dc2414fAA46E195a8f3EC69DD222EF1744F',
  PUPPETEER_EXEC_PATH: process.env.PUPPETEER_EXEC_PATH,
  QR_CODE_ADDRESS: '0x57CB13cbef735FbDD65f5f2866638c546464E45F',

  // network
  NETWORK_NAME: process.env.NETWORK_NAME || 'Rinkeby',
  NETWORK_ADDRESS_PREFIX: process.env.NETWORK_ADDRESS_PREFIX || 'rin',
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
}

export default config
