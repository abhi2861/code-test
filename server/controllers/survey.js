//Utils
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

//Controller
const shared = require('./shared');
const document = require('./document')

//Model
const InterestSurvey = require('../models/interestSurvey');
const InterestCapture = require('../models/interestCapture');
const Company = require('../models/company');
const User = require('../models/user');

exports.createInterestSurvey = async (req, res) => {
    let survey, documentUrl;
    const json = {
        id: req.body.id,
        companyId: req.body.companyId,
        loggedInUserId: req.body.loggedInUserId,
        startDate: req.body.startDate ? shared.convertPacificTimeToUTC(req.body.startDate, 'start') : null,
        endDate: req.body.endDate ? shared.convertPacificTimeToUTC(req.body.endDate, 'end') : null,
        investmentRange: req.body.investmentRange,
        name: req.body.name,
        description: req.body.description,
        documents: req.body.documents,
        notes: req.body.notes
    }
    await shared.validateRequestBody(json, ['id', 'startDate', 'investmentRange', 'name', 'description', 'documents', 'notes']);

    json['createdBy'] = json.loggedInUserId

    // Upload documents to S3
    if (json.documents?.base64Data) {
        documentUrl = await document.uploadFileToS3(json.documents);
        json['document'] = documentUrl;
    }

    if (json.id && json.endDate) {
        survey = await InterestSurvey.update({ endDate: json.endDate, updatedBy: json.loggedInUserId }, { where: { id: json.id } });
    } else {
        survey = await InterestSurvey.create(json);
    }

    shared.response(res, survey, {}, 'Survey created successfully')
}

// Read
exports.getInterestSurvey = catchAsync(async (req, res) => {
    const json = {
        loggedInUserId: req.body.loggedInUserId,
    }
    await shared.validateRequestBody(json);
    const startDate = moment.tz('America/Los_Angeles').startOf('day').utc().toDate();
    const endDate = moment.tz('America/Los_Angeles').endOf('day').utc().toDate();
    let input = {
        active: true,
        [Op.or]: [
            {
                startDate: { [Op.lt]: endDate },
                endDate: { [Op.gte]: startDate },
            },
            {
                startDate: { [Op.gt]: endDate },
            },
        ],
    }
    const surveys = await InterestSurvey.findAll({
        where: input,
        attributes: ['id', 'companyId', 'startDate', 'endDate', 'investmentRange', 'name', 'description', 'document', 'notes'],
        include: [
            {
                model: Company,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'name', 'logo']
            }
        ],
        order: [['id', 'DESC']]
    });

    shared.response(res, surveys)

})

exports.createInterestCapture = async (req, res) => {
    const json = {
        id: req.body.id,
        companyId: req.body.companyId,
        loggedInUserId: req.body.loggedInUserId,
        startDate: req.body.startDate ? shared.convertPacificTimeToUTC(req.body.startDate, 'start') : null,
        endDate: req.body.endDate ? shared.convertPacificTimeToUTC(req.body.endDate, 'end') : null,
        minimumInvestmentAmount: req.body.minimumInvestmentAmount,
        interestSurveyId: req.body.interestSurveyId,
        amount: req.body.amount,
        contactedYN: req.body.contactedYN ?? false,
        interestedYN: req.body.interestedYN
    }
    await shared.validateRequestBody(json, ['id', 'startDate', 'endDate', 'minimumInvestmentAmount', 'contactedYN', 'interestedYN']);

    json['createdBy'] = json.loggedInUserId;
    json['userId'] = json.loggedInUserId;
    json['initialInterestShownDate'] = new Date();

    if (json.id) {
        await InterestCapture.update({ interestedYN: json.interestedYN, amount: json.amount }, { where: { id: json.id } });
    } else {
        await InterestCapture.create(json);
    }

    shared.response(res, '', {}, 'Survey updated successfully')
}

//get Interest Capture
exports.getInterestCapture = catchAsync(async (req, res) => {
    const json = {
        loggedInUserId: req.body.loggedInUserId,
        interestSurveyId: req.body.id,
        name: req.body.name
    }
    await shared.validateRequestBody(json);

    const interestCaptures = await InterestCapture.findAll({
        where: { active: true, interestSurveyId: json.interestSurveyId },
        attributes: ['id', 'interestSurveyId', 'amount', 'initialInterestShownDate', 'interestedYN'],
        order: [['id', 'DESC']],
        include: [
            {
                model: User,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['firstName', 'lastName']
            }
        ]
    });

    let totalInterestedPeople = 0, sumOfAmount = 0.00, users = [];

    interestCaptures.forEach(interestCapture => {
        const { interestedYN, amount, initialInterestShownDate } = interestCapture;
        const user = interestCapture.User;

        if (interestedYN) {
            totalInterestedPeople++;
        }

        sumOfAmount += parseFloat(amount) || 0;

        // Determine status
        let status = '';
        if (interestedYN) {
            status = 'Interested';
        }

        // Add the user data to the list
        users.push({
            firstName: user.firstName,
            lastName: user.lastName,
            amount: parseFloat(amount).toFixed(2),
            status: status,
            date: initialInterestShownDate
        });
    });

    // Construct the response data
    const data = {
        surveyName: json.name,
        totalInterestedPeople,
        sumOfAmount: sumOfAmount.toFixed(2),
        users
    };

    shared.response(res, data);
});

//get All User survey
exports.getAllSurvey = catchAsync(async (req, res) => {
    const json = {
        loggedInUserId: req.body.loggedInUserId,
    }
    await shared.validateRequestBody(json);

    const interestSurvey = await InterestSurvey.findAll({
        where: { active: true },
        attributes: ['id', 'name'],
        order: [['id', 'DESC']],
        include: [
            {
                model: Company,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['name']
            }
        ]
    });

    const response = interestSurvey.map(data => ({
        id: data.id,
        name: data.name,
        companyName: data.company.name,
    }))
    shared.response(res, response)

})
