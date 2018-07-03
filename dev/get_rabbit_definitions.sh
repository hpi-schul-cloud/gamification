#! /bin/bash

# This loads RabbitMQ's default configuration for users, queries, exchanges 
# and bindings, so it can be used as template for an own configuration.
# assumes the container to be running already

docker-compose -f docker-compose.dev.yml exec rabbitmq rabbitmqadmin -q export rabbit.definitions.json
docker-compose -f docker-compose.dev.yml exec rabbitmq cat rabbit.definitions.json
