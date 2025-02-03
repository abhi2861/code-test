//Utils
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const AppError = require("./../utils/appError");
const moment = require('moment-timezone');
require('dotenv').config({ path: "./config.env" });

//Controller
const shared = require('./shared');
const document = require('./document');
const { sendEmail } = require('./email')

//Model
const InvestmentOpportunity = require('../models/investmentOpportunity');
const Company = require('../models/company');
const UserInvestment = require('../models/userInvestment');
const StatusHistory = require('../models/statusHistory');
const User = require('../models/user');
const MasterData = require('../models/masterData');
const Partner = require('../models/partner');

exports.createInvestmentOpportunity = catchAsync(async (req, res) => {
    let documentUrl, message, otherDocUrl;
    const json = {
        id: req.body.id,
        loggedInUserId: req.body.loggedInUserId,
        companyId: req.body.companyId,
        userId: req.body.userId,
        minAmount: req.body.minAmount,
        carry: req.body.carry,
        startDate: req.body.startDate ? shared.convertPacificTimeToUTC(req.body.startDate, 'start') : null,
        endDate: req.body.endDate ? shared.convertPacificTimeToUTC(req.body.endDate, 'end') : null,
        fmvValue: req.body.fmvValue,
        fmvVEffectiveDate: req.body.fmvVEffectiveDate,
        fmvVExpirationDate: req.body.fmvVExpirationDate,
        name: req.body.name,
        description: req.body.description,
        documents: req.body.documents,
        notes: req.body.notes,
        templateId: req.body.templateId,
        perUnitPrice: req.body.perUnitPrice,
        investmentStatus: 'ActiveInvestment',
        estimatedCloseDate: req.body.estimatedCloseDate,
        investmentType: req.body.investmentType,
        managementFee: req.body.managementFee,
        expenseReserve: req.body.expenseReserve,
        carryPercentage: req.body.carryPercentage,
        otherDocs: req.body.otherDoc
    }
    await shared.validateRequestBody(json, ['carry', 'startDate', 'endDate', 'fmvValue', 'fmvVEffectiveDate', 'fmvVExpirationDate', 'name', 'description', 'documents', 'notes', 'id', 'templateId', 'estimatedCloseDate', 'investmentType', 'otherDocs', 'managementFee', 'expenseReserve', 'carryPercentage'])

    // Upload documents to S3
    if (json.documents?.base64Data) {
        documentUrl = await document.uploadFileToS3(json.documents);
        json['document'] = documentUrl;
    }
    else if (json.id && json.documents) {
        json['document'] = json.documents
    }
    else {
        json['document'] = null
    }

    if (json.otherDocs?.base64Data) {
        otherDocUrl = await document.uploadFileToS3(json.otherDocs);
        json['otherDoc'] = otherDocUrl;
    } else if (json.id && json.otherDocs) {
        json['otherDoc'] = json.otherDocs;
    } else {
        json['otherDoc'] = null;
    }

    if (json.id) {
        await InvestmentOpportunity.update(json, { where: { id: json.id } })
        message = 'Opportunity updated successfully';
    }
    else {
        // if fmvValue is null or undefind
        if (!json.fmvValue || json.fmvValue === null) {
            json.fmvValue = json.perUnitPrice;
            await Company.update({ fmvValue: json.fmvValue }, { where: { id: json.companyId } });
        }
        await InvestmentOpportunity.create(json);
        message = 'Opportunity created successfully';
    }
    shared.response(res, '', {}, message)
})

