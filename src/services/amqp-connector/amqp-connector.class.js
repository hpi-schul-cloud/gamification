/* eslint-disable no-unused-vars */
const amqp = require('amqplib');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  setup(app) {
    this.app = app;
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    return {};
  }

  async create(data, params) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
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

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
