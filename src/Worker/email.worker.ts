import { Kafka } from "kafkajs"
import { config } from "../Config/config"
import { Orchestrator } from "../Orchestrator/orchestrator.service"

const brokers = String(config.kafka.brokers).split(',').map((b) => b.trim()).filter(Boolean)
const clientId = process.env.KAFKA_CLIENT_ID || "notification-service"
const groupId = process.env.KAFKA_EMAIL_GROUP_ID || "notification-email-group"
const topicOtp = process.env.KAFKA_TOPIC_EMAIL_OTP || "notifications.email.otp"

const kafka = new Kafka({ clientId, brokers })
const consumer = kafka.consumer({ groupId })

export async function startEmailWorker(): Promise<void> {
  await consumer.connect()
  await consumer.subscribe({ topic: topicOtp, fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message?.value) return
      const payload = JSON.parse(message.value.toString())
      await Orchestrator.handleEmailEvent("otp_email", payload)
    },
  })
}

process.on('SIGINT', async () => {
  try { await consumer.disconnect() } finally { process.exit(0) }
})
