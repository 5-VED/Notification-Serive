import logger from '../Logger';
import message from '../../Common/Constants/Messages';
import RabbitMQConnectin from './connection';

class RabbitMQConsumer extends RabbitMQConnectin {
    /**
     * Consume messages from a queue
     * @param queueName - Name of the queue to consume from
     * @param messageHandler - Function to handle incoming messages
     * @param options - Consumer options
     */
    async consumeFromQueue(
        queueName: string,
        messageHandler: (message: any) => Promise<void>,
        options: any = {}
    ): Promise<void> {
        try {
            // await this.ensureConnection();
            const channel = await this.connect();

            if (!channel) {
                throw new Error(message.RABBITMQ_CHANNEL_NOT_AVAILABLE);
            }
            console.log('consumeFromQueue  1 -------------->');

            // Ensure queue exists without redefining its arguments (avoids PRECONDITION_FAILED)
            await channel.checkQueue(queueName);
            console.log('consumeFromQueue  2 -------------->');
            
            // Set prefetch count to process one message at a time
            await channel.prefetch(1);
            
            console.log('consumeFromQueue  3 -------------->');
            
            // Start consuming
            await channel.consume(queueName, async (msg: any) => {
                console.log('msg -------------->', msg);
                if (msg) {
                    try {
                        const messageContent = JSON.parse(msg.content.toString());
                        console.log('messageContent -------------->', messageContent);
                        logger.info(`${message.RABBITMQ_MSG_RECEIVED_QUEUE} ${queueName}`);

                        // Process the message
                        await messageHandler(messageContent);

                        // Acknowledge the message
                        this.channel.ack(msg);
                        logger.info(`${message.RABBITMQ_MSG_ACKNOWLEDGED_QUEUE} ${queueName}`);
                    } catch (error) {
                        logger.error(`${message.RABBITMQ_ERROR_PROCESSING_QUEUE} ${queueName}:`, error);
                        // Reject the message and requeue it
                        this.channel.nack(msg, false, true);
                    }
                }
            }, {
                noAck: false, // Manual acknowledgment
                ...options,
            });

            logger.info(`${message.RABBITMQ_STARTED_CONSUMING_QUEUE} ${queueName}`);
        } catch (error) {
            logger.error(`${message.RABBITMQ_ERROR_CONSUMING_QUEUE} ${queueName}:`, error);
            throw error;
        }
    }

    /**
     * Consume messages from an exchange
     * @param exchangeName - Name of the exchange
     * @param routingKey - Routing key pattern
     * @param messageHandler - Function to handle incoming messages
     * @param options - Consumer options
     */
    async consumeFromExchange(
        exchangeName: string,
        routingKey: string,
        messageHandler: (message: any) => Promise<void>,
        options: any = {}
    ): Promise<void> {
        try {
            await this.ensureConnection();

            if (!this.channel) {
                throw new Error(message.RABBITMQ_CHANNEL_NOT_AVAILABLE);
            }

            // Assert exchange exists
            await this.channel.assertExchange(exchangeName, 'topic', {
                durable: true,
            });

            // Create a temporary queue
            const queueResult = await this.channel.assertQueue('', {
                exclusive: true,
            });
            const queueName = queueResult.queue;

            //Bind queue to exchange with routing key
            await this.channel.bindQueue(queueName, exchangeName, routingKey);

            // Set prefetch count
            await this.channel.prefetch(1);

            // Start consuming
            await this.channel.consume(queueName, async (msg: any) => {
                if (msg) {
                    try {
                        const messageContent = JSON.parse(msg.content.toString());
                        logger.info(`${message.RABBITMQ_MSG_RECEIVED_EXCHANGE} ${exchangeName} with routing key: ${routingKey}`);

                        // Process the message
                        await messageHandler(messageContent);

                        // Acknowledge the message
                        this.channel.ack(msg);
                        logger.info(`${message.RABBITMQ_MSG_ACKNOWLEDGED_EXCHANGE} ${exchangeName}`);
                    } catch (error) {
                        logger.error(`${message.RABBITMQ_ERROR_PROCESSING_EXCHANGE} ${exchangeName}:`, error);
                        // Reject the message and requeue it
                        this.channel.nack(msg, false, true);
                    }
                }
            }, {
                noAck: false,
                ...options,
            });

            logger.info(`${message.RABBITMQ_STARTED_CONSUMING_EXCHANGE} ${exchangeName} with routing key: ${routingKey}`);
        } catch (error) {
            logger.error(`${message.RABBITMQ_ERROR_CONSUMING_EXCHANGE} ${exchangeName}:`, error);
            throw error;
        }
    }
}

const rabbitMQConsumer = new RabbitMQConsumer();
export default rabbitMQConsumer;
