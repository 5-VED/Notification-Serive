import logger from "../Config/Logger";
import rabbitMQConsumer from "../Config/RabbitMQ/consumer";
import rabbitMQProducer from "../Config/RabbitMQ/producer";
import { Orchestrator } from "../Orchestrator/orchestrator.service";
import { TemplateService } from "../Templates/templates";
import { EmailAdapter } from "../Channels/email.adapter";

type EmailEventType = "otp_email" | "login_notification" | "welcome_email";

interface EmailQueueMessage {
  eventType?: EmailEventType;
  payload?: any;
  template?: string;
  variables?: Record<string, any>;
  to?: string;
  subject?: string;
  html?: string;
  traceId?: string;
  dedupeKey?: string;
}

export async function startEmailQueueWorker(): Promise<void> {
  await rabbitMQProducer.setupNotificationBindings();

  await rabbitMQConsumer.consumeFromQueue(  
    "emailNotifications",
    async (message: EmailQueueMessage) => {
      try {
        if (message.eventType) {
          await Orchestrator.handleEmailEvent(message.eventType, message.payload);
          return;
        }
        if (message.template && message.to) {
          const { subject, html } = await TemplateService.renderEmail(message.template, message.variables || {});
          await EmailAdapter.send(message.to, subject, html);
          return;
        }
        if (message.to && message.subject && message.html) {
          await EmailAdapter.send(message.to, message.subject, message.html);
          return;
        }
        logger.warn("Email message missing required fields; skipping.");
      } catch (error) {
        logger.error("Email worker failed to process message:", error);
        throw error;
      }
    },
    { noAck: false }
  );
}


