const { S3Client, PutObjectCommand, GetObjectCommand,DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v1: uuidv1 } = require('uuid');
const { Op } = require("sequelize");
//Utils
const AppError = require('./../utils/appError')
const catchAsync = require('../utils/catchAsync');

const shared = require('./shared');

//Models
const Document = require('../models/document');
const User = require('../models/user');

//Environment Variable
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const bucketName = process.env.BUCKET_NAME;
const expirationTime = process.env.DOCUMENT_EXPIRATION_TIME;

exports.uploadFileToS3 = async (fileObject) => {
    try {
        const { fileType, base64Data, fileName } = fileObject;

        if (!fileType || !base64Data || !fileName) {
            throw new Error('Missing required fields in file object');
        }
        // Decode base64 data
        const fileBuffer = await shared.base64conversion(base64Data);
        const filePath = process.env.AWS_FOLDER_NAME + '/' + uuidv1() + fileName.replace(/\s/g, '');
        // Create upload params
        const uploadParams = {
            Bucket: bucketName,
            Key: filePath,
            Body: fileBuffer,
            ContentType: fileType
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        const uploadResult = await s3.send(uploadCommand);

        if (uploadResult && uploadResult.$metadata && uploadResult.$metadata.httpStatusCode === 200) {
            return `https://${bucketName}.s3.amazonaws.com/${filePath}`;
        } else {
            throw new Error('Failed to upload file to S3');
        }
    } catch (error) {
        throw new AppError("Error uploading file: " + error, 400);
    }
}

exports.deleteFileFromS3 = async (fileObject) =>{
    try {
        if (!fileObject) {
            throw new Error('File path is required');
        }

        // Create delete params
        const deleteParams = {
            Bucket: bucketName,  
            Key: fileObject       
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        const deleteResult = await s3.send(deleteCommand);

        if (deleteResult && deleteResult.$metadata && deleteResult.$metadata.httpStatusCode === 204) {
            return `File ${fileObject} deleted successfully from S3`;
        } else {
            throw new Error('Failed to delete file from S3');
        }
    } catch (error) {
        throw new AppError("Error deleting file: " + error, 400);
    }
}
//this will be used for private URL
exports.generatePreSignedUrl = async (objectKey, expirationInSeconds) => {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
        Expires: expirationInSeconds
    };

    // Create a GetObjectCommand
    const command = new GetObjectCommand(params);

    // Get the pre-signed URL
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: expirationInSeconds });

    return signedUrl;
}

//document Upload Api
exports.documentUpload = catchAsync(async (req, res) => {
    let documentResponse, input = { active: true }, getDocuments;
    const json = {
        loggedInUserId: req.body.loggedInUserId,
        document: req.body.document,
        userId: req.body.userId,
        folder_0: req.body.folder_0,
        folder_1: req.body.folder_1,
        id: req.body.id,
        docLink: req.body.docLink,
        action: req.body.action
    }
    await shared.validateRequestBody(json, ['document', 'id', 'docLink', 'folder_0', 'folder_1', 'action']);

    if (json.folder_0 && json.action === 'investmentDoc') {
        const opportunityInput = {
            userId: json.userId,
            folder_0: json.folder_0,
            active: true
        };

        let existingFolder = await Document.findOne({
            where: opportunityInput,
            attributes: ['id', 'folder_0']
        });

        if (!existingFolder) {
            await Document.create({
                userId: json.userId,
                folder_0: json.folder_0,
                folder_1: null,
                uploadedBy: json.loggedInUserId,
                docLink: null,
                fileName: null,
                uploadedDate: new Date()
            });
        }
    }

    if (!json.document && json.action === 'action') {
        input['userId'] = json.userId

        if (json.folder_0) {
            input['folder_0'] = json.folder_0
        }
        if (json.folder_1 && json.folder_0) {
            input['folder_0'] = json.folder_0
            input['folder_1'] = json.folder_1
        }

        let documents = await Document.findAll({
            where: input,
            attributes: ['id', 'userId', 'folder_0', 'folder_1', 'docLink', 'uploadedBy', 'uploadedDate', 'fileName', 'id', 'updatedAt'],
            order: [['id', 'DESC']]
        })
        if (documents.length > 0) {
            const folder = documents.filter(obj => obj.id && obj.folder_0 && !obj.docLink)
            if (folder) {
                throw new AppError("Folder name already exists", 400);
            }
        }
    }
    const obj = {
        userId: json.userId,
        folder_0: json.folder_0,
        folder_1: json.folder_1
    }


    // Upload logo file to S3
    if (Array.isArray(json.document)) {
        for (let doc of json.document) {
            if (doc.base64Data && doc.fileName) {
                documentResponse = await this.uploadFileToS3(doc);
                if (documentResponse) {
                    documentResponse = documentResponse.split(".com/")[1]
                }

                obj['docLink'] = documentResponse;
                obj['uploadedBy'] = json.loggedInUserId;
                obj['fileName'] = doc.fileName;
                obj['uploadedDate'] = new Date();

                await Document.create(obj);
            }
        }
    } else if (json.document?.base64Data && json.document?.fileName) {
        documentResponse = await this.uploadFileToS3(json.document);
        if (documentResponse) {
            documentResponse = documentResponse.split(".com/")[1]
        }
        obj['docLink'] = documentResponse;
        obj['uploadedBy'] = json.loggedInUserId;
        obj['fileName'] = json.document.fileName;
        obj['uploadedDate'] = new Date();

        await Document.create(obj);
    }
    else if (json.id && json.action === 'move') {

        getDocuments = await Document.findByPk(json.id,
            { attributes: ['id', 'userId', 'folder_0', 'folder_1'] })

        let folder_0 = getDocuments.folder_0
        let folder_1 = getDocuments.folder_1

        if (folder_0 === json.folder_0 && folder_1 === json.folder_1) {
            throw new AppError("Document already exist in the same folder", 400);
        }

        obj['updatedBy'] = json.loggedInUserId;
        await Document.update(obj, { where: { id: json.id } });
    } else {
        await Document.create(obj);
    }
    shared.response(res, '', {}, 'Document created successfully')
})

