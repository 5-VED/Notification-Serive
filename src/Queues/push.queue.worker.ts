// import logger from "../Config/Logger";
// import rabbitMQConsumer from "../Config/RabbitMQ/consumer";
// import rabbitMQProducer from "../Config/RabbitMQ/producer";

// interface PushQueueMessage {
//   deviceToken?: string;
//   title?: string;
//   body?: string;
//   data?: Record<string, any>;
//   traceId?: string;
// }

// export async function startPushQueueWorker(): Promise<void> {
//   await rabbitMQProducer.setupNotificationBindings();

//   await rabbitMQConsumer.consumeFromQueue(
//     "pushNotifications",
//     async (message: PushQueueMessage) => {
//       try {
//         // Placeholder: integrate with FCM/APNs/Expo to send push
//         logger.info(`Push notification to ${message.deviceToken}: ${message.title}`);
//       } catch (error) {
//         logger.error("Push worker failed to process message:", error);
//         throw error;
//       }
//     },
//     { noAck: false }
//   );
// }


