import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, prettyPrint, splat } = format;

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(timestamp(), json(), prettyPrint()),
  transports: [
    new transports.Console({
      format: format.combine(json(), prettyPrint(), timestamp(), splat()),
    }),
  ],
});

export default logger;
