import nodemailer from 'nodemailer';
import logger from '../Config/Logger';
import { config } from './config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter = nodemailer.createTransport({
	host: config?.email?.host,
	port: config?.email?.port,
	secure: true,
	auth: {
	  user: config?.email?.user,
	  pass: config?.email?.password,
	},
  } as SMTPTransport.Options);
  
transporter.verify((error: Error | null, success: any) => {
	if (error) {
		logger.error('✘ UNABLE TO CONNECT TO THE MAIL SERVER');
		logger.error(error);
	} else {
		logger.info('✔ MAIL SERVER IS READY TO SEND MAILS');
	}
});

export default transporter;