// Read
exports.getInvestmentOpportunity = catchAsync(async (req, res) => {
    let investment, input = { active: true };
    let orderInput = [['id', 'DESC']];

    const json = {
        status: req.query.status,
        loggedInUserId: req.body.loggedInUserId,
        role: req.query.role,
        investmentStatus: req.query.investmentStatus
    }
    await shared.validateRequestBody(json, ['status', 'investmentStatus']);

    const allowedStatusValues = ['Open', 'Upcoming', 'Closed', 'Inclose'];
    const allowedInvestmentStatusValues = ['EndInvestment'];

    if ((json.status && !allowedStatusValues.includes(json.status)) ||
        (json.investmentStatus && !allowedInvestmentStatusValues.includes(json.investmentStatus))) {

        const message = (json.status && !allowedStatusValues.includes(json.status)) ? `Invalid value for status. Allowed values are: Open, Upcoming, Closed.` : ''
            + (json.investmentStatus && !allowedInvestmentStatusValues.includes(json.investmentStatus)) ? `Invalid value for investment status. Allowed value is: EndInvestment.` : '';

        throw new AppError(message.trim(), 400);
    }
    const startDate = moment.tz('America/Los_Angeles').startOf('day').utc().toDate();
    const endDate = moment.tz('America/Los_Angeles').endOf('day').utc().toDate();
    const currentDate = moment().tz('America/Los_Angeles').utc().format()

    if (json.status === 'Open') {
        input = {
            ...input,
            startDate: { [Op.lt]: endDate },
            endDate: { [Op.gte]: startDate },
            [Op.not]: {

                estimatedCloseDate: {
                    [Op.gt]: currentDate
                },
                endDate: {
                    [Op.lt]: currentDate
                }


            },
            investmentStatus: { [Op.not]: 'EndInvestment' }
        }
    }
    else if (json.status === 'Upcoming') {
        input['startDate'] = { [Op.gt]: endDate };
        input['investmentStatus'] = { [Op.not]: 'EndInvestment' }
    }
    else if (json.status === 'Inclose') {
        input['estimatedCloseDate'] = { [Op.gt]: currentDate };
        input['endDate'] = { [Op.lt]: currentDate };
        input['investmentStatus'] = { [Op.not]: 'EndInvestment' }
    }
    else if (json.status === 'Closed') {
        input[Op.or] = [
            { investmentStatus: 'EndInvestment' },
            {
                [Op.and]: [
                    { endDate: { [Op.lt]: startDate } },
                    {
                        [Op.or]: [
                            { investmentStatus: 'ActiveInvestment' },
                            { investmentStatus: 'EndInvestment' }
                        ]
                    }
                ]
            }
        ];
        orderInput = [['updatedAt', 'DESC']];
    }

    const investments = await InvestmentOpportunity.findAll({
        where: input,
        attributes: ['id', 'companyId', 'minAmount', 'carry', 'startDate', 'endDate', 'name', 'description', 'document', 'notes', 'templateId', 'perUnitPrice', 'investmentStatus', 'updatedAt', 'estimatedCloseDate', 'investmentType', 'otherDoc', 'managementFee', 'expenseReserve', 'carryPercentage'],
        include: [
            {
                model: Company,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'name', 'logo', 'companyProfile', 'description', 'fmvValue'],
            }
        ],
        order: orderInput,
    });

    const investmentIds = investments.map(investment => investment.id);
    let inputObj = {
        investmentId: { [Op.in]: investmentIds },
        active: true,
    };
    if (json.role === 'admin') {
        inputObj['status'] = 'Closed'
    }

    if (json.role === 'user') {
        inputObj['userId'] = json.loggedInUserId
    }

    // UserInvestment records
    const userInvestments = await UserInvestment.findAll({
        where: inputObj,
        required: false,
        order: [['id', 'DESC']],
        attributes: ['id', 'investmentId', 'contactedYN', 'interestedYN', 'status', 'amount', 'noOfUnits', 'requestedDate', 'investmentKey', 'estimatedSharesAtInvestment', 'estimatedSharesToday', 'notes'],
        include: [
            {
                model: User,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: StatusHistory,
                where: { active: true },
                order: [['date', 'ASC']],
                attributes: ['status', 'date']
            }
        ],
    });

    if (json.role === 'admin') {
        let InvestmentObj
        investment = investments.map(investment => {
            InvestmentObj = investment.toJSON()
            if (json.status === 'Upcoming') {
                InvestmentObj.investmentStatus = "UpcomingInvestment"
            }
            if (json.status === 'Closed') {
                InvestmentObj.investmentStatus = "EndInvestment"
            }
            if (json.status === 'Inclose') {
                InvestmentObj.investmentStatus = "Inclose"
            }
            const matchingUserInvestments = userInvestments.filter(ui => ui.investmentId === investment.id);
            const investorData = matchingUserInvestments.map(ui => ({
                userId: ui?.User?.id,
                userName: `${ui?.User?.firstName} ${ui?.User?.lastName}`,
                amount: ui.amount,
                noOfUnits: ui?.noOfUnits,
                status: ui?.status,
                currentValue: shared.parseToDecimals(ui?.noOfUnits * investment?.company?.fmvValue) ?? null,
                investmentKey: ui.investmentKey ?? null,
                estimatedSharesAtInvestment: ui.estimatedSharesAtInvestment ?? 0,
                estimatedSharesToday: ui.estimatedSharesToday,
                netCommitment: ui.amount,
                estimatedSharePriceAtInvestment: InvestmentObj.perUnitPrice,
                userInvestmentId: ui.id,
                notes: ui.notes
            }));
            return {
                ...InvestmentObj,
                totalInvestors: investorData.length,
                totalFundRaised: investorData.reduce((total, num) => total + parseFloat(num.amount), 0),
                investorData,
            };
        });

    }
    else {
        investment = investments.map(investment => {
            const appliedInvestment = userInvestments.find(userInvestment => userInvestment.investmentId === investment.id);
            return {
                status: json.status,
                interestedYN: appliedInvestment ? appliedInvestment.interestedYN : false,
                contactedYN: appliedInvestment ? appliedInvestment.contactedYN : false,
                userInvestmentId: appliedInvestment?.id,
                ...investment.toJSON(),
                applied: appliedInvestment && appliedInvestment.StatusHistories && appliedInvestment.StatusHistories[0]?.status === 'Applied' ? true : false
            };
        });
    }
    shared.response(res, investment)
});


