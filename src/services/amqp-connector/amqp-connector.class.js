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
    amqp.connect('amqp://' + host).then((conn) => {
      return conn.createChannel().then((ch) => {
        var ok = ch.assertQueue(queue, {durable: true});
        return ok.then((_qok) => {
          ch.sendToQueue(queue, Buffer.from(message));
          return ch.close();
        });
      }).finally(() => {
        conn.close();
      });
    }).catch(console.warn);
  }

  async sendToExchange(host, exchange, routingKey, message) {
    amqp.connect('amqp://' + host).then((conn) => {
      return conn.createChannel().then((ch) => {
        var ok = ch.assertExchange(exchange, 'direct', {durable: true});
        return ok.then(() => {
          ch.publish(exchange, routingKey, Buffer.from(message));
          return ch.close();
        });
      }).finally(() => {
        conn.close();
      });
    }).catch(console.warn);
  }

  async receiveFromQueue(host, queue) {
    let that = this;
    amqp.connect('amqp://' + host).then((conn) => {
      process.once('SIGINT', () => {
        conn.close();
      });
      return conn.createChannel().then((ch) => {
        var ok = ch.assertQueue(queue, {durable: true});
        ok = ok.then((_qok) => {
          return ch.consume(queue, (msg) => {
            //console.log(JSON.parse(msg.content));
            that.app.service('events').create(JSON.parse(msg.content));
          }, {noAck: true});
        });
        return ok.then((_consumeOk) => {
        });
      });
    }).catch((error) => {
      console.group('rabbitmq');
      console.warn(error);
      console.log('reconnecting ...');
      console.groupEnd('rabbitmq');
      setTimeout(() => {
        this.receiveFromQueue(host, queue);
      }, 1000);
    });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
