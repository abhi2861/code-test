//Importing Models 
const User = require('../models/user');
const Company = require('../models/company');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const { v1: uuidv1 } = require('uuid');
// Importing Utils
const catchAsync = require('./../utils/catchAsync');
const shared = require('./shared');
const UserInvestment = require('../models/userInvestment');
const InvestmentOpportunity = require('../models/investmentOpportunity');
const document = require("../controllers/document.js");
const AppError = require('../utils/appError.js');

exports.getUsersList = catchAsync(async (req, res) => {
    const json = {
        loggedInUserId: req.body.loggedInUserId,
        status: req.query.status,
        role: req.query.role
    }
    await shared.validateRequestBody(json, ['status']);
    let input = { active: true }, data = { active: true }, admin;
    if (json.status) {
        input['status'] = json.status;
    }

    if (json.role === 'admin') {
        data['roleId'] = 2,
            data['profileType'] = { [Op.ne]: null }
    }
    if (json.role === 'superAdmin') {
        data['roleId'] = { [Op.in]: [1, 2] };
    }
    let users = await User.findAll({
        where: data,
        attributes: ['id', 'firstName', 'lastName', 'email', 'addressline1', 'city', 'state', 'zipcode', 'country', 'lastLoginDate', 'email', 'profileType', 'accreditation', 'roleId', 'phone', 'kycApproved', 'documents'],
        include: [
            {
                model: UserInvestment,
                where: input,
                required: false,
                attributes: ['id', 'investmentId', 'amount', 'companyId', 'userId', 'status', 'noOfUnits'],
                include: [
                    {
                        model: InvestmentOpportunity,
                        where: { active: true },
                        order: [['id', 'DESC']],
                        attributes: ['id', 'companyId', 'name',],
                        include: [
                            {
                                model: Company,
                                where: { active: true },
                                order: [['id', 'DESC']],
                                attributes: ['id', 'name', 'logo', 'companyProfile', 'description', 'fmvValue', 'fmvVEffectiveDate', 'fmvVExpirationDate', 'fmvlastFairMarketValue'],
                            },
                        ]
                    }
                ],
            },
        ],
        order: [['id', 'DESC']]
    })

    if (json.role === 'superAdmin') {
        admin = users.filter(v => v.roleId === 1 ? v : null);
        users = users.filter(v => v.roleId === 2 ? v : null);
    }
    const usersList = users.map(User => {
        const user = User.toJSON();
        const investmetDetails = user?.userInvestments?.map(investment => ({
            investmentId: investment?.id,
            amount: investment?.amount,
            investmentStatus: investment?.status,
            companyFmvValue: investment?.InvestmentOpportunity?.company?.fmvValue,
            currentValue: shared.parseToDecimals(investment?.InvestmentOpportunity?.company?.fmvValue * investment?.noOfUnits) ?? null,
            investmentName: investment?.InvestmentOpportunity?.name,
            companyName: investment?.InvestmentOpportunity?.company?.name,
            companyLogo: investment?.InvestmentOpportunity?.company?.logo,
        }));

        const totalFund = user?.userInvestments?.reduce((total, investment) => {
            const amount = parseFloat(investment.amount);
            return total + amount;
        }, 0);
        const totalCurrentValue = user?.userInvestments?.reduce((total, investment) => {
            const currentValue = investment?.InvestmentOpportunity?.company?.fmvValue * investment?.noOfUnits;
            return total + (currentValue ?? 0);
        }, 0);
        const totalFunds = shared.parseToDecimals(totalFund)
        return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            address: [{
                addressline1: user.addressline1,
                city: user.city,
                state: user.state,
                zipcode: user.zipcode,
                country: user.country
            }],
            lastLoginDate: user.lastLoginDate,
            email: user.email,
            profileType: user.profileType,
            investmetDetails,
            totalFund: totalFunds,
            totalCurrentValue,
            accreditation: user.accreditation,
            phone: user.phone,
            kycApproved: user.kycApproved,
            documents: user.documents

        };
    });

    shared.response(res, usersList, { adminList: admin })
})

