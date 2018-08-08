[![Build Status](https://travis-ci.com/schul-cloud/gamification.svg?branch=master)](https://travis-ci.com/schul-cloud/gamification)
[![Coverage Status](https://coveralls.io/repos/github/schul-cloud/gamification/badge.svg?branch=master)](https://coveralls.io/github/schul-cloud/gamification?branch=master)
[![GitHub license](https://img.shields.io/github/license/schul-cloud/gamification.svg)](https://github.com/schul-cloud/gamification/blob/master/LICENSE)

# Gamification

> A reusable microservice for gamification.

This project provides a microservice to manage gamification for your
application. It does not provide any graphics or pre-defined content, but
only a backend REST API. At its core, the service listens to events sent
either via HTTP POST calls or retrieved from RabbitMQ. Then, a list of
user-defined achievement rules is tested against the newly received event.
Should an achievement rule be evaluated to true, a new achievement is granted
to the user.

## Terminology

### User

All gamification data is associated with a user. Users are identified
by a unique string we commonly call `user_id`. Each user has

- a *level*
- many granted *achievement*s
- xp in multiple *xp-pools*

Please note that there is no explicit user table. User data is distributed
over multiple other tables and aggregated on demand.

### Achievement

Achievements are the core object of the gamification service. Users strive to
collect achievements. Achievements can be thought of as badges, belts, or
whatever other representation of progress you can think of. To the gamification service,
however, these are all the same: achievements. Achievements usually define one
or multiple requirements to be granted, for example:

- the user reached 10 XP
- the user achieved the FooAchievement
- a FooEvent is received and the user has less than 42 XP

The same achievement can be granted multiple times to the same user, if desired.
Achievements can also be revoked after being granted. This can be used to
replace an easy to acquire FooSilver achievement with a harder to get FooGold
achievement.
Some achievements may be granted again even after being revoked, others may
not be granted again after being revoked.
The behaviour can be configured using the `maxAwarded` and `maxAwardedTotal`
configuration options, respectively.

### XP-Pool

The application may define multiple xp-pools. The default pool is called "XP"
and is always defined. Each user has a number of xp in each xp-pool. A new user has
0 xp in all xp-pools. XP may be incremented as well as decremented, but should
never go below 0. The different xp-pools may be used for purposes such as

- counting some form of e*xp*erience, as is commonly done in games
- representing some form of a currency the user can spend and earn
- counting the number of times something happened, i.e. a specific event was
  received. This counter can then be used in more complex achievement
  requirements.

### Level

Each user has a level. The user starts at level 1 and can never go below that.
The level is strictly tied to the user's main xp "XP". The required xp for each
level can be configured to either be linearly increasing, exponentially
increasing, or completely custom-defined. The level is not stored anywhere but
always calculated on the fly. If the user, for whatever reason, loses xp, their
level may also decrease.

## Workflow

This section describes the general concept of the gamification service in more
detail. The service is designed to be fully event-driven and integrate well with
RabbitMQ. It is thought to be integrated into your existing microservice
architecture. It listens to configurable events emitted by your other services.
These events are explicitly not gamification-specific. For example, normally,
your application wouldn't send a "Grant10XP". Instead, you should send events
like "ForumPost" or "UserSignup". You need to configure rules (see next section)
detailing what happens after a "ForumPost" or "UserSignup" event (e.g., giving
10 XP). Your existing services do not need to be aware of their events
being used for gamification purposes.

The gamification service subscribes to a RabbitMQ queue from which it processes
events. Whenever the service receives an event, it checks whether or not the
event is relevant to gamification. If yes, the service executes any
configured immediate actions, if there are any. Then, it checks all configured
achievement rules to see whether or not a new achievement should be granted to
the user. It is your job to setup the events to listen to, event actions and
achievement rules for your application as you see fit. Once an achievement or xp
are granted, they are persisted to MongoDB. It is planned to also send an event
back to RabbitMQ when an achievement or xp are granted.

The gamification service also provides a (mostly) read-only REST API, which can
be used to ask for a user's achievements, xp and level. In the future, the API
may also support more advanced use-cases like leaderboards. The API is
documented at `http://localhost:3030/docs`.

## Gamification Configuration

The gamification rules must be configured within the `config/gamification.yml`
file. This file is parsed on application start and must be adjusted to your
gamification use-case. The most basic configuration looks like this:

```yml
XPs: []
levels:
  type: linear
  interval: 100
events: {}
achievements: {}
```

Detailed configuration options follow. Please note that there currently is no
validation logic in place to check for errors. The application will likely
crash if you make an error in your configuration!

### XP-Pools

Define the different xp-pools there are within your application.
The "XP" xp-pool is always defined.

```yml
XPs:
  - money
  - myOtherXP
  - myXP
```

Note: The xp-pool names defined here are not currently validated by the
configuration parser, i.e. not specifying the available xp-pools or specifying
additional xp-pools does not raise an error currently. It is, however, planned
to validate the configuration more thoroughly, which would then raise an error
if you use an xp-pool not defined here.

### Levels

Define when to increase a user's level based on their XP. The level is
always purely based on the user's current XP. Each user, regardless of this
configuration, always starts at level 1. That means that the first
configuration value specifies when the user reaches level 2, not level 1.
There are three ways to configure levels:

```yml
levels:
  # Manual level steps: Level 2 will be reached at 10 XP, level 3 at 100 XP
  # and level 4 at 1000 XP.
  type: manual
  steps: [10,100,1000]
  # Linear level steps: The level is increased for every 100 XP, i.e. level 2
  # is reached at 100 XP, level 3 is reached at 200 XP, and so on.
  type: linear
  interval: 100
  # Exponential level steps: The XP required to reach the next level doubles
  # after every level. While the first level takes 100 XP, the next level will
  # take 200 XP, then 400 XP, and so on.
  type: exponential
  starting_value: 100
```

### Events

Define which events to listen to. All other events are ignored by the service.
Each key is an event name to listen to. The associated value describes
immediate actions to take when receiving the event.

You can use the `actions` array to specify actions to be executed as soon as the
event is received. See the "Achievement Rule `actions`" section further down for
more information.

```yml
events:
  # In its simplest form, an event name
  # can simply be followed by `: ~`, in which case no further immediate actions
  # are executed when receiving the event.
  MyEvent: ~
  # This is equivalent to
  MyEvent:
    actions: []
```

### Achievement Rules

```yml
# Define all available achievements. These definitions are called
# "achievement rules". Each key is the unique name of an achievement. The
# associated value describes further details related to this achievement.
achievements:
  # In its simplest, but useless form, an achievement looks like this:
  MyAchievement: ~
  # This is equivalent to the following configuration:
  MyAchievement:
    # List of requirements for the achievement.
    requirements: []
    # List of other achievement names to un-grant, should the user have them,
    # if the achievement is granted,
    replaces: []
    maxAwarded: 1
    maxAwardedTotal: 1
    actions: []
    hidden: false
    # Not yet implemented: scope
    scope: [user_id]
```

#### Achievement Rule `requirements`

The `requirements` key specifies all requirements that must be met for the
achievement to be granted to the user. Each requirement consists a single
top-level key denoting the type of the requirement. The corresponding value sets
further configuration options. By default, all requirements must be met for the
achievement to be granted. In addition, to the requirements defined here, the
`maxAwarded` and `maxAwardedTotal` options described below may also restrict
whether the achievement can be granted.

The supported four requirement types are detailed in the following sections.
Some of them support the `amount` setting. The `amount` can either be a number
`x`, which will be seen as `>= x`, or one of the following strings:

- `"== x"`: exactly `x`
- `"!= x"`: not exactly `x`
- `">= x"`: at least `x`
- `"> x"`: more than `x`
- `"<= x"`: at most `x`
- `"< x"`: less than `x`

##### `xp` Achievement Rule `requirements`

The `xp` requirement allows you to specify the amount of xp from one of the
xp-pools required for this achievement to be granted. You must specify the name
of the xp-pool as well as the amount needed. The following example is
fulfilled if the user has less than 42 XP:

```yml
- xp:
    name: XP
    amount: "< 42"
```

##### `achievement` Achievement Rule `requirements`

The `achievement` requirement allows you to specify other achievements required
for this achievement to be granted. You must specify the name of the other
achievement as well as the amount needed. The following example is fulfilled if
the user has two `MyAchievement` achievements:

```yml
- achievement:
    name: MyAchievement
    amount: 2
```

##### `AnyOf` Achievement Rule `requirements`

The `AnyOf` requirement allows you to specify an "OR" semantic between
requirements. The requirement's value is a list of child-requirements. The
requirement is fulfilled if any of the child-requirements is fulfilled. The
following example is fulfilled if the user has at least 10 yourXP or at least 20
XP:

```yml
- AnyOf:
  - xp:
    name: yourXP
    amount: 10
  - xp:
    name: XP
    amount: 20
```

##### `event` Achievement Rule `requirements`

The `event` requirement allows you to specify events that must have been
received in order for this achievement to be granted. You must specify the name
of the event as well as the amount needed. You can optionally also define
"conditions" on the received event. Here's a complex example showing the
behaviour:

```yml
- event:
  name: YourEventName
  amount: >= 10
  conditions:
    # Conditions can have two types: `parameter` and `AnyOf`. As with
    # requirements, conditions are using the AND semantic.
    - parameter: someParameter
      value: 100
    - AnyOf:
      - parameter: someOtherParameter
        value: 10
      - parameter: someOtherParameter2
        value: 100
      - AnyOf:
        - parameter: someOtherParameter3
          value: 10
        - parameter: someOtherParameter4
          value: 100
```

#### Achievement Rule `replaces`

The `replaces` key allows you to specify an array of other achievement names.
Should the user receiving the new achievement have one of the other achievements
specified in here, they are taken away from the user. This is useful for
multi-stage achievements where the best "gold" achievement replaces the "silver"
achievement.

#### Achievement Rule `maxAwarded` and `maxAwardedTotal`

These two settings configure how often the achievement can be granted to a user.
`maxAwarded` specifies how often a user can have the achievement at the same
time. `maxAwardedTotal` specifies how often a user can be granted the
achievement over time. Both of them are optional, however, if both are given,
make sure that `maxAwarded` is less or equal than `maxAwardedTotal`. If both
`maxAwarded` and `maxAwardedTotal` are not set, they default to 1. If only
`maxAwarded` is set, `maxAwardedTotal` defaults to positive infinity. If only
`maxAwardedTotal` is set, `maxAwarded` defaults to `maxAwardedTotal`.

#### Achievement Rule `actions`

You can use the `actions` array to specify actions to be executed whenever the
achievement is granted. Each action is an object with a single top-level key
denoting the action type. Currently, only the "xp" action is supported:

```yml
actions:
  - xp:
    # The name of the xp-pool
    name: myXP
    # The amount to add. You can also specify a negative amount here
    # to subtract xp.
    amount: 1
```

#### Achievement Rule `hidden`

This boolean describes whether or not the achievement is "public" and returned
when the /user endpoint is used. It defaults to `false`. This is useful for
achievements which are only used to represent state and should not be visible to
the user.

#### Achievement Rule `scope`

This is not yet implemented. It is thought to cover cases where the achievement
is granted in the scope of an entity, for example a course or classroom.

## Internals

This project uses [Feathers](http://feathersjs.com) as API framework and MongoDB
for storing data. Mongoose is used to validate the stored data.

### Feathers services

The gamification service is built using four Feathers services:

1. Achievements: The achievements service handles achievement data and stores
granted achievements in the `achivements` collection. Each row consists of the
`user_id`, the `name` (achievement name), `current_amount` (how often the user
currently has the achievement), `total_amount` (how often the user has received
the achievement) and `scope` (not yet implemented).

2. Events: The events service handles event data and stores all incoming events
in the `events` collection. Each row consists of the `user_id`, the `name`
(event name), and the `payload` (event payload).

3. XP: The xp-pool service handles xp-pool data and stores all granted xp in the
`xp` collection. Each row consists of the `user_id`, the `name` (xp-pool
name), and the `amount` (amount of xp the user has in this xp-pool).

4. User: The user service aggregates data from the other three services. It can
be used to retrieve gamification information for a single user. It is the only
service without its own collection. It is also responsible for calculating the
user's level.

## Development

### Local Development

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

### Docker Development

This project provides two `docker-compose` files, one meant for development and
one meant for production. The production `docker-compose.yml` configuration does
not contain definitions for the RabbitMQ service, because the gamification
service is thought to connect to an already existing RabbitMQ instance. The
development `docker-compose.dev.yml` file, however, also contains a simple
RabbitMQ definition to make development easier.

First run `npm install`. Then start the docker environment.

```
docker-compose -f docker-compose.dev.yml up
```

This starts the containers for the app, MongoDB and RabbitMQ.
The app is then available at http://localhost:3030/.

### RabbitMQ: Sending events manually

The RabbitMQ management interface is available at http://localhost:15672. In development mode, use Username `guest` and Password `guest` to login.

You can send events manually in the *Exchanges* section. Select the exchange and then publish your message at *Publish message*. Don't forget to insert the *routing key*.

### Testing

Run `npm test` to run all linters and tests. Use `npm coverage` to also generate
coverage.

## Running in Production

It is recommended to use `docker-compose` to run this microservice in
production. Execute `RABBITMQ_HOST=rabbit-host:5672 docker-compose up` in the
project's root directory to start the Node.js app and a MongoDB container. It is
your responsibility to start a separate RabbitMQ container and set the
`RABBITMQ_HOST` environment variable respectively. If you don't want to use the
RabbitMQ integration, simply omit the environment variable.

## License

Copyright (c) 2018 Kim-Pascal Borchart, Christian Flach, Corinna Jaschek,
Sebastian Kliem, Mandy Klingbeil, Marcus Konrad, Frederike Ramin.

Licensed under the [MIT license](LICENSE).
