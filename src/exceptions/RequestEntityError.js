const ClientError = require('./ClientError');

class RequestEntityError extends ClientError {
  constructor(message) {
    super(message, 413);
    this.name = 'RequestEntityError';
  }
}

module.exports = RequestEntityError;
