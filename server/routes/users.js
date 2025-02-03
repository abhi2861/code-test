const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');

router.get('/usersList', usersController.getUsersList);

router.get('/getCounts', usersController.getCounts);

router.post("/uploaduserkyc", usersController.uploadKycDoc);

router.post("/updateuserkyc", usersController.updateKycDocData);

router.post("/deletekycdoc", usersController.deleteKycDoc);

router.post("/approveKyc", usersController.approveUserKyc);

router.get("/getuserkyc", usersController.getUserKyc);

router.get("/getUsers", usersController.getUsers);

router.get("/getUserPortfolio", usersController.getUserPortfolio);

router.get("/getApplicationForUser", usersController.getApplicationForUser);

module.exports = router;