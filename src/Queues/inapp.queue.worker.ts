// import logger from "../Config/Logger";
// import rabbitMQConsumer from "../Config/RabbitMQ/consumer";
// import rabbitMQProducer from "../Config/RabbitMQ/producer";

// interface InAppQueueMessage {
//   userId?: string;
//   type?: string;
//   title?: string;
//   body?: string;
//   metadata?: Record<string, any>;
//   traceId?: string;
// }

// export async function startInAppQueueWorker(): Promise<void> {
//   await rabbitMQProducer.setupNotificationBindings();

//   await rabbitMQConsumer.consumeFromQueue(
//     "inAppNotifications",
//     async (message: InAppQueueMessage) => {
//       try {
//         // Placeholder: persist the in-app notification to DB/Redis, etc.
//         logger.info(`InApp notification for user ${message.userId}: ${message.title || message.type}`);
//       } catch (error) {
//         logger.error("InApp worker failed to process message:", error);
//         throw error;
//       }
//     },
//     { noAck: false }
//   );
// }


