class appErrors extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
export default appErrors;
