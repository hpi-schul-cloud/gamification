/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const AmqpConnector = require('./amqp-connector.js');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

const amqpConnector = new AmqpConnector(app.get('rabbitmq'), app);
amqpConnector.connect().then(() => {
  amqpConnector.receiveFromQueue(app.get('rabbitQueue'));
});

server.on('listening', () => {
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
});
