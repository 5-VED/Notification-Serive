import rabbitMQProducer from './producer';
import rabbitMQConsumer from './consumer';
import messages from '../../Common/Constants/Messages';

/**
 * Example usage of RabbitMQ Producer and Consumer
 * This file demonstrates how to use the RabbitMQ producer and consumer
 */

// Example: Publishing a notification
export async function publishNotificationExample() {
    try {
        const notificationData = {
            userId: 'user123',
            type: 'email' as const,
            subject: 'Welcome to our service!',
            content: 'Thank you for joining us. We are excited to have you on board.',
            metadata: {
                templateId: 'welcome-email',
                priority: 'high'
            }
        };

        const success = await rabbitMQProducer.publishNotification(notificationData, 8);
        
        if (success) {
            console.log(messages.SUCCESS);
        } else {
            console.log(messages.FAILED);
        }
    } catch (error) {
        console.error('Error publishing notification:', error);
    }
}

// Example: Publishing a user event
export async function publishUserEventExample() {
    try {
        const userData = {
            id: 'user123',
            email: 'user@example.com',
            name: 'John Doe',
            createdAt: new Date().toISOString()
        };

        const success = await rabbitMQProducer.publishUserEvent('user.created', userData, {
            source: 'auth-service',
            version: '1.0'
        });
        
        if (success) {
            console.log(messages.SUCCESS);
        } else {
            console.log(messages.FAILED);
        }
    } catch (error) {
        console.error('Error publishing user event:', error);
    }
}

// Example: Publishing a custom message to a queue
export async function publishCustomMessageExample() {
    try {
        const customMessage = {
            type: 'data-processing',
            data: {
                fileId: 'file123',
                fileName: 'data.csv',
                size: 1024000
            },
            timestamp: new Date().toISOString()
        };

        const success = await rabbitMQProducer.publishToQueue('data-processing', customMessage, {
            priority: 5,
            persistent: true
        });
        
        if (success) {
            console.log(messages.SUCCESS);
        } else {
            console.log(messages.FAILED);
        }
    } catch (error) {
        console.error('Error publishing custom message:', error);
    }
}

// Example: Publishing a message to an exchange
export async function publishToExchangeExample() {
    try {
        const message = {
            service: 'notification-service',
            action: 'send-email',
            data: {
                to: 'user@example.com',
                subject: 'Test Email',
                body: 'This is a test email'
            }
        };

        const success = await rabbitMQProducer.publishToExchange(
            'service.events',
            'notification.email.send',
            message
        );
        
        if (success) {
            console.log(messages.SUCCESS);
        } else {
            console.log(messages.FAILED);
        }
    } catch (error) {
        console.error('Error publishing to exchange:', error);
    }
}

// Example: Consuming messages from a queue
export async function consumeNotificationsExample() {
    try {
        await rabbitMQConsumer.consumeFromQueue('notifications', async (message) => {
            console.log('Processing notification:', message);
            
            // Process the notification based on type
            switch (message.type) {
                case 'email':
                    console.log(`Sending email to ${message.userId}: ${message.subject}`);
                    // Add email sending logic here
                    break;
                case 'sms':
                    console.log(`Sending SMS to ${message.userId}: ${message.content}`);
                    // Add SMS sending logic here
                    break;
                case 'push':
                    console.log(`Sending push notification to ${message.userId}: ${message.content}`);
                    // Add push notification logic here
                    break;
                default:
                    console.log(`Unknown notification type: ${message.type}`);
            }
        });
    } catch (error) {
        console.error('Error consuming notifications:', error);
    }
}

// Example: Consuming user events from an exchange
export async function consumeUserEventsExample() {
    try {
        await rabbitMQConsumer.consumeFromExchange('user.events', 'user.*', async (message) => {
            console.log('Processing user event:', message);
            
            // Process the user event based on type
            switch (message.eventType) {
                case 'user.created':
                    console.log(`New user created: ${message.userData.email}`);
                    // Add user creation logic here
                    break;
                case 'user.updated':
                    console.log(`User updated: ${message.userData.email}`);
                    // Add user update logic here
                    break;
                case 'user.deleted':
                    console.log(`User deleted: ${message.userData.email}`);
                    // Add user deletion logic here
                    break;
                case 'user.login':
                    console.log(`User logged in: ${message.userData.email}`);
                    // Add login logic here
                    break;
                default:
                    console.log(`Unknown user event type: ${message.eventType}`);
            }
        });
    } catch (error) {
        console.error('Error consuming user events:', error);
    }
}

// Example: Graceful shutdown
export async function gracefulShutdown() {
    try {
        console.log('Shutting down RabbitMQ connections...');
        await rabbitMQProducer.close();
        await rabbitMQConsumer.close();
        console.log('RabbitMQ connections closed successfully');
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
}

// Example: Check connection status
export function checkConnectionStatus() {
    const producerStatus = rabbitMQProducer.getConnectionStatus();
    const consumerStatus = rabbitMQConsumer.getConnectionStatus();
    
    console.log(`Producer connected: ${producerStatus}`);
    console.log(`Consumer connected: ${consumerStatus}`);
    
    return { producer: producerStatus, consumer: consumerStatus };
}
