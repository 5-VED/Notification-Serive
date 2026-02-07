import { IConfig } from '../Common/interfaces/IConfig';
import dotenv from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
// Load environment variables from the .env file (optional in containers)
const envResult = dotenv.config({ path: '.env' });

// Merge parsed .env (if any) with process.env and parse types
const mergedEnv = { ...(envResult.parsed || {}), ...process.env } as Record<string, any>;
const parsedEnv = dotenvParseVariables(mergedEnv);

const env = process.env.NODE_ENV || 'development';

export const config = {
	env,
	isDevelopment: env === 'development',
	isProduction: env === 'production',
	isTest: env === 'test',
	port: Number(parsedEnv.PORT) || 3001,
	database: {
		host: parsedEnv.DB_HOST,
		port: parsedEnv.DB_PORT,
		name: parsedEnv.DB_NAME,
		username: parsedEnv.DB_USER,
		password: parsedEnv.DB_PASSWORD,
		mongo: {
			uri: parsedEnv.MONGODB_URI,
		},
	},
	email: {
		user: parsedEnv.SMTP_USER,
		password: parsedEnv.SMTP_PASS,
		host: parsedEnv.SMTP_HOST,
		port: parsedEnv.SMTP_PORT,
	},
	server: {
		memoryUsageTimeOut: (parsedEnv.MEMORY_USAGE_TIMEOUT),
		activateNewRelic: true
	},
	jwt: {
		secret: parsedEnv.JWT_SECRET,
		expiresIn: parsedEnv.JWT_EXPIRES_IN,
	},
	kafka: {
		brokers: parsedEnv.KAFKA_BROKERS || parsedEnv.KAFKA_BROKER || 'localhost:9092',
	},
	rabbitmq: {
		url: parsedEnv.RABBITMQ_URL,
	}
};
