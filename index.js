const amqp = require('amqplib');

/**
 * @class Railcar
 */
class Railcar {
    constructor() {
        this.data;
        /** @type {Number} */
        this.format;
        this.created = new Date();
        this.secret;
        this.destination;
    }

    static formats = {
        STRING: 0,
        OBJECT: 1,
        NUMBER: 2
    }

    setData(data) {
        this.data = data;
        return this;
    }

    setCreated(created) {
        this.created = created;
        return this;
    }

    setDestination(destination) {
        this.destination = destination;
        return this;
    }

    setFormat(format) {
        this.format = format;
        return this;
    }

    setSecret(secret) {
        this.secret = secret;
        return this;
    }

    getData() {
        return this.data;
    }

    getCreated() {
        return this.created;
    }

    getDestination() {
        return this.destination;
    }

    getFormat() {
        return this.format;
    }

    getSecret() {
        return this.secret;
    }

    toString() {
        return JSON.stringify(this);
    }

    /**
     * Create a new Railcar from a JSON string
     * @param {String} string String to parse
     * @returns {railcar} New railcar
     */
    static fromString(string) {
        var obj = JSON.parse(string);
        var car = new Railcar();
        car.setData(obj.data);
        car.setCreated(obj.created);
        car.setDestination(obj.destination);
        car.setFormat(obj.format);
        car.setSecret(obj.secret);
        return car;
    }

}

/**
 * @class Trainyard 
 */
class Trainyard {
    constructor(host) {
        /** @type {String} */
        this.host = host;
        /** @type {amqp.Connection} */
        this.connection = null;
    }
    /**
     * Initiate Trainyard and establish connection to RabbitMQ
     * @param {*} host URL of message queue host
     * @returns Properties of host server
     */
    async connect() {
        this.connection = await amqp.connect(this.host);
        return this;
    }

    /**
     * Send message to queue
     * @param {String} queue Name of queue to send message to
     * @param {Railcar} message 
     */
    async send(message) {
        if (!message)
            return;
        const channel = await this.connection.createChannel();
        const channel_queue = await channel.assertQueue(message.destination, { durable: false });
        if (!(channel_queue.consumerCount > 0))
            throw new Error("No consumers for queue " + message.destination);
        channel.sendToQueue(message.destination, Buffer.from(message.toString()));
    }

    /**
     * Callback function for when a message is received
     * @callback alightCallback
     * @param {Railcar} message Received message
     */
    /**
     * Listen for messages on queue
     * @param {String} queue Name of queue to listen to
     * @param {alightCallback} callback Function to call when message is received
     */
    async alight(queue, callback) {
        const channel = await this.connection.createChannel();
        await channel.assertQueue(queue, { durable: false });
        channel.consume(queue, (message) => {
            channel.ack(message);
            callback(Railcar.fromString(message.content.toString()));
        });
    }

    async close() {
        await this.connection.close();
    }
}

module.exports = {
    Trainyard: Trainyard,
    Railcar: Railcar
};
