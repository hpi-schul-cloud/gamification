const amqp = require('amqplib');
class AmqpConnector {
  constructor(host, app) {
    this.host = host;
    this.app = app;
  }

  async connect() {
    try {
      this.connection = await amqp.connect('amqp://' + this.host);
      console.info('RabbitMQ connected');
      process.once('SIGINT', () => {
        this.connection.close();
      });
      this.channel = await this.connection.createChannel();
      console.info('RabbitMQ channel ready');
    } catch (error) {
      console.warn(error);
      console.log('RabbitMQ connection failed. Reconnecting in 1 s ...');
      setTimeout(() => {
        this.connect();
      }, 1000);
    }
  }

  async sendToQueue(queue, message) {
    try {
      await this.channel.assertQueue(queue, {
        durable: true
      });
      await this.channel.sendToQueue(queue, Buffer.from(message));
    } catch (error) {
      console.warn(error);
    }
  }

  async sendToExchange(exchange, routingKey, message) {
    try {
      await this.channel.assertExchange(exchange, 'direct', {
        durable: true
      });
      await this.channel.publish(exchange, routingKey, Buffer.from(message));
    } catch (error) {
      console.warn(error);
    }
  }

  async receiveFromQueue(queue) {
    try {
      await this.channel.assertQueue(queue, {
        durable: true
      });
      this.channel.consume(queue,
        (msg) => {
          this.app.service('events').create(JSON.parse(msg.content));
        }, {
          noAck: true
        }
      );
    } catch (error) {
      console.warn(error);
    }
  }
}

module.exports = AmqpConnector;
