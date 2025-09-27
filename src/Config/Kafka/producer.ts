import logger from "../Logger";

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'bridge',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const runProducer = async (topic:string,message:[]) => {
    await producer.connect()
    logger.info("Connected to kafka producer")
    await producer.send({
        topic,
        messages: [{value: JSON.stringify(message)}],
    })
}

export default runProducer;