exports.getCounts = catchAsync(async (req, res) => {
    const users = await User.count({
        where: {
            roleId: 2,
            active: true,
            profileType: { [Op.ne]: null }
        }
    })

    const companies = await Company.count({
        where: {
            active: true
        }
    })

    const activeApplications = await UserInvestment.count({
        where: {
            active: true,
            status: { [Op.notIn]: ['Rejected', 'Closed', 'Refund Received', 'Initiate Refund', 'Exit Proceeds Distributed'] }
        },
        attributes: ['id', 'investmentId', 'status'],
        include: [
            {
                model: Company,
                where: { active: true },
                attributes: ['id'],
            },
            {
                model: User,
                where: { active: true },
                attributes: ['id'],
            },
            {
                model: InvestmentOpportunity,
                where: {
                    active: true,
                    investmentStatus: { [Op.not]: 'EndInvestment' }
                },
                attributes: ['id'],
            },
        ]
    })
    const startDate = moment.tz('America/Los_Angeles').startOf('day').utc().toDate();
    const endDate = moment.tz('America/Los_Angeles').endOf('day').utc().toDate();

    let input = {
        active: true,
        investmentStatus: { [Op.lt]: ['EndInvestment'] },
        [Op.or]: [
            {
                startDate: { [Op.lt]: endDate },
                endDate: { [Op.gte]: startDate },
            },
            { startDate: { [Op.gt]: endDate }, },
        ],
    }
    const totalInvestments = await InvestmentOpportunity.count({ where: input })

    const counts = {
        activeApplications,
        companies,
        users,
        totalInvestments
    }

    shared.response(res, counts)
});


exports.uploadKycDoc = catchAsync(async (req, res) => {

    const userId = req.body.loggedInUserId;

    let kycDocResFromS3 = await document.uploadFileToS3(req.body.document);

    if (kycDocResFromS3) {
        kycDocResFromS3 = kycDocResFromS3.split(".com/")[1]
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.documents = Array.isArray(user.documents) ? user.documents : [];

        const updatedUserDocuments = [...user.documents, {
            document: {
                fileName: req.body.document.fileName,
                fileLink: kycDocResFromS3
            },
            documentType: req.body.documentType,
            documentSide: req.body.documentSide,
            d_id: uuidv1(),
            createdAt: new Date()
        }];

        user.documents = updatedUserDocuments;
        await user.save();
        return res.status(200).json({
            message: 'KYC document uploaded successfully',
            kycDocument: user.documents,
        });
    } else {
        return res.status(500).json({ message: 'Error uploading KYC document to S3' });
    }
});

exports.updateKycDocData = catchAsync(async (req, res) => {
    const userId = req.body.loggedInUserId;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    let kycDocS3FileLink;

    if (Object.prototype.hasOwnProperty.call(req.body.document, "base64Data")) {

        let fileExistingDocInS3 = user.documents?.filter((doc) => {
            return doc.d_id == req.body.d_id
        })
        if (fileExistingDocInS3.length > 0) {
            let fileExistingDocInS3Link = fileExistingDocInS3[0].document?.fileLink;
            await document.deleteFileFromS3(fileExistingDocInS3Link)
        }
        let kycDocResFromS3 = await document.uploadFileToS3(req.body.document);
        kycDocS3FileLink = kycDocResFromS3.split(".com/")[1]

    } else {
        kycDocS3FileLink = req.body.document?.fileLink
    }



    let updateDocument = {
        d_id: req.body.d_id,
        document: {
            fileName: req.body.document.fileName,
            fileLink: kycDocS3FileLink,
        },
        documentType: req.body.documentType,
        documentSide: req.body.documentSide
    }
    let updatedDocument = user.documents.map(doc => {
        if (doc.d_id === req.body.d_id) {
            doc = updateDocument;
            return doc;
        } else {
            return doc
        }
    });

    user.documents = updatedDocument;
    await user.save()

    return res.status(200).json({
        message: 'KYC document Updated successfully',
        kycDocument: user.documents,
    });


})