//Delete
exports.deleteInvestmentOpportunity = catchAsync(async (req, res) => {
    const json = {
        id: req.query.id,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json, ['loggedInUserId']);

    const userInvestment = await UserInvestment.findAll({
        where: {
            investmentId: json.id,
            active: true
        }
    });

    if (userInvestment.length > 0 && userInvestment.some(inv => inv.status !== 'Rejected')) {
        throw new AppError("Application already exists for this investment opportunity.", 400);
    }
    else {
        const investment = await InvestmentOpportunity.update({ active: false }, { where: { id: json.id } });
        shared.response(res, investment, {}, 'Deleted Successfully')
    }
})

//Create User Investment
exports.createUserInvestment = catchAsync(async (req, res) => {
    let message = 'Investment applied successfully', response, matchingCarry;
    const json = {
        id: req.body.id,
        loggedInUserId: req.body.loggedInUserId,
        companyId: req.body.companyId,
        userId: req.body.userId,
        investmentId: req.body.investmentId,
        paymentId: req.body.paymentId,
        amount: req.body.amount,
        documentId: req.body.documentId,
        documentSentDate: req.body.documentSentDate,
        documentSignedDate: req.body.documentSignedDate,
        documentIdSignedByCompanyDate: req.body.documentIdSignedByCompanyDate,
        investementDate: req.body.investementDate,
        requestedDate: req.body.applicationDate ? new Date(req.body.applicationDate) : new Date(),
        contactedYN: req.body.contactedYN,
        interestedYN: req.body.interestedYN,
        applied: req.body.applied,
        notes: req.body.notes
    }
    await shared.validateRequestBody(json, ['id', 'paymentId', 'documentId', 'documentSentDate', 'documentSignedDate', 'documentIdSignedByCompanyDate', 'investementDate', 'contactedYN', 'interestedYN', 'applied', 'amount', 'notes', 'perUnitPrice']);

    const [user, partner] = await Promise.all([
        User.findByPk(json.userId, {
            attributes: ['firstName', 'lastName', 'email']
        }),
        Partner.findOne({ active: true }, {
            attributes: ['companyEmail']
        })
    ]);
    
    const investementData = await InvestmentOpportunity.findByPk(json.investmentId, {
        attributes: ['name', 'minAmount', 'startDate', 'endDate', 'fmvValue', 'carry', 'carryPercentage', 'managementFee', 'expenseReserve', 'perUnitPrice']
    })

    if (investementData) {
        matchingCarry = investementData.carryPercentage?.find(carry =>
            carry.floor <= json.amount && carry.ceiling >= json.amount
        );
    }
    const startDate = moment.tz(investementData.startDate, process.env.TIMEZONE).format('MM-DD-YYYY');
    const endDate = moment.tz(investementData.endDate, process.env.TIMEZONE).format('MM-DD-YYYY');

    if (json.applied) {
        json['status'] = 'Applied';
    }

    const netCommitment = json.amount && investementData.managementFee && investementData.expenseReserve
        ? parseFloat((json.amount * (100 - investementData.managementFee - investementData.expenseReserve)) / 100).toFixed(2)
        : 0.0;

    const noOfUnits = (parseFloat(json.amount)) / investementData.perUnitPrice;
    const investment = {
        ...json,
        noOfUnits: noOfUnits,
        investmentKey: `${json.companyId}-${json.investmentId}-${json.userId}`,
        netCommitment: netCommitment,
        estimatedSharesAtInvestment: investementData.perUnitPrice && netCommitment
            ? parseFloat(netCommitment / investementData.perUnitPrice).toFixed(2)
            : 0.0,
        estimatedSharesToday: investementData.fmvValue && investementData.perUnitPrice
            ? parseFloat(investementData.fmvValue / investementData.perUnitPrice).toFixed(2)
            : 0.0,
        carry: matchingCarry?.carryPer
    };

    if (json.id && json.contactedYN) {
        await UserInvestment.update({ contactedYN: json.contactedYN, status: json.status }, { where: { id: json.id } });
        message = 'Thank you for contacting Us.'
    } else {
        investment['createdBy'] = json.loggedInUserId;
        response = await UserInvestment.create(investment);
        if (json.contactedYN === true) {
            message = 'Thank you for contacting Us.'
        }
    }

    if (json.applied) {

        await StatusHistory.create({
            userInvestmentId: response?.id ?? json?.id,
            status: json.status,
            date: new Date()
        });
    }

    await sendEmail(partner?.companyEmail ?? process.env.EMAIL_TO, user.email, `Investor Interested in ${investementData.name}`,
        `   Hello Vibhu Venture Partners,\n\n
    ${user.firstName} ${user.lastName} has shown interest in an investment opportunity. Here are the details:\n  
    Investment Name: ${investementData.name}
    Minimum Amount: $${investementData.minAmount}
    Start Date: ${startDate}
    End Date: ${endDate}\n\n
    Please follow up with the investor for further engagement and assistance.\n\n    
    Thank you.`, '');

    shared.response(res, '', {}, message)

})

