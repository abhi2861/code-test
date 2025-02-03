//Utils
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
//Controller
const shared = require('./shared');
const document = require('./document')

//Model
const Company = require('../models/company');
const InvestmentOpportunity = require('../models/investmentOpportunity');
const InterestSurvey = require('../models/interestSurvey');
const BulletinBoard = require('../models/bulletinBoard');
const InterestCapture = require('../models/interestCapture');
const UserInvestment = require('../models/userInvestment');
const User = require('../models/user');
const AppError = require("./../utils/appError");
const TeamMembers = require('../models/teamMembers');


exports.companyCreate = catchAsync(async (req, res) => {
  let logoResponse, companyProfileResponse, message;
  const json = {
    id: req.body.id,
    loggedInUserId: req.body.loggedInUserId,
    name: req.body.name,
    description: req.body.description,
    logo: req.body.logo,
    companyProfile: req.body.companyProfile
  }
  await shared.validateRequestBody(json, ['id', 'companyProfile']);

  // Upload logo file to S3
  if (json.logo?.base64Data) {
    logoResponse = await document.uploadFileToS3(json.logo);
  }

  // Upload companyProfile file to S3
  if (json.companyProfile?.base64Data) {
    companyProfileResponse = await document.uploadFileToS3(json.companyProfile);
  }

  const obj = {
    name: req.body.name,
    description: req.body.description,
    logo: logoResponse ?? json.logo,
    companyProfile: companyProfileResponse ?? json.companyProfile,
    createdBy: json.loggedInUserId
  }
  if (json.id) {
    await Company.update(obj, { where: { id: json.id } });
    message = 'Company updated successfully';
  } else {
    await Company.create(obj);
    message = 'Company created successfully'
  }

  shared.response(res, '', {}, message)
})

// Read
exports.getCompany = catchAsync(async (req, res) => {
  const json = {
    loggedInUserId: req.body.loggedInUserId,
    status: req.query.status
  }
  await shared.validateRequestBody(json, ['status']);
  let input = { active: true }
  if (json.status) {
    input['status'] = json.status;
  }

  const companies = await Company.findAll({
    where: { active: true },
    attributes: ['id', 'name', 'logo', 'companyProfile', 'description', 'fmvValue', 'fmvVEffectiveDate', 'fmvVExpirationDate', 'fmvlastFairMarketValue'],
    include: [
      {
        model: UserInvestment,
        where: input,
        required: false,
        attributes: ['id', 'investmentId', 'amount', 'companyId', 'userId', 'status', 'noOfUnits', 'requestedDate'],
        include: [
          {
            model: User,
            where: { active: true },
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: InvestmentOpportunity,
            where: { active: true },
            attributes: ['id', 'name'],
          },
        ]
      },
    ],
    order: [['id', 'DESC']],
  });

  const updatedCompanies = companies?.map(company => {
    const companyObject = company.toJSON()
    const investorData = companyObject?.userInvestments?.map(investment => ({
      userInvestmentId: investment?.id,
      investmentName: investment?.InvestmentOpportunity?.name,
      investor: `${investment?.User?.firstName} ${investment?.User?.lastName}`,
      amount: investment?.amount,
      status: investment?.status,
      currentValue: shared.parseToDecimals(investment?.noOfUnits * companyObject?.fmvValue) ?? null
    }));
    delete companyObject?.userInvestments;
    const totalFund = company.toJSON()?.userInvestments?.reduce((total, investment) => {
      const amount = parseFloat(investment.amount);
      return total + amount;
    }, 0)
    const totalFunds = shared.parseToDecimals(totalFund)
   
    return {
      ...companyObject,
      peopleInvested: company.toJSON()?.userInvestments?.length,
      fundsRaised: totalFunds,
      investorData: investorData,
    };
  });

  shared.response(res, updatedCompanies)

})

//Delete
exports.deleteCompany = catchAsync(async (req, res) => {
  const json = {
    id: req.query.id,
    loggedInUserId: req.body.loggedInUserId
  }
  await shared.validateRequestBody(json);

  const investment = await InvestmentOpportunity.findAll({
    where: {
      companyId: json.id,
      active: true
    }
  });

  if (investment.length > 0) {
    throw new AppError("Investment opportunity already exists for this company.", 400);
  }
  else {
    const companies = await Company.update({ active: false }, { where: { id: json.id } });
    shared.response(res, companies, {}, 'Deleted Successfully')
  }
})

