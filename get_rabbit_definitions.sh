#! /bin/bash

# assumes the container to be running already

docker exec -it gamification_rabbitmq_1 rabbitmqadmin -q export rabbit.definitions.json
docker exec -it gamification_rabbitmq_1 cat rabbit.definitions.json