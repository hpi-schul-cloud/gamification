/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const AmqpConnector = require('./amqp-connector.js');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

let amqpConnector = AmqpConnector(app);
amqpConnector.receiveFromQueue(app.get('rabbitmq'), app.get('rabbitQueue'));

server.on('listening', () => {
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
});
