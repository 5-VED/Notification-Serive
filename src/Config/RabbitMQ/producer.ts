import logger from '../Logger';
import RabbitMQConnectin from './connection';

class RabbitMQProducer extends RabbitMQConnectin {

    constructor() {
        super();
    }

    /**
     * Ensure exchanges, queues, and DLQ bindings exist
     */
    async setupNotificationBindings(): Promise<void> {
        try {

            console.log('setupNotificationBindings -------------->');
            await this.ensureConnection();

            const channel = await this.connect();
            console.log('channel 1 -------------->');

            if (!channel) {
                throw new Error("RabbitMQ channel not available");
            }            

            const mainExchange = 'notifications';
            const dlqExchange = 'notifications.dlq';

            const emailQueue = 'emailNotifications';

            const emailDlq = 'emailNotifications.dlq';

            // Exchanges
            await Promise.all(
                [
                    channel.assertExchange(mainExchange, 'topic', { durable: true }),
                    channel.assertExchange(dlqExchange, 'topic', { durable: true })
                ]
            )
            
            // Queues
            await Promise.all(
                [
                    channel.assertQueue(emailDlq, { durable: true }),
                    channel.assertQueue(emailQueue, {
                        durable: true,
                        arguments: {
                            'x-dead-letter-exchange': dlqExchange,
                            'x-dead-letter-routing-key': 'dlq.email',
                        }
                    })
                ]
            )

            await Promise.all(
                [
                    channel.bindQueue(emailQueue, mainExchange, 'notifications.email.*'),
                    channel.bindQueue(emailDlq, dlqExchange, 'dlq.email')
                ]
            )

            logger.info('RabbitMQ topology asserted: exchanges, queues, and DLQs');
        } catch (error) {
            logger.error('RabbitMQ error setting up topology:', error);
            throw error;
        }
    }

    /**
     * Publish message to a queue
     * @param queueName - Name of the queue
     * @param message - @Message to publish
     * @param options - Publishing options
     */
    async publishToQueue(
        queueName: string,
        message: any,
        options: any = {}
    ): Promise<boolean> {
        try {
            await this.ensureConnection();

            if (!this.channel) {
                throw new Error("RabbitMQ channel not available");
            }

            // Assert queue exists
            await this.channel.assertQueue(queueName, {
                durable: true,
            });

            // Convert message to buffer
            const messageBuffer = Buffer.from(JSON.stringify(message));

            // Publish message
            const published = this.channel.sendToQueue(queueName, messageBuffer, {
                persistent: true,
                ...options,
            });

            if (published) {
                logger.info(`RabbitMQ message published to queue: ${queueName}`);
                return true;
            } else {
                logger.warn(`RabbitMQ message publish failed to queue: ${queueName}`);
                return false;
            }
        } catch (error) {
            logger.error(`RabbitMQ error publishing to queue: ${queueName}:`, error);
            throw error;
        }
    }

    /**
     * Publish message to an exchange
     * @param exchangeName - Name of the exchange
     * @param routingKey - Routing key for the message
     * @param message - Message to publish
     * @param options - Publishing options
     */
    async publishToExchange(
        exchangeName: string,
        routingKey: string,
        message: any,
        options: any = {}
    ): Promise<boolean> {
        try {
            await this.ensureConnection();
            const channel = await this.connect();
            if (!channel) {
                throw new Error("RabbitMQ channel not available");
            }

            // Assert exchange exists
            await channel.assertExchange(exchangeName, 'topic', {
                durable: true,
            });

            // Convert message to buffer
            const messageBuffer = Buffer.from(JSON.stringify(message));

            // Publish message
            const published = channel.publish(exchangeName, routingKey, messageBuffer, {
                persistent: true,
                ...options,
            });

            if (published) {
                logger.info(`RabbitMQ message published to exchange: ${exchangeName} with routing key: ${routingKey}`);
                return true;
            } else {
                logger.warn(`RabbitMQ message publish failed to exchange: ${exchangeName}`);
                return false;
            }
        } catch (error) {
            logger.error(`RabbitMQ error publishing to exchange: ${exchangeName}:`, error);
            throw error;
        }
    }

    /**
     * Publish notification message (specific to notification service)
     * @param notificationData - Notification data to publish
     * @param priority - Priority level (1-10, higher is more important)
     */
    async publishNotification(
        notificationData: {
            userId: string;
            type: 'email';
            subject?: string;
            content: string;
            metadata?: any;
        },
        priority: number = 5
    ): Promise<boolean> {
        const message = {
            ...notificationData,
            timestamp: new Date().toISOString(),
            priority,
        };

        return this.publishToQueue('notifications', message, {
            priority: Math.min(Math.max(priority, 1), 10), // Ensure priority is between 1-10
        });
    }

    /**
     * Publish user event (for fanout to multiple services)
     * @param eventType - Type of user event
     * @param userData - User data
     * @param metadata - Additional metadata
     */
    async publishUserEvent(
        eventType: 'user.created' | 'user.updated' | 'user.deleted' | 'user.login',
        userData: any,
        metadata?: any
    ): Promise<boolean> {
        const message = {
            eventType,
            userData,
            metadata,
            timestamp: new Date().toISOString(),
        };

        return this.publishToExchange('user.events', eventType, message);
    }
}

const rabbitMQProducer = new RabbitMQProducer();

export default rabbitMQProducer;