//Get document api
exports.getDocuments = catchAsync(async (req, res) => {
    let input = { active: true }, response;
    const json = {
        loggedInUserId: req.body.loggedInUserId,
        role: req.query.role
    }
    await shared.validateRequestBody(json, ['userId']);

    if (json.role === 'user') {
        input['userId'] = json.loggedInUserId;
        response = await Document.findAll({
            where: input,
            attributes: ['userId', 'folder_0', 'folder_1', 'docLink', 'uploadedBy', 'uploadedDate', 'fileName', 'id', 'updatedAt'],
            order: [['id', 'DESC']]
        })
    } else if (json.role === 'admin') {
        input['profileType'] = { [Op.ne]: null };
        input['roleId'] = { [Op.ne]: 1 }
        response = await User.findAll({
            where: input,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            order: [['id', 'DESC']],
            include: [
                {
                    model: Document,
                    required: false,
                    where: { active: true },
                    order: [['id', 'DESC']],
                    attributes: ['userId', 'folder_0', 'folder_1', 'docLink', 'uploadedBy', 'uploadedDate', 'fileName', 'id', 'updatedAt'],
                }
            ]
        })
    }

    shared.response(res, response)
})

exports.getDocumentLink = catchAsync(async (req, res) => {
    const json = {
        loggedInUserId: req.body.loggedInUserId,
        docLink: req.body.docLink
    }
    await shared.validateRequestBody(json);
    const docLink = await this.generatePreSignedUrl(json.docLink, expirationTime);
    shared.response(res, docLink)
})

//Delete
exports.deleteDocument = catchAsync(async (req, res) => {
    const json = {
        id: req.query.id,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);

    const documents = await Document.update({ active: false, updatedBy: json.loggedInUserId }, { where: { id: json.id } });

    shared.response(res, documents, {}, 'Deleted Successfully')

});


const addDocumentToResponse = (doc, response) => {
    if (doc.docLink) {
        response.files.push({
            id: doc.id,
            docLink: doc.docLink,
            folder_0: doc.folder_0,
            folder_1: doc.folder_1,
            uploadedBy: `${doc?.UploadedByUser?.firstName} ${doc?.UploadedByUser?.lastName}`,
            uploadedRoleId: doc?.UploadedByUser?.roleId,
            uploadedDate: doc.uploadedDate,
            fileName: doc.fileName
        });
    }
};

