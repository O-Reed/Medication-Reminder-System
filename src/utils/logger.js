const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../call-logs.log');

class Logger {
  static formatMessage(callSid, status, response = '') {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] Call SID: ${callSid} | Status: ${status} | Response: ${response}`;
  }

  static log(callSid, status, response = '') {
    const logEntry = this.formatMessage(callSid, status, response);
    
    console.log(`\x1b[36m${logEntry}\x1b[0m`);
    
    fs.appendFileSync(logPath, logEntry + '\n');
  }

  static getStatusColor(status) {
    const colors = {
      'initiated': '\x1b[34m',    // Blue
      'ringing': '\x1b[33m',      // Yellow
      'in-progress': '\x1b[32m',  // Green
      'completed': '\x1b[32m',    // Green
      'failed': '\x1b[31m',       // Red
      'voicemail': '\x1b[35m',    // Magenta
      'default': '\x1b[36m'       // Cyan
    };
    return colors[status] || colors.default;
  }
}

module.exports = Logger;