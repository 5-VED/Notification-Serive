import { connect } from 'mongoose';
import logger from '../Config/Logger';
import { config } from '../Config/config';

const connectMongoDB = async () => {
    try {
        const uri: string = config.database.mongo.uri as string;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in the configuration');
        }
        await connect(uri);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectMongoDB;
