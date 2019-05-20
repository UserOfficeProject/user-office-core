var amqp = require("amqplib");

export default class messageBroker {
  conn: any;

  constructor() {
    this.conn = amqp.connect("amqp://localhost");
  }

  sendMessage(msg: string) {
    this.conn
      .then((connection: any) => {
        return connection.createChannel();
      })
      .then((ch: any) => {
        ch.sendToQueue("hello", Buffer.from(msg));
      });
  }
}
