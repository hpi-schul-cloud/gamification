[![Build Status](https://travis-ci.com/schul-cloud/gamification.svg?branch=master)](https://travis-ci.com/schul-cloud/gamification)
[![Coverage Status](https://coveralls.io/repos/github/schul-cloud/gamification/badge.svg?branch=coveralls)](https://coveralls.io/github/schul-cloud/gamification?branch=coveralls)

# Gamification

> A reusable microservice for gamification.

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.


## Local Development

1. Make sure you have [NodeJS](https://nodejs.org/) >= 8.0.0, [npm](https://www.npmjs.com/) >= 6.1.0 and MongoDB installed.
2. If you don't have a local RabbitMQ installation, temporarily remove the `AmqpConnector.connect()` call from `src/index.js`.
3. Install npm dependencies

    ```
    cd path/to/gamification; npm install
    ```

4. Start the app

    ```
    npm dev
    ```


## Development with Docker

First run `npm install`. Then start the docker environment.

```
docker-compose -f docker-compose.dev.yml up
```

This starts the containers for the app, MongoDB and RabbitMQ.
The app is then available at http://localhost:3030/.

### RabbitMQ: Sending events manually

The RabbitMQ management interface is available at http://localhost:15672. In development mode, use Username `guest` and Password `guest` to login.

You can send events manually in the *Exchanges* section. Select the exchange and then publish your message at *Publish message*. Don't forget to insert the *routing key*.

## Testing

Run `npm test` to run all tests. Use `npm coverage` to run tests and generate coverage.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## License

Copyright (c) 2018 Kim-Pascal Borchart, Christian Flach, Corinna Jaschek,
Sebastian Kliem, Mandy Klingbeil, Marcus Konrad, Frederike Ramin.

Licensed under the [MIT license](LICENSE).
