import logger from "../Logger";
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'test-group' });

const runConsumer = async (topic: string, partition: number, messages: {}) => {
  await consumer.connect();
  logger.info(`Connected to Kafka Consumer`);
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async (topic: string, partition: number, message: any) => {},
  });
};

export default runConsumer;
