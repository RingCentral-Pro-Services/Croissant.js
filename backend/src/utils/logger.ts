import dotenv from 'dotenv';
import { init } from '@ringcentral-pro-serv/psi-logging-system';

dotenv.config();

const logger = init({
    // @ts-ignore
    host: process.env.LOKI_HOST,
    labels: {
        app: process.env.LOKI_APP_NAME,
        service: process.env.LOKI_SERVICE_NAME,
    },
    basicAuth: process.env.LOKI_AUTH,
    stdout: true,
});

export default logger;
