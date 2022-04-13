import winston, { loggers, Logger, transports, config } from 'winston';

export function getLogger(name: string): Logger {
	return loggers.get(name, {
		levels: config.syslog.levels,
		transports: [
			new transports.Console({
				level: 'debug',
				format: winston.format.combine(
					winston.format.colorize({
						all: true,
					}),
					winston.format.label({
						label: `[${name}]`,
					}),
					winston.format.timestamp({
						format: 'YY-MM-DD HH:MM:SS',
					}),
					winston.format.printf(info => `${info.label} ${info.message}`),
				),
			}),
		],
	});
}
export { Logger };