exports.getUserInvestment = catchAsync(async (req, res) => {
    const json = {
        status: req.query.status,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);
    let input = {
        userId: json.loggedInUserId,
        status: json.status,
    }
    const investments = await Company.findAll({
        where: { active: true },
        attributes: ['id', 'name', 'logo', 'fmvValue', 'fmvVEffectiveDate', 'fmvVExpirationDate', 'fmvlastFairMarketValue'],
        include: [
            {
                model: UserInvestment,
                where: input,
                order: [['id', 'DESC']],
                attributes: ['id', 'amount', 'requestedDate', 'noOfUnits'],
                include: [
                    {
                        model: InvestmentOpportunity,
                        where: { active: true },
                        order: [['id', 'DESC']],
                        attributes: ['id', 'carry', 'startDate', 'minAmount', 'name', 'description', 'document'],
                    },
                ]
            },
        ],
        order: [['id', 'DESC']],
    })

    const { investmentData, totalInvested, finalTotalCurrentValue } = investments.reduce((acc, company) => {
        const companyDetails = company.toJSON();
        let totalCurrentValue = 0;
        let companyTotalInvested = 0;

        companyDetails.userInvestments.forEach(investment => {
            const currentValue = parseFloat(investment.noOfUnits * companyDetails.fmvValue) ?? null;
            investment.currentValue = shared.parseToDecimals(currentValue);

            if (currentValue !== null) {
                totalCurrentValue += currentValue;
            }
            companyTotalInvested += parseFloat(investment.amount);
        });
        acc.finalTotalCurrentValue += totalCurrentValue;
        acc.totalInvested += companyTotalInvested;
        companyDetails.totalInvested = shared.parseToDecimals(companyTotalInvested);
        companyDetails.totalCurrentValue = shared.parseToDecimals(totalCurrentValue);
        acc.investmentData.push(companyDetails);
        return acc;
    }, {
        investmentData: [],
        totalInvested: 0,
        finalTotalCurrentValue: 0
    });
    let data = {
        investments: investmentData,
        totalInvested: shared.parseToDecimals(totalInvested),
        totalCurrentValue: shared.parseToDecimals(finalTotalCurrentValue)
    };
    shared.response(res, data)
})

