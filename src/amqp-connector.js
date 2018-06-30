const amqp = require('amqplib');
class AmqpConnector {
  constructor(app) {
    this.app = app;
  }

  async sendToQueue(host, queue, message) {
    try {
      let conn = await amqp.connect('amqp://' + host);
      console.info('RabbitMQ connected');
      let ch = await conn.createChannel();
      await ch.assertQueue(queue, {durable: true});
      await ch.sendToQueue(queue, Buffer.from(message));
      ch.close();
      conn.close();
    } catch(error) {
      console.warn(error);
    }
  }

  async sendToExchange(host, exchange, routingKey, message) {
    try {
      let conn = await amqp.connect('amqp://' + host);
      console.info('RabbitMQ connected');
      let ch = await conn.createChannel();
      await ch.assertExchange(exchange, 'direct', {durable: true});
      await ch.publish(exchange, routingKey, Buffer.from(message));
      ch.close();
      conn.close();
    } catch(error) {
      console.warn(error);
    }
  }

  async receiveFromQueue(host, queue) {
    try {
      let conn = await amqp.connect('amqp://' + host);
      console.info('RabbitMQ connected');
      process.once('SIGINT', () => {
        conn.close();
      });
      let ch = await conn.createChannel();
      await ch.assertQueue(queue, {durable: true});
      ch.consume(queue,
        (msg) => {
          this.app.service('events').create(JSON.parse(msg.content));
        },
        {noAck: true}
      );
    } catch(error) {
      console.group('rabbitmq');
      console.warn(error);
      console.log('reconnecting ...');
      console.groupEnd('rabbitmq');
      setTimeout(() => {
        this.receiveFromQueue(host, queue);
      }, 1000);
    }
  }
}

module.exports = function (app) {
  return new AmqpConnector(app);
};

module.exports.AmqpConnector = AmqpConnector;
