import logger from "../Logger";

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'test-group' });

const runConsumer = async (topic: string, partition: number, messages: {}) => {
  await consumer.connect();
  logger.info(`Connected to Kafka Consumer`);
  await consumer.subscribe({ topic: 'user.opt.send', fromBeginning: true });

  await consumer.run({
    eachMessage: async (topic: string, partition: number, message: any) => {
      console.log({
        key: message.key?.toString(),
        value: message.value.toString(),
        partition,
      });
    },
  });
};

export default runConsumer;