exports.opportunityRejection = catchAsync(async (req, res) => {
    const json = {
        userInvestmentId: req.query.userInvestmentId,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);
    json['status'] = 'Rejected'
    await UserInvestment.update({ status: json.status, updatedBy: json.loggedInUserId }, { where: { id: json.userInvestmentId } });
    json['date'] = new Date();
    await StatusHistory.create(json);
    shared.response(res, '', {}, 'Opportunity Rejected')
});

exports.getAllUserInvestment = catchAsync(async (req, res) => {
    const json = {
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);
    const investments = await UserInvestment.findAll({
        where: { userId: json.loggedInUserId, active: true, status: { [Op.notIn]: ['Rejected', 'Closed', 'Refund Received', 'Initiate Refund', 'Exit Proceeds Distributed'] } },
        attributes: ['id', 'amount', 'status', 'investmentId'],
        include: [
            {
                model: InvestmentOpportunity,
                where: { active: true, investmentStatus: { [Op.not]: 'EndInvestment' }, },
                attributes: ['id', 'name', 'investmentStatus'],
                order: [['id', 'DESC']],
                include: [
                    {
                        model: Company,
                        where: { active: true },
                        attributes: ['id', 'name', 'logo'],
                        order: [['id', 'DESC']],
                    },
                ]
            },
            {
                model: StatusHistory,
                where: { active: true },
                attributes: ['id', 'status', 'date'],
                order: [['id', 'DESC']]
            }
        ],
        order: [['id', 'DESC']],
    })

    const masterData = await MasterData.findAll({
        where: {
            active: true,
            type: "investmentStatus"
        },
        attributes: ['value', 'order']
    })
    const statusOrder = {};
    masterData.forEach(data => {
        statusOrder[data.value] = { value: data.value, order: data.order };
    });

    const rearrangedInvestments = investments.map(investment => {
        const rearrangedStatusHistory = [];
        let previousDate = null;

        Object.values(statusOrder).forEach(({ value, order }) => {
            let historyItems = investment.StatusHistories.filter(item => item.status === value);
            let latestDate = null;
            if (historyItems.length > 0) {
                latestDate = new Date(Math.max(...historyItems.map(item => new Date(item.date))));
                latestDate = latestDate.toISOString();
                if (previousDate && latestDate <= previousDate) {
                    latestDate = null;
                } else {
                    previousDate = latestDate;
                }
            }
            rearrangedStatusHistory.push({ order: order, status: value, date: latestDate });
        });
        return {
            id: investment.id,
            amount: investment.amount,
            status: investment.status,
            investmentId: investment.investmentId,
            investmentOpportunity: investment.InvestmentOpportunity,
            statusHistories: rearrangedStatusHistory
        };
    });

    shared.response(res, rearrangedInvestments)
});

exports.endInvestmentOpportunity = catchAsync(async (req, res) => {
    const json = {
        id: req.body.id,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);
    const allowedStatusValues = ['Funds Received', 'Investment Completed', 'Doc Signed By Vibhu']
    // const changeStatus
    await UserInvestment.update({ status: 'Initiate Refund' },
        { where: { investmentId: json.id, status: { [Op.in]: allowedStatusValues }, active: true } })

    await InvestmentOpportunity.update({ investmentStatus: 'EndInvestment' }, { where: { id: json.id }, });
    shared.response(res, '', {}, 'Investment Opportunity Ended Successfully')
})

exports.getAllInvestmentOpportunity = catchAsync(async (req, res) => {

    const investments = await InvestmentOpportunity.findAll({
        where: { active: true },
        attributes: ['id', 'companyId', 'perUnitPrice', 'name'],
        order: [['id', 'DESC']],
        include: [
            {
                model: Company,
                where: { active: true },
                required: true,
                attributes: ['id', 'logo'],

            }
        ]
    })

    const allInvestment = investments.map(investment => {
        return {
            investmentId: investment.id,
            companyId: investment.companyId,
            perUnitPrice: investment.perUnitPrice,
            logo: investment.company.logo,
            investmentName: investment.name
        }
    })
    shared.response(res, allInvestment)
})

