[![Build Status](https://travis-ci.org/schul-cloud/gamification.svg?branch=master)](https://travis-ci.org/schul-cloud/gamification)
[![Coverage Status](https://coveralls.io/repos/github/schul-cloud/gamification/badge.svg)](https://coveralls.io/github/schul-cloud/gamification)
# gamification

The service is built using [Feathers](https://feathersjs.com). It depends on  [mongoDB](https://www.mongodb.com/) and [RabbitMQ](https://www.rabbitmq.com/). 

## Development

There are two ways of setting up your local development environment: using Docker or setting up everything manually.

We use [nodemon](https://nodemon.io/) to automatically restart the service on changes.

### Docker

First run `npm install`. Then start the docker environment.
```
docker-compose -f docker-compose.dev.yml up
```
This starts the containers for the app, MongoDB and RabbitMQ. If necessary, the app's container is built automatically in advance.
The app is then available at http://localhost:3030/.

##### RabbitMQ: Sending Events manually

The RabbitMQ management interface is available at http://localhost:15672. In development mode, use Username `guest` and Password `guest` to login.

You can send events manually in the *Exchanges* section. Select the exchange and then publish your message at *Publish message*. Don't forget to insert the *routing key*.

The configuration files are mounted from `dev/rabbitmq-config`.

### Manual setup

Run `npm install`.

Additionally you need to have mongoDB and RabbitMQ running. Configure them in `config/default.json`. This service receives incoming events from *queues*. 

Start your app: `npm run dev`.

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

## Usage in Production

First, configure the service. (`config/` directory)  
*production.json* needs to contain all information like host, port and mongoDB as well as RabbitMQ related information. *default.json* is an example.  
*gamification.yml* contains all events to listen to and the achievements users are able to get.

Then, configure your Docker setup (`docker-compose.yml`). Set the port the service should be available on. The format is `YOUR_PORT:3030`.

To start the app together with mongoDB run `docker-compose up`.

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
