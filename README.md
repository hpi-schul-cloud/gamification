[![Build Status](https://travis-ci.com/frederike-ramin/gamification.svg?branch=master)](https://travis-ci.com/frederike-ramin/gamification)
[![Coverage Status](https://coveralls.io/repos/github/frederike-ramin/gamification/badge.svg?branch=coveralls)](https://coveralls.io/github/frederike-ramin/gamification?branch=coveralls)
# gamification

> A reusable microservice for gamification.

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Development with Docker
```
docker-compose -f docker-compose.dev.yml up
```
This starts the containers for the app, mongoDB and RabbitMQ. If necessary, the app's container is build automatically in advance.
The app is then available at http://localhost:3030/.

### RabbitMQ: Sending events manually
The RabbitMQ management interface is available at http://localhost:15672. In development mode, use Username `guest` and Passowrd `guest` to login.

You can send events manually in the *Exchanges* section. Select the exchange and then publish your message at *Publish message*. Don't forget to insert the *routing key*.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/gamification; npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