exports.updateUserInvestment = catchAsync(async (req, res) => {
    const json = {
        id: req.body.id,
        loggedInUserId: req.body.loggedInUserId,
        amount: req.body.amount,
        requestedDate: req.body.requestedDate,
        notes: req.body.notes
    }
    let matchingCarry;
    await shared.validateRequestBody(json, ['requestedDate', 'amount', 'notes']);

    if (json.id) {
        const updateData = {
            updatedBy: json.loggedInUserId
        };
        if (json.amount !== undefined && json.amount !== null) {
            updateData.amount = json.amount;
        }
        if (json.requestedDate !== undefined && json.requestedDate !== null) {
            updateData.requestedDate = json.requestedDate;
        }
        if (json.notes !== undefined && json.notes !== null) {
            updateData.notes = json.notes;
        }

        const investementData = await UserInvestment.findByPk(json.id, {
            attributes: ["id", "investmentId", "amount","requestedDate","estimatedSharesAtInvestment","netCommitment","carry" ],
            include:[
                {
                    where: { active: true },
                    model:InvestmentOpportunity,
                    attributes:["carryPercentage","managementFee","expenseReserve","perUnitPrice"],
                    order: [['id', 'DESC']],
                },
                {
                    where: { active: true },
                    model:Company,
                    attributes:["id","name","fmvValue"],
                    order: [['id', 'DESC']],
                }
            ],
            order: [['id', 'DESC']],
        });
        if (investementData) {
            matchingCarry = investementData.InvestmentOpportunity.carryPercentage?.find(carry =>
                Number.parseInt(carry.floor) <= Number.parseInt( updateData.amount) && Number.parseInt(carry.ceiling) >= Number.parseInt(updateData.amount)
            );
        }
        const netCommitment = updateData.amount && investementData.InvestmentOpportunity.managementFee && investementData.InvestmentOpportunity.expenseReserve
        ? parseFloat((updateData.amount * (100 - investementData.InvestmentOpportunity.managementFee - investementData.InvestmentOpportunity.expenseReserve))/100 ).toFixed(2)
        : 0.0;
    
    const noOfUnits = (parseFloat(updateData.amount)) / investementData.InvestmentOpportunity.perUnitPrice;
    const investmentUpdate = {
        ...updateData,
        noOfUnits: noOfUnits,
        netCommitment: netCommitment,
        estimatedSharesAtInvestment: investementData.InvestmentOpportunity.perUnitPrice && netCommitment
            ? parseFloat(netCommitment / investementData.InvestmentOpportunity.perUnitPrice).toFixed(2)
            : 0.0,
        estimatedSharesToday: investementData.fmvValue && investementData.InvestmentOpportunity.perUnitPrice
            ? parseFloat(investementData.company.fmvValue / investementData.InvestmentOpportunity.perUnitPrice).toFixed(2)
            : 0.0,
        carry: matchingCarry?.carryPer
    };

        await UserInvestment.update(investmentUpdate, { where: { id: json.id } });
    }

    shared.response(res, '',{}, 'Details Updated Successfully')
})

