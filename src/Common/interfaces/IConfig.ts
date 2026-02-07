export interface IConfig {
    env: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    port: number;
    database: {
        host: string;
        port: number | string;
        name: string;
        username: string;
        password: string;
        mongo: {
            uri: string;
        };
    };
    email: {
        user: string;
        password: string;
        host: string;
        port: number | string;
    };
    server: {
        memoryUsageTimeOut: number | string;
        activateNewRelic: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string | number;
    };
    kafka: {
        brokers: string | string[];
    };
    rabbitmq: {
        url: string;
    };
}
