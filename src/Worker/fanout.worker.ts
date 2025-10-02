import { Kafka } from 'kafkajs';
import logger from '../Config/Logger';
import { config } from '../Config/config';
import rabbitMQProducer from '../Config/RabbitMQ/producer';

interface FanoutPayload {
  eventType: string;
  channels?: Array<'email'>;
  email?: { to?: string; template?: string; variables?: Record<string, any>; subject?: string; html?: string };
  traceId?: string;
}

export async function startFanoutWorker(): Promise<void> {
  const brokers = String(config.kafka.brokers).split(',').map((b) => b.trim()).filter(Boolean);
  
  const clientId = process.env.KAFKA_CLIENT_ID || 'notification-service';
  const groupId = process.env.KAFKA_FANOUT_GROUP_ID || 'notification-fanout-group';
  const topic = process.env.KAFKA_TOPIC_FANOUT || 'notifications.email.welcome_email';

  const kafka = new Kafka({ clientId, brokers });
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await rabbitMQProducer.setupNotificationBindings();
  await consumer.run({
    eachMessage: async ({ message }) => {
      
      if (!message?.value) return;

      const raw: any = JSON.parse(message.value.toString());

      // If Auth-Service sent [email, otp], map it to the email worker shape
      if (Array.isArray(raw)) {
        const mapped = {
          eventType: "welcome_email",
          payload: raw,
        };
        await rabbitMQProducer.publishToExchange('notifications', 'notifications.email.' + "welcome_email", mapped);
        return;
      }

      const payload: FanoutPayload = raw as FanoutPayload;
      const channels = payload.channels && payload.channels.length ? payload.channels : ['email'];
      
      // Email fanout for structured payloads
      if (channels.includes('email')) {
        const emailMsg = payload.email || {};
        await rabbitMQProducer.publishToExchange('notifications', 'notifications.email.' + raw[0], {
          eventType: 'welcome_email',
          payload: [emailMsg.to, emailMsg?.variables?.otp],
        });
      }
    }
  });

  process.on('SIGINT', async () => {
    try { await consumer.disconnect(); } finally { process.exit(0); }
  });
}


