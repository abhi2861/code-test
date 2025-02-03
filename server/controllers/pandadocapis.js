//Utils
const catchAsync = require('../utils/catchAsync');
const axios = require('axios');

//Controller
const shared = require('./shared');
const Template = require('../models/template');
const MasterData = require('../models/masterData');
const UserInvestment = require('../models/userInvestment');
const InvestmentOpportunity = require('../models/investmentOpportunity');
const User = require('../models/user');
const StatusHistory = require('../models/statusHistory');

//Get templates By Panda doc
exports.getTemplatesByPandaDoc = catchAsync(async (req, res) => {
    const url = process.env.TEMPLATE_URL

    // Sending POST request to PandaDoc API
    const response = await axios.get(url, {
        headers: {
            Authorization: `API-Key ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
        }
    })
    shared.response(res, response?.data?.results);
})


//Get templates By Template Table
exports.getTemplatesByTable = catchAsync(async (req, res) => {
    const response = await Template.findAll({
        where: { active: true },
        attributes: ['id', 'template_id', "fields", "value", "templateName"]
    })
    shared.response(res, response);
})

// Get templates By template Id of panda doc
exports.getDetailsByTemplateId = catchAsync(async (req, res) => {
    const json = {
        id: req.query.template_id
    }
    await shared.validateRequestBody(json);
    const url = process.env.TEMPLATE_URL + `/${req.query.template_id}/details`

    // Sending POST request to PandaDoc API
    const response = await axios.get(url, {
        headers: {
            Authorization: `API-Key ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
        }
    })
    shared.response(res, response?.data);
})

// Create Document by Template
exports.createDocumentByTemplate = catchAsync(async (req, res) => {
    let templates = {}, filledTemplate, document_id, message;

    const json = {
        userInvestmentId: req.body.userInvestmentId,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);

    const Investment = await UserInvestment.findByPk(json.userInvestmentId, {
        attributes: ['amount'],
        include: [
            {
                model: InvestmentOpportunity,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['carry', 'name', 'templateId'],
            },
            {
                model: User,
                where: { active: true },
                order: [['id', 'DESC']],
                attributes: ['firstName', 'lastName', 'profileType', 'email'],
            }
        ],
        order: [['id', 'DESC']],
    })
    if (Investment?.InvestmentOpportunity?.templateId) {
        templates = await Template.findByPk(Investment.InvestmentOpportunity.templateId, {
            where: { active: true },
            attributes: ['json', 'template_id', 'templateName']
        })
        let templateFromDB = templates.json;
        filledTemplate = templateFromDB.replace(/\${Investment\.(.*?)}/g, (match, p1) => {
            if (p1.includes(".")) {
                const [objectName, propertyName] = p1.split('.');
                return Investment[objectName][propertyName]
            } else {
                return Investment[p1]
            }
        });
    }
    await UserInvestment.update({ status: 'Approved', requestedJSON: filledTemplate }, { where: { id: json.userInvestmentId } });
    await StatusHistory.create({
        userInvestmentId: json.userInvestmentId,
        status: 'Approved',
        date: new Date()
    });
    message = 'Application approved successfully'

    if (process.env.API_KEY) {

        // API endpoint
        const url = process.env.DOCUMENT_URL;

        // Payload for creating a document
        const payload = {
            name: templates.templateName,
            template_uuid: templates.template_id,
            fields: filledTemplate.replace(/^'|'$/g, ''),
            recipients: [
                {
                    "role": 'Client',
                    "email": Investment?.User?.email
                }
            ]
        };
        // Sending POST request to PandaDoc API
        const document = await axios.post(url, payload, {
            headers: {
                Authorization: `API-Key ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        document_id = document?.data?.id;
        // if (document_id) {
        //     // API endpoint
        //     const sendDocumentUrl = process.env.DOCUMENT_URL + `/${document_id}/send`
        //     // Sending POST request to PandaDoc API
        //     response = await axios.post(sendDocumentUrl, payload, {
        //         headers: {
        //             Authorization: `API-Key ${process.env.API_KEY}`,
        //             'Content-Type': 'application/json'
        //         }
        //     })
        // }
        // await UserInvestment.update({ status: 'Document Sent to Investor'}, { where: { id: json.userInvestmentId } });
        // await StatusHistory.create({
        //     userInvestmentId: json.userInvestmentId,
        //     status: 'Document Sent to Investor',
        //     date: new Date()
        // });
        message = 'Document Created Successfully'
    }

    shared.response(res, document_id, {}, message);
})


exports.saveTemplateData = catchAsync(async (req, res) => {
    let response, template = '{';
    const json = {
        id: req.body.id,
        template_id: req.body.template_id,
        templateName: req.body.templateName,
        fields: req.body.fields,
        value: req.body.values,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json, ['id']);

    json.fields.forEach((field, index) => {
        template += `"${field}": { "value":  ${json.value[index].includes("Investment.") ? '"${' + json.value[index] + '}"' : '"${Investment.' + json.value[index] + '}"'}},`;
    });
    template = template.slice(0, -1);
    template += '}';
    if (json.id) {
        response = await Template.update({ fields: json.fields, value: json.value, json: template, updatedBy: json.loggedInUserId }, { where: { id: json.id } });
    } else {
        json['createdBy'] = json.loggedInUserId;
        json['json'] = template;
        response = await Template.create(json);
    }


    shared.response(res, response);
})

// Get Document Status for eg: viewed, sent, signed
exports.getDocumentStatus = catchAsync(async (req, res) => {
    const json = {
        id: req.query.document_id,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);

    const url = process.env.DOCUMENT_URL + `/${req.query.document_id}`

    // Sending POST request to PandaDoc API
    const response = await axios.get(url, {
        headers: {
            Authorization: `API-Key ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
        }
    })
    shared.response(res, response?.data?.status);
})

exports.getMasterData = catchAsync(async (req, res) => {
    const json = {
        type: req.query.type,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json, ['loggedInUserId']);
    const response = await MasterData.findAll({
        where: { type: json.type, active: true },
        order: [['order', 'ASC']],
        attributes: ['value', 'order'],
    })
    shared.response(res, response);
})