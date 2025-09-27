import { Kafka } from 'kafkajs';
import logger from '../Config/Logger';
import { config } from '../Config/config';
import rabbitMQProducer from '../Config/RabbitMQ/producer';

interface FanoutPayload {
  eventType: string; // e.g., 'user.created'
  channels?: Array<'email'>; // if omitted, default to all
  email?: { to?: string; template?: string; variables?: Record<string, any>; subject?: string; html?: string };
  traceId?: string;
}

export async function startFanoutWorker(): Promise<void> {
  console.log('startFanoutWorker -------------->');
  const brokers = String(config.kafka.brokers).split(',').map((b) => b.trim()).filter(Boolean);
  const clientId = process.env.KAFKA_CLIENT_ID || 'notification-service';
  const groupId = process.env.KAFKA_FANOUT_GROUP_ID || 'notification-fanout-group';
  const topic = process.env.KAFKA_TOPIC_FANOUT || 'notifications.email.otp';

  console.log('topic -------------->', topic);
  console.log('brokers -------------->', brokers);
  console.log('clientId -------------->', clientId);
  console.log('groupId -------------->', groupId);


  const kafka = new Kafka({ clientId, brokers });
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

await rabbitMQProducer.setupNotificationBindings();
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log('eachMessage -------------->', message);
      if (!message?.value) return;

      const raw: any = JSON.parse(message.value.toString());
      console.log('payload -------------->', raw);

      // If Auth-Service sent [email, otp], map it to the email worker shape
      if (Array.isArray(raw)) {
        const mapped = {
          eventType: 'otp_email',
          payload: raw,
        };
        await rabbitMQProducer.publishToExchange('notifications', 'notifications.email.otp', mapped);
        return;
      }

      const payload: FanoutPayload = raw as FanoutPayload;
      const channels = payload.channels && payload.channels.length ? payload.channels : ['email'];
      console.log('channels -------------->', channels);

      // Email fanout for structured payloads
      if (channels.includes('email')) {
        const emailMsg = payload.email || {};
        console.log('emailMsg -------------->', emailMsg);
        await rabbitMQProducer.publishToExchange('notifications', 'notifications.email.otp', {
          eventType: 'otp_email',
          payload: [emailMsg.to, emailMsg?.variables?.otp],
        });
      }
    }
  });

  process.on('SIGINT', async () => {
    try { await consumer.disconnect(); } finally { process.exit(0); }
  });
}


