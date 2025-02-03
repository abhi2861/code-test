// Importing Utils
const catchAsync = require('../utils/catchAsync');

const sharedController = require('./shared');

//Importing Models
const bulletinBoardModel = require('../models/bulletinBoard');

// Create
exports.createBulletin = catchAsync(async (req, res) => {
  let obj = {
    companyId: req.body.companyId,
    subject: req.body.subject,
    message: req.body.message,
    isPublished: req.body.isPublished,
    publishedDate: req.body.publishedDate ? sharedController.convertPacificTimeToUTC(req.body.publishedDate, 'start') : null,
    source: req.body.source,
    createdBy: req.body.createdBy
  }

  await sharedController.validateRequestBody(obj, ["subject", "message", "isPublished", "publishedDate", "source", "createdBy"]);

  const newRecord = await bulletinBoardModel.create(obj);
  res.json({
    message: 'Record created successfully',
    data: newRecord
  });
})

// Read
exports.getBulletin = catchAsync(async (req, res) => {
  const record = await bulletinBoardModel.findAll({
    order: [['id', 'DESC']],
  });
  if (record) {
    res.json(record);
  } else {
    res.status(404).json({ message: 'Record not found' });
  }
})

