import * as amqp from 'amqplib';
import logger from '../Logger';
import { config } from '../config';
import message from '../../Common/Constants/Messages';

class RabbitMQConnectin {
    public connection: any = null;
    public channel: any = null;
    public isConnected: boolean = false;

    async connect(): Promise<any> {
        try {
            if (!config.rabbitmq.url) {
                throw new Error(message.RABBITMQ_URL_NOT_CONFIGURED);
            }

            this.connection = await amqp.connect(config.rabbitmq.url);
            
            this.channel = await this.connection.createChannel();

            this.isConnected = true;

            // Handle connection close
            this.connection.on('close', () => {
                logger.warn(message.RABBITMQ_CONNECTION_CLOSED);
                this.isConnected = false;
            });

            // Handle connection errors
            this.connection.on('error', (error: any) => {
                logger.error(message.RABBITMQ_CONNECTION_ERROR, error);
                this.isConnected = false;
            });
            logger.info(message.RABBITMQ_CONNECTED_PRODUCER);
            return this.channel;
        } catch (error) {
            logger.error(message.RABBITMQ_CONNECTION_FAILED, error);
            throw error;
        }
    }

    public async ensureConnection(): Promise<void> {
        if (!this.isConnected || !this.channel) {
            await this.connect();
        }
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            this.isConnected = false;
            logger.info(message.RABBITMQ_PRODUCER_CONNECTION_CLOSED);
        } catch (error) {
            logger.error(message.RABBITMQ_ERROR_CLOSING_CONNECTION, error);
            throw error;
        }
    }
}


export default RabbitMQConnectin;
