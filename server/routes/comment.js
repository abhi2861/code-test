const express = require('express');
const router = express.Router();

const commentController = require('../controllers/comment')

router.post('/createComment', commentController.createComment);

router.post('/getComments', commentController.getComments);

router.put("/updateComment",commentController.updateComment)

router.post("/deleteComment",commentController.deleteComment)

module.exports = router;
