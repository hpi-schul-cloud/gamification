#! /bin/bash

# This loads RabbitMQ's default configuration for users, queries, exchanges 
# and bindings, so it can be used as template for an own configuration.
# assumes the container to be running already

docker exec -it gamification_rabbitmq_1 rabbitmqadmin -q export rabbit.definitions.json
docker exec -it gamification_rabbitmq_1 cat rabbit.definitions.json