exports.getInvestmentDeatils = catchAsync(async (req, res) => {
    let opportunityInput = { active: true }
    const json = {
        status: req.body.status,
        investmentId: req.body.investmentId
    }
    await shared.validateRequestBody(json);

    let input = { active: true, status: { [Op.notIn]: ['Rejected'] }, investmentId: json.investmentId };
    let inputClosed = { active: true, status: { [Op.in]: ['Closed'] }, investmentId: json.investmentId };
    const allowedStatusValues = ['Active', 'Refund'];
    if (!allowedStatusValues.includes(json.status)) {
        throw new AppError("Invalid value for status. Allowed values are: Active, Refund", 400);
    }
    if (json.status === 'Active') {
        input.status[Op.notIn] = [
            ...input.status[Op.notIn],
            'Refund Received', 'Initiate Refund', 'Closed','Exit Proceeds Distributed']
        opportunityInput['investmentStatus'] = 'ActiveInvestment'
    }
    if (json.status === 'Refund') {
        input['status'] = { [Op.in]: ['Initiate Refund'] };
        opportunityInput['investmentStatus'] = 'EndInvestment'
    }


    let investment = await UserInvestment.findAll({
        where: input,
        order: [['id', 'DESC']],
        attributes: ['id', 'investmentId', 'contactedYN', 'interestedYN', 'status', 'amount', 'noOfUnits', 'requestedDate', 'investmentKey', 'estimatedSharesAtInvestment', 'estimatedSharesToday', 'notes'],
        include: [
            {
                model: Company,
                required: false,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'name', 'logo', 'companyProfile', 'description', 'fmvValue', 'fmvVEffectiveDate', 'fmvVExpirationDate', 'fmvlastFairMarketValue'],
            },
            {
                model: User,
                required: false,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'firstName', 'lastName', 'socialEmail', 'email'],
            },
            {
                model: InvestmentOpportunity,
                where: opportunityInput,
                order: [['id', 'DESC']],
                attributes: ['id', 'companyId', 'minAmount', 'carry', 'startDate', 'endDate', 'name', 'templateId', 'investmentStatus', 'description', 'perUnitPrice', 'investmentType', 'otherDoc', 'managementFee', 'expenseReserve', 'carryPercentage', 'estimatedCloseDate'],
            }
        ]
    });

    let investmentClosed = await UserInvestment.findAll({
        where: inputClosed,
        order: [['id', 'DESC']],
        attributes: ['id', 'status', 'amount'],
        include: [
            {
                model: InvestmentOpportunity,
                where: opportunityInput,
                order: [['id', 'DESC']],
                attributes: ['id', 'name', 'investmentStatus'],
            }
        ]
    });

    let subTotal = {
        applied: 0,
        approved: 0,
        funds_Received: 0,
        closed: 0
    }

    for (let ele of investment) {
        if (ele.status === "Applied") {
            subTotal.applied += Number.parseInt(ele.amount);
        } else if (["Approved", "Doc Sent to Investor", "Doc Signed By Investor", "Funds Transfer Initiated"].includes(ele.status)) {
            subTotal.approved += Number.parseInt(ele.amount);
        } else if (ele.status === "Funds Received") {
            subTotal.funds_Received += Number.parseInt(ele.amount);
        }
    }

    for (let ele of investmentClosed) {
        if (ele.status === "Closed") {
            subTotal.closed += Number.parseInt(ele.amount);
        }

    }

    let investmentOpportunity = await InvestmentOpportunity.findByPk(json.investmentId, {
        attributes: ['id', 'companyId', 'minAmount', 'carry', 'startDate', 'endDate', 'name', 'templateId', 'investmentStatus', 'description', 'perUnitPrice', 'investmentType', 'otherDoc', 'managementFee', 'expenseReserve', 'carryPercentage', 'estimatedCloseDate']
    });
    let findCompany = await Company.findOne({
        where: { id: investmentOpportunity.companyId },
        attributes: ['name']
    });
    if (findCompany) {
        investmentOpportunity = {
            ...investmentOpportunity.get(),
            companyName: findCompany.name
        };
    }
    const response = {
        subTotals: {
            applied: subTotal.applied.toString(),
            approved: subTotal.approved.toString(),
            funds_Received: subTotal.funds_Received.toString(),
            closed: subTotal.closed.toString()
        },
        investments: investment,
        investmentdetails: investmentOpportunity ? investmentOpportunity : {},
    };

    shared.response(res, response);
});

exports.createNote = catchAsync(async (req, res) => {
    const json = {
        id: req.body.userInvestmentId,
        loggedInUserId: req.body.loggedInUserId,
        note: req.body.note
    }
    await shared.validateRequestBody(json);

    if (json.id) {
        const updateData = {
            notes: json.note,
            updatedBy: json.loggedInUserId
        };
        await UserInvestment.update(updateData, { where: { id: json.id } });
    }
    shared.response(res, '', {}, 'Details Updated Successfully')
})

exports.deleteNote = catchAsync(async (req, res) => {
    const json = {
        id: req.body.userInvestmentId,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);

    if (json.id) {
        const updateData = {
            active: false,
            updatedBy: json.loggedInUserId
        };
        await UserInvestment.update(updateData, { where: { id: json.id } });
    }
    shared.response(res, '', {}, 'Details Updated Successfully')
})