//Utils
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const AppError = require("./../utils/appError");

//Controller
const shared = require('./shared');

//Model
const InvestmentOpportunity = require('../models/investmentOpportunity');
const Company = require('../models/company');
const UserInvestment = require('../models/userInvestment');
const User = require('../models/user');
const StatusHistory = require('../models/statusHistory');
const Payment = require('../models/payment');

exports.getActiveApplications = catchAsync(async (req, res) => {
    let input = { active: true, status: { [Op.notIn]: ['Rejected'] } };
    let opportunityInput = { active: true }
    const json = {
        status: req.query.status,
        loggedInUserId: req.body.loggedInUserId,
    }
    await shared.validateRequestBody(json);

    const allowedStatusValues = ['Active', 'Refund', 'Closed', 'ExitProceedsDistributed'];
    if (!allowedStatusValues.includes(json.status)) {
        throw new AppError("Invalid value for status. Allowed values are: Active, Refund, Closed and Exit Proceeds Distributed", 400);
    }
    if (json.status === 'Active') {
        input.status[Op.notIn] = [
            ...input.status[Op.notIn],
            'Refund Received', 'Initiate Refund', 'Closed', 'Exit Proceeds Distributed']
        opportunityInput['investmentStatus'] = 'ActiveInvestment'
    }

    if (json.status === 'Refund') {
        input['status'] = { [Op.in]: ['Initiate Refund'] };
        opportunityInput['investmentStatus'] = 'EndInvestment'

    }

    if (json.status === 'Closed') {
        input['status'] = { [Op.in]: ['Closed'] };
        opportunityInput['investmentStatus'] = 'ActiveInvestment'

    }

    if (json.status === 'ExitProceedsDistributed') {
        input['status'] = { [Op.in]: ['Exit Proceeds Distributed'] };
        opportunityInput['investmentStatus'] = 'ActiveInvestment'

    }

    const investments = await UserInvestment.findAll({
        where: input,
        attributes: ['id', 'companyId', 'userId', 'investmentId', 'amount', 'status', 'requestedDate', 'investmentKey', 'estimatedSharesAtInvestment', 'estimatedSharesToday', 'notes'],
        include: [
            {
                model: Company,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'name', 'logo', 'companyProfile', 'description', 'fmvValue', 'fmvVEffectiveDate', 'fmvVExpirationDate', 'fmvlastFairMarketValue'],
            },
            {
                model: User,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'firstName', 'lastName', 'socialEmail', 'email'],
            },
            {
                model: InvestmentOpportunity,
                where: opportunityInput,
                order: [['id', 'DESC']],
                attributes: ['id', 'companyId', 'minAmount', 'carry', 'startDate', 'endDate', 'name', 'templateId', 'perUnitPrice'],
            }
        ],
        order: [['id', 'DESC']],
    });

    shared.response(res, investments)
})

exports.updateApplicationStatus = catchAsync(async (req, res) => {
    const json = {
        userInvestmentId: req.body.userInvestmentId,
        status: req.body.status,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);
    await UserInvestment.update({ status: json.status, updatedBy: json.loggedInUserId }, { where: { id: json.userInvestmentId } });

    if (['Initiate Payment', 'Funds Received', 'Initiate Refund', 'Refund Received'].includes(json.status)) {
        const userInvestment = await UserInvestment.findByPk(json.userInvestmentId, {
            attributes: ['amount', 'userId']
        })
        json['userId'] = userInvestment.userId;
        json['amount'] = userInvestment.amount;
        json['date'] = new Date();
        await Payment.create(json);
    }

    json['date'] = new Date();
    await StatusHistory.create(json);
    shared.response(res, '', {}, 'Opportunity Application Status Updated')
});

exports.deleteUserInvestment = catchAsync(async (req, res) => {
    const json = {
        id: req.query.id,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json, ['loggedInUserId']);

    const investment = await UserInvestment.update({ active: false }, { where: { id: json.id } });

    shared.response(res, investment, {}, 'Deleted Successfully')

})