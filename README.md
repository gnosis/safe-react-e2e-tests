# Gnosis Safe e2e tests

This repository contains the code to run e2e tests in Gnosis Safe web interface [https://github.com/gnosis/safe-react/]

For technical information please refer to the [Gnosis Developer Portal](https://docs.gnosis.io/safe/).

For support requests, please open up a [bug issue](https://github.com/gnosis/safe-react/issues/new?template=bug-report.md) or reach out via [Discord](https://discordapp.com/invite/FPMRAwK).


## Getting Started

These instructions will help you to run a set of e2e tests to a Gnosis Safe interface. This can be specially helpful when developing features for the Gnosis Safe web interface, as a quick check of all the interface features.

### Installing and running

Install dependencies for the project:
```
yarn install
```

Run using the config in your `.env` file. If no .env is defined this command will use `dev` environment
```
yarn test
```

To test a local instance of the project:
```
yarn test-local
```
It should be running at http://localhost:3000/


To run against a PR instance:
```
PR=xxxx yarn test-pr
```


More testing environments can be check at [utils/config.js](https://github.com/gnosis/safe-react-e2e-tests/blob/develop/utils/config.js)

### Environment variables
Although is not necessary to define them to use for example `yarn test-local`, the app is able to pick environment variables from the `.env` file. Copy our template to your own local file:
```
cp .env.example .env
```

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](https://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/gnosis/safe-react-e2e-tests/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details