//GET SURVEY, COMPANY, INVESTMENT OPPORTUNITY DETAILS 
exports.getDetailsByCompanyId = catchAsync(async (req, res) => {
  let include = [];
  const json = {
    loggedInUserId: req.body.loggedInUserId,
    companyId: req.query.companyId,
    investmentId: req.query.investmentId
  }
  await shared.validateRequestBody(json, ['loggedInUserId','investmentId']);
  const startDate = moment.tz('America/Los_Angeles').startOf('day').utc().toDate();
  const endDate = moment.tz('America/Los_Angeles').endOf('day').utc().toDate();
  let input = {
    active: true,
    investmentStatus: { [Op.not]: 'EndInvestment' },
    startDate: { [Op.lt]: endDate },
    endDate: { [Op.gte]: startDate },
    id: json.investmentId
  }

  include.push({
    model: BulletinBoard,
    separate: true,
    order: [['id', 'DESC']],
    attributes: ["id", "subject", "message", "isPublished", "publishedDate", "source"]
  });

  include.push({
    model: InvestmentOpportunity,
    separate: true,
    where: input,
    order: [['id', 'DESC']],
    attributes: ['id', 'startDate', 'endDate', 'minAmount', 'carry', 'name', 'description', 'document', 'notes', 'companyId', 'templateId', 'perUnitPrice', 'investmentStatus'],
    include: [
      {
        model: UserInvestment,
        where: {
          userId: json.loggedInUserId,
          investmentId: json.investmentId
        },
        separate: true,
        order: [['id', 'DESC']],
        limit: 1,
        attributes: ['id', 'status']
      }]
  });

  include.push({
    model: InterestSurvey,
    separate: true,
    where: {
      active: true,
      startDate: { [Op.lt]: endDate },
      endDate: { [Op.gte]: startDate },
    },
    order: [['id', 'DESC']],
    attributes: ['id', 'investmentRange', 'startDate', 'endDate', 'name', 'description', 'document', 'notes'],
    include: [
      {
        model: InterestCapture,
        where: {
          userId: json.loggedInUserId,
        },
        separate: true,
        order: [['id', 'DESC']],
        attributes: ['id', 'interestSurveyId', 'interestedYN', 'committedYN', 'contactedYN', 'amount']
      }]
  });

  const companyDetails = await Company.findOne({
    where: { id: json.companyId },
    attributes: ['name', 'description', 'logo', 'companyProfile'],
    include: include
  });

  const response = companyDetails.toJSON();

  response.InvestmentOpportunities = response.InvestmentOpportunities.map(opportunity => {
    const userInvestment = opportunity.userInvestments[0];
    const applied = userInvestment && userInvestment.status === 'Applied' ? true : false;
    delete opportunity.userInvestments;
    return {
      ...opportunity,
      applied: applied
    };
  });
  response.interestSurveys = response.interestSurveys.reduce((flattened, interestSurvey) => {
    if (interestSurvey.interestCaptures.length > 0) {
      interestSurvey.interestCaptures.forEach(interestCapture => {
        flattened.push({
          investmentRange: interestSurvey?.investmentRange,
          startDate: interestSurvey?.startDate,
          endDate: interestSurvey?.endDate,
          interestCaptureId: interestCapture?.id,
          name: interestSurvey?.name,
          description: interestSurvey?.description,
          document: interestSurvey?.document,
          note: interestSurvey?.note,
          ...interestCapture
        });
      });
    } else {
      flattened.push({
        interestSurveyId: interestSurvey?.id,
        investmentRange: interestSurvey?.investmentRange,
        startDate: interestSurvey?.startDate,
        endDate: interestSurvey?.endDate,
        interestedYN: false,
        committedYN: false,
        contactedYN: false,
        amount: 0,
        name: interestSurvey?.name,
        description: interestSurvey?.description,
        document: interestSurvey?.document,
        note: interestSurvey?.note,
      })
    }
    return flattened;
  }, []);
  shared.response(res, response);

})

exports.updateFMV = catchAsync(async (req, res) => {
  let json = {
    loggedInUserId: req.body.loggedInUserId,
    companyId: req.body.companyId,
    fmvValue: req.body.fmvValue,
    fmvVEffectiveDate: req.body.fmvVEffectiveDate ? shared.convertPacificTimeToUTC(req.body.fmvVEffectiveDate, 'start') : new Date(),
    fmvlastFairMarketValue: req.body.fmvlastFairMarketValue
  }
  await shared.validateRequestBody(json, ['loggedInUserId', 'fmvlastFairMarketValue']);

  await Company.update({ fmvValue: json.fmvValue, fmvVEffectiveDate: json.fmvVEffectiveDate, fmvlastFairMarketValue: json?.fmvlastFairMarketValue }, { where: { id: json.companyId } });
  await InvestmentOpportunity.update({ fmvValue: json.fmvValue, fmvVEffectiveDate: json.fmvVEffectiveDate, fmvlastFairMarketValue: json?.fmvlastFairMarketValue }, { where: { companyId: json.companyId } });

  shared.response(res, '')

})


exports.getAllCompany = catchAsync(async (req, res) => {
  const input = {
    active: true
  }
  const companies = await Company.findAll({
    where: { active: true },
    attributes: ['id', 'logo', 'name'],
    order: [['id', 'DESC']],
    include: [
      {
        model: UserInvestment,
        where: input,
        required: true,
        attributes: [],

      }
    ]
  })
  shared.response(res, companies)
})

exports.getTeam = catchAsync(async (req, res) => {

  const teamMembers = await TeamMembers.findAll({
    where: { active: true },
  })
  shared.response(res, teamMembers)
})