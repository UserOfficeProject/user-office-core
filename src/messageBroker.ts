import amqp, { Connection, Channel, MessageProperties } from 'amqplib';

export enum Queue {
  PROPOSAL = 'PROPOSAL',
}

export type ConsumerCallback = (
  type: string,
  message: object,
  properties: MessageProperties
) => Promise<void>;

export interface MessageBroker {
  sendMessage(queue: Queue, type: string, message: string): Promise<void>;
  listenOn(queue: Queue, cb: ConsumerCallback): Promise<void>;
}

export class RabbitMQMessageBroker implements MessageBroker {
  private consumers: Array<[Queue, ConsumerCallback]> = [];
  private conn: Connection | null = null;
  private ch: Channel | null = null;

  constructor() {
    this.setup();
  }

  async listenOn(queue: Queue, cb: ConsumerCallback) {
    this.consumers.push([queue, cb]);

    if (this.ch) {
      this.registerConsumers();
    }
  }

  async sendMessage(queue: Queue, type: string, msg: string) {
    if (!this.ch) {
      return;
    }

    try {
      await this.assertQueue(queue);
      const writeable = this.ch.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
        timestamp: Date.now(),
        type: type,
      });

      // TODO: handle false result (queue up messages and listen for `drain` event)
      if (!writeable) {
        throw new Error('not writeable, not implemented yet');
      }
    } catch (err) {
      console.error('sending message failed at some point', err);
    }
  }

  private async setup() {
    try {
      console.log('RabbitMQMessageBroker: Connecting...');

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.conn = await amqp.connect(process.env.RABBITMQ_URL!);

      console.log('RabbitMQMessageBroker: Connected');

      this.conn.on('error', err => {
        console.error('RabbitMQMessageBroker: Connection error', err);
      });

      this.conn.on('close', () => {
        console.warn('RabbitMQMessageBroker: Connection closed');
        this.conn = null;
        this.ch = null;

        this.scheduleReconnect();
      });

      await this.registerChannel();

      await this.registerConsumers();

      console.log('RabbitMQMessageBroker: Setup finished');
    } catch (e) {
      console.error('RabbitMQMessageBroker: Setup failed:', e.message);

      // if we already have a connection but failed to register channel
      // close the channel and restart the process
      if (this.conn) {
        await this.conn
          .close()
          .catch(() =>
            console.error(
              'RabbitMQMessageBroker: failed to close connection in try-catch'
            )
          );
        this.conn = null;
      }

      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    console.log('RabbitMQMessageBroker: Trying to reconnecting after 5 sec');

    setTimeout(() => this.setup(), 5000);
  }

  private async registerChannel() {
    if (!this.conn || this.ch) {
      return;
    }

    console.log('RabbitMQMessageBroker: Creating channel...');

    this.ch = await this.conn.createChannel();

    console.log('RabbitMQMessageBroker: Channel created');

    this.ch.on('error', err => {
      console.error('RabbitMQMessageBroker: Channel error', err);
    });

    this.ch.on('close', () => {
      console.warn('RabbitMQMessageBroker: Channel closed');
      this.ch = null;

      this.scheduleChannelCreation();
    });
  }

  private scheduleChannelCreation() {
    console.log(
      'RabbitMQMessageBroker: Trying to recreate a channel after 5 sec'
    );

    setTimeout(() => this.registerChannel(), 5000);
  }

  private async registerConsumers() {
    if (!this.ch) {
      return;
    }

    try {
      console.log(
        `RabbitMQMessageBroker: Registering consumers (${this.consumers.length})`
      );

      const consumers = this.consumers;
      this.consumers = [];

      for (const [queue, cb] of consumers) {
        await this.assertQueue(queue);

        await this.ch.consume(
          queue,
          msg => {
            // is this even possible???
            if (!msg) {
              return;
            }

            const stringifiedContent = msg.content.toString();
            let content: object = {};

            try {
              content = JSON.parse(stringifiedContent);
            } catch (err) {
              console.error(
                'RabbitMQMessageBroker: Failed to parse the message content',
                { content: stringifiedContent }
              );

              return;
            }

            cb(msg.properties.type, content, msg.properties)
              .then(() => {
                /**
                 * NOTE:
                 * `this.ch` can be null when something goes down while processing an event.
                 * If a channel with not acknowledged message is closed
                 * the event gets back to the queue.
                 * Even if we establish a channel while processing the event
                 * RabbitMQ won't accept the ack request
                 *
                 * See: https://www.rabbitmq.com/confirms.html
                 * Acknowledgement must be sent on the same channel that received the delivery.
                 * Attempts to acknowledge using a different channel will result in a channel-level
                 * protocol exception. See the doc guide on confirmations to learn more.
                 *
                 * TODO: maybe try to handle it gracefully and handle duplicate
                 * event processing in the listener
                 *
                 */
                this.ch?.ack(msg);
              })
              .catch(err => {
                console.error(
                  'RabbitMQMessageBroker: Registered consumer failed',
                  queue,
                  { ...msg, content },
                  err
                );
                /***
                 * Same situation we have above
                 * TODO: maybe try handle gracefully
                 *
                 * NOTE: not acknowledged events go to a dead letter queue
                 */
                this.ch?.nack(msg, false, false);
              });
          },
          { noAck: false }
        );
      }

      console.log('RabbitMQMessageBroker: Consumers registered');
    } catch (err) {
      console.error('RabbitMQMessageBroker: Failed to register consumer', err);
    }
  }

  private async assertQueue(queue: Queue) {
    if (!this.ch) {
      return;
    }

    const deadLetterQueue = `DL__${queue}`;
    const deadLetterExchange = `DLX__${queue}`;

    await this.ch.assertExchange(deadLetterExchange, 'fanout', {
      durable: true,
    });
    await this.ch.assertQueue(deadLetterQueue, { durable: true });
    await this.ch.bindQueue(deadLetterQueue, deadLetterExchange, '');
    await this.ch.assertQueue(queue, {
      deadLetterExchange: deadLetterExchange,
      durable: true,
    });
  }
}