exports.getFilesByFolderName = catchAsync(async (req, res) => {
    let folderParts, response = { files: [], folder: [] }, uniqueFolders = new Set();

    const json = {
        loggedInUserId: req.body.loggedInUserId,
        userId: req.query.userId,
        folderName: req.query.folderName,
    };

    await shared.validateRequestBody(json, ['folderName']);

    const docInput = {
        active: true,
        userId: json.userId,
    };

    if (json.folderName) {
        const trimmedFolderName = json.folderName.trim();
        folderParts = trimmedFolderName.split('/').filter(part => part.length > 0);

        if (folderParts.length === 1) {
            docInput.folder_0 = folderParts[0] + '/';
        }
        if (folderParts.length === 2) {
            docInput.folder_1 = folderParts[1] + '/';
        }
    }
    const documents = await Document.findAll({
        where: docInput,
        order: [['folder_0', 'ASC'], ['folder_1', 'ASC'], ['id', 'DESC']],
        attributes: ['id', 'folder_0', 'folder_1', 'docLink', 'uploadedBy', 'uploadedDate', 'fileName'],
        include: [
            {
                model: User,
                as: 'UploadedByUser',
                required: false,
                order: [['id', 'DESC']],
                attributes: ['id', 'firstName', 'lastName', 'roleId'],
            }
        ]
    });
    documents.forEach(doc => {
        if (json.folderName) {
            if (folderParts.length === 1) {
                if (doc.folder_1) {
                    const subFolderName = `${doc.folder_0}${doc.folder_1}`;
                    if (!uniqueFolders.has(subFolderName)) {
                        response.folder.push({
                            type: 'sub_folder',
                            folderName: subFolderName,
                        });
                        uniqueFolders.add(subFolderName);
                    }
                } else {
                    addDocumentToResponse(doc, response);
                }
            }
            if (folderParts.length === 2) {
                addDocumentToResponse(doc, response);
            }
        } else {
            if (doc.folder_0 === null && doc.folder_1 === null) {
                addDocumentToResponse(doc, response);
            }

            if (doc.folder_0) {
                if (!uniqueFolders.has(doc.folder_0)) {
                    response.folder.push({
                        type: 'main_folder',
                        folderName: doc.folder_0,
                    });
                    uniqueFolders.add(doc.folder_0);
                }
            }
        }
    });

    // Send the response
    shared.response(res, response);
});

exports.getAllFolderName = catchAsync(async (req, res) => {
    let response = [], uniqueFolders = new Set(), docInput = { active: true };

    const json = {
        loggedInUserId: req.body.loggedInUserId,
        userId: req.query.userId,
    };
    await shared.validateRequestBody(json);

    docInput['userId'] = json.userId;

    const documents = await Document.findAll({
        where: docInput,
        order: [['folder_0', 'ASC'], ['folder_1', 'ASC'], ['id', 'DESC']],
        attributes: ['id', 'folder_0', 'folder_1', 'docLink', 'userId', 'uploadedDate', 'fileName'],
        include: [
            {
                model: User,
                as: 'User',
                required: false,
                order: [['id', 'DESC']],
                attributes: ['id', 'firstName', 'lastName', 'roleId'],
            }
        ]
    });
    documents.map(doc => {
        if (doc.docLink === null) {
            if (doc.folder_0 != null && doc.folder_1 === null) {
                const mainFolderPath = `${doc.folder_0}`;
                if (!uniqueFolders.has(mainFolderPath)) {
                    response.push({
                        type: 'main_folder',
                        folder_0: doc.folder_0,
                        folder_1: doc.folder_1,
                        folderName: doc.folder_0,
                        folderPath: mainFolderPath,

                    });
                    uniqueFolders.add(mainFolderPath);
                }
            }
            else if (doc.folder_0 != null && doc.folder_1 != null) {
                const subFolderPath = `${doc.folder_0}${doc.folder_1}`;
                if (!uniqueFolders.has(subFolderPath)) {
                    response.push({
                        type: 'sub_folder',
                        folder_0: doc?.folder_0,
                        folder_1: doc?.folder_1,
                        folderName: doc?.folder_1,
                        folderPath: subFolderPath,

                    });
                    uniqueFolders.add(subFolderPath);
                }
            }
        }
    });

    if (documents.length > 0) {
        const root = `${documents[0].User?.firstName} ${documents[0].User?.lastName}`;
        response.push({
            type: `root`,
            folder_0: null,
            folder_1: null,
            folderName: `${root}`,
        });
    }

    // Send the response
    shared.response(res, response);
});