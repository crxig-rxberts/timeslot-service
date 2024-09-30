# Timeslot Service

This service stores available timeslots for each service provider within the Bookit platform.

## Prerequisites

- Docker and Docker Compose installed.
- Ensure a `.env` file exists with the required environment variables.

## Environment Variables

- `AWS_ENDPOINT`: The endpoint for DynamoDB (default: `http://localhost:8000`)
- `AWS_REGION`: The AWS region to use (default: `local`)
- `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID (default: `dummy`)
- `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key (default: `dummy`)
- `PORT`: The port the service will run on (default: `3006`)

## Example `.env` file:

```
AWS_ENDPOINT=http://localhost:8000
AWS_REGION=local
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
PORT=3008
```

## Running Locally with Docker Compose

The service is dependent on DynamoDB, a local instance of Dynamo can be created using this docker-compose.yml
```
services:
dynamodb-local:
command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
image: "amazon/dynamodb-local:latest"
container_name: dynamodb-local
ports:
- "8000:8000"
volumes:
- "./docker/dynamodb:/home/dynamodblocal/data"
working_dir: /home/dynamodblocal
networks:
- bookit-network

networks:
bookit-network:
external: true
```