exports.deleteKycDoc = catchAsync(async (req, res) => {
    const userId = req.body.loggedInUserId;
    const doc_id = req.body.d_id;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    let fileExistingDocInS3 = user.documents?.filter((doc) => {
        return doc.d_id == req.body.d_id
    })
    if (fileExistingDocInS3.length > 0) {
        let fileExistingDocInS3Link = fileExistingDocInS3[0].document?.fileLink;
        await document.deleteFileFromS3(fileExistingDocInS3Link)
    }

    let documentsAfterRemove = user.documents?.filter(ele => ele.d_id != doc_id);
    user.documents = documentsAfterRemove;
    user.save();
    return res.status(200).json({
        message: 'KYC document deleted successfully',

    });
})
// Approve Kyc from admin
exports.approveUserKyc = catchAsync(async (req, res) => {
    const userId = req.body.userId;
    const approval_status = req.body.isApproved;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.kycApproved = approval_status;
    await user.save();
    return res.status(200).json({
        message: "Approval status has changed",
        kycApprove: approval_status
    });
})
exports.getUserKyc = catchAsync(async (req, res) => {
    const userId = req.body.loggedInUserId;
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (user.documents) {
        const userDocuments = user.documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({
            message: "Document Retrived Succesfully!",
            documents: userDocuments,
            userId
        })
    } else {
        return res.status(200).json({
            message: "No Documents found",
            userId
        })
    }

})

exports.getUsers = catchAsync(async (req, res) => {

    const users = await User.findAll({
        where: {
            active: true,
            roleId: 2,
            profileType: { [Op.ne]: null }
        },
        attributes: ['id', 'firstName', 'lastName'],
        order: [['id', 'DESC']],

    })
    const userList = users.map(user => {
        return {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`
        }
    })
    shared.response(res, userList)
});

exports.getUserPortfolio = catchAsync(async (req, res) => {
    let inputObj = {
        userId: req.body.loggedInUserId,
        status: "Closed",
        active: true
    }
    const userInvestments = await UserInvestment.findAll({
        where: inputObj,
        order: [['id', 'DESC']],
        attributes: ['id', 'investmentId', 'status', 'amount', 'noOfUnits', 'investmentKey', 'estimatedSharesAtInvestment', 'estimatedSharesToday', 'userId', 'notes', 'carry', 'netCommitment'],
        include: [
            {
                model: Company,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'logo', 'name']
            },
            {
                model: InvestmentOpportunity,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'name', 'investmentType', 'fmvValue', 'perUnitPrice']
            }
        ],
    });
    let userPortfolioData = userInvestments.map((ele) => {
        return { ...ele.get(), currentValue: ((ele.estimatedSharesToday && ele.InvestmentOpportunity?.fmvValue) ? Number.parseFloat(Number.parseFloat(ele.estimatedSharesToday) * Number.parseFloat(ele.InvestmentOpportunity?.fmvValue)).toFixed(2) : 0.0) };
    })
    let totalData = {
        totalOfNetCommitment: 0,
        totalOfEstimateCurrentValue: 0
    }

    for (let ele of userPortfolioData) {
        totalData.totalOfNetCommitment += ele.netCommitment ? (Number.parseFloat(ele.netCommitment)) : 0.0;
        totalData.totalOfEstimateCurrentValue += ele.currentValue ? (Number.parseFloat(ele.currentValue)) : 0.0;
    }
    shared.response(res, { portfolioData: userPortfolioData, calculatedData: { totalOfNetCommitment: totalData.totalOfNetCommitment.toFixed(2), totalOfEstimateCurrentValue: totalData.totalOfEstimateCurrentValue.toFixed(2) } })
})

exports.getApplicationForUser = catchAsync(async (req, res) => {
    let input = { active: true, status: { [Op.notIn]: ['Rejected'] }, userId: req.body.loggedInUserId };

    const json = {
        status: req.query.status,
    }
    await shared.validateRequestBody(json);

    const allowedStatusValues = ['Active', 'Rejected'];
    if (!allowedStatusValues.includes(json.status)) {
        throw new AppError("Invalid value for status. Allowed values are: Active, Rejected", 400);
    }
    if (json.status === 'Active') {
        input.status[Op.notIn] = [
            ...input.status[Op.notIn],
            'Refund Received', 'Initiate Refund', 'Closed', 'Exit Proceeds Distributed']
    }

    if (json.status === 'Rejected') {
        input['status'] = { [Op.in]: ['Rejected'] };

    }
    const userInvestments = await UserInvestment.findAll({
        where: input,
        order: [['id', 'DESC']],
        attributes: ['id', 'investmentId', 'status', 'amount', 'noOfUnits', 'notes', 'requestedDate', 'carry'],
        include: [
            {
                model: Company,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'logo', 'name']
            },
            {
                model: InvestmentOpportunity,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['id', 'name']
            }
        ],
    });

    shared.response(res, userInvestments)

})