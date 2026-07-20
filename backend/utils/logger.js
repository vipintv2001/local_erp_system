const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'logs.txt');

const logEvent = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage, 'utf8');
};

module.exports = { logEvent };
