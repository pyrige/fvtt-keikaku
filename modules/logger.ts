/**
 * Helper function for logging a prefixed message.
 * @param message is the message to log
 * @param logFunc is the logging function to use
 **/
function log(message: string, logFunc: (_: string) => void) {
  logFunc(`Keikaku | ${message}`);
}

/**
 * Print a prefixed info message
 * @param message is the message to print
 **/
export const info = (message: string) => log(message, logger.info);

/**
 * Print a prefixed info message
 * @param message is the message to print
 **/
export const warn = (message: string) => log(message, logger.warn);
