const amqp = require('amqplib');
class AmqpConnector {
  constructor(host, app) {
    this.host = host;
    this.app = app;
  }

  async connect() {
    try {
      this.connection = await amqp.connect('amqp://' + this.host);
      console.group('RabbitMQ');
      console.info('connected');
      process.once('SIGINT', () => {
        this.connection.close();
      });
      this.channel = await this.connection.createChannel();
      console.info('channel ready');
      console.groupEnd('rabbitmq');
    } catch (error) {
      console.group('RabbitMQ');
      console.warn(error);
      console.log('reconnecting ...');
      console.groupEnd('rabbitmq');
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
      this.channel.close();
      this.connection.close();
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
      this.channel.close();
      this.connection.close();
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
          console.log(msg.content);
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
