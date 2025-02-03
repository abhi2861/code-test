const ErrorLog = require('../models/errorLog');
const { sendEmail } = require('./email')
module.exports = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let errorResponse = {
    status: err.status,
    message: err.message
  };

  if (err && err.statusCode && err.statusCode === 413) {
    errorResponse.message = 'Requested file size is too large';
  }
  if (err?.errors && err.errors[0].validatorKey?.toLowerCase() === 'not_unique' && err?.errors[0]?.path) {
    const key = err.errors[0].path;
    const text = key.includes('_') ? key.split("_")[1] : key;

    errorResponse.message = `${text.charAt(0).toUpperCase() + text.slice(1)} already exists`;
    err.statusCode = 400;
  }

  const errorLog = await ErrorLog.create({
    statusCode: err.statusCode || 500,
    message: err.message,
    route: req.originalUrl ?? req.url ?? req.baseUrl ?? '',
    method: req.method,
    requestBody: req.body,
    error: JSON.stringify(err)
  });

  await sendEmail(process.env.EMAIL_USER, 'Vibhu Venture Partners', 'Error Log',`Error Log Details:\n body: ${JSON.stringify(req.body)}\n error: ${JSON.stringify(err)},\n status code: ${err.statusCode ?? 500}\n error Log ID: ${errorLog.id}`,'' );

  res.status(err.statusCode).json(errorResponse);

}