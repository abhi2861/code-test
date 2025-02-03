const express = require('express');
const router = express();

const document = require("../controllers/document");

router.post('/documentUpload', document.documentUpload);

router.get('/getDocuments', document.getDocuments);

router.post('/getDocumentLink', document.getDocumentLink);

router.delete('/deleteDocument', document.deleteDocument);

router.get('/getFilesByFolderName', document.getFilesByFolderName);

router.get('/getAllFolderName', document.getAllFolderName)

module.exports = router;