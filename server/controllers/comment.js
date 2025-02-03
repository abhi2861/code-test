// Importing Utils
const catchAsync = require('../utils/catchAsync');

const sharedController = require('./shared');
const AppError = require("./../utils/appError");

//Importing Models
const Comment = require('../models/comment');
const User = require('../models/user');
const UserInvestment = require('../models/userInvestment');

// Create
exports.createComment = catchAsync(async (req, res) => {
    let newRecord, message, statusCode;
    const obj = {
        id: req.body.id,
        userId: req.body.loggedInUserId,
        investmentId: req.body.investmentId,
        comment: req.body.comment,
        subscribe: req.body.subscribe
    }
    await sharedController.validateRequestBody(obj, ['id', 'subscribe', 'comment']);

    const existing_Subscription = await Comment.findOne({
        where: { userId: obj.userId, investmentId: obj.investmentId, comment: '', active: true }
    });

    if (obj.comment && obj.comment !== "" ) {
        newRecord = await Comment.create(obj);
        message = 'Subscribed successfully';
        statusCode = 201;
    }

    if (obj.subscribe === 'Yes' && !existing_Subscription) {
        newRecord = await Comment.create(obj);
        message = 'Subscribed successfully';
        statusCode = 201;
    }
    else if (existing_Subscription && obj.subscribe === 'No') {
        const existing = await Comment.findOne({
            where: {
                userId: obj.userId,
                investmentId: obj.investmentId,
                subscribe: 'Yes',
                comment: "",
                active: true
            }
        });

        newRecord = await Comment.update(
            { subscribe: obj.subscribe }, // The data to update
            { where: { id: existing.id } } // The condition to find the record
        );
        message = 'Unsubscribed successfully';
        statusCode = 200;
    }
    else if (existing_Subscription && obj.subscribe === 'Yes') {
        const existing = await Comment.findOne({
            where: {
                userId: obj.userId,
                investmentId: obj.investmentId,
                subscribe: 'No',
                comment: "",
                active: true
            }
        });

        newRecord = await Comment.update(
            { subscribe: obj.subscribe }, // The data to update
            { where: { id: existing.id } } // The condition to find the record
        );
        message = 'Subscribed successfully';
        statusCode = 200;
    }
    sharedController.response(res, newRecord, {}, message, statusCode)
})

// Read
exports.getComments = catchAsync(async (req, res) => {

    const { investmentId, status, loggedInUserId } = req.body;
    let chatOpen = true, message = 'Comments fetched successfully';
    const comments = await Comment.findAll({
        where: { investmentId: investmentId, active: true },
        include: [
            {
                model: User,
                attributes: ['firstName', 'lastName']
            }
        ],
        order: [['id', 'DESC']],
    });

    if (status === 'Closed') {
        const userInvestment = await UserInvestment.findOne({
            where: { userId: loggedInUserId, investmentId: investmentId, status: 'Funds Received' },
            order: [['id', 'DESC']],
        });
        if (!userInvestment) {
            chatOpen = false;
        }
    }
    if (comments.length === 0) {
        message = 'No comments found'
    }
    const subscribeStatus = comments?.find(c => String(c.userId) === String(loggedInUserId) && c.comment ==="")
    const filteredComments = comments?.filter(comment => comment.comment !== '');
    // const latestRecord = filteredComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const commentDetails = filteredComments?.map(comment => {
        const plainComment = comment.get({ plain: true });
        return {
            id: plainComment.id,
            userId: plainComment.userId,
            investmentId: plainComment.investmentId,
            comment: plainComment.comment,
            createdAt: plainComment.createdAt,
            updatedAt: plainComment.updatedAt,
            username: `${plainComment.User.firstName} ${plainComment.User.lastName}`
        };
    });

    const subscribedUsers = comments?.filter(c => c.subscribe != null && c.comment === '')
    const total = subscribedUsers?.length;

    const subscribeCount = subscribedUsers?.filter(comment => comment.subscribe === 'Yes').length;
    const unsubscribeCount = subscribedUsers?.filter(comment => comment.subscribe === 'No').length;
    const subscribePercentage = total > 0 ? ((subscribeCount / total) * 100).toFixed(2) : 0;
    const unsubscribePercentage = total > 0 ? ((unsubscribeCount / total) * 100).toFixed(2) : 0;
    const response = {
        totalComments: total,
        subscribeStatus: subscribeStatus?.subscribe === 'Yes' ? 'Unsubscribe' : 'Subscribe',
        subscribePercentage: `${subscribePercentage}%`,
        unsubscribePercentage: `${unsubscribePercentage}%`,
        commentDetails,
        chatOpen
    };

    // Send response
    sharedController.response(res, response, {}, message);
});

//Update
exports.updateComment = catchAsync(async (req, res) => {
    // Extract and validate required fields
    const { id, investmentId, comment } = req.body;
    const userId = req.body.loggedInUserId;
    if (!id || !userId || !investmentId) {
        throw new AppError("id, userId, and investmentId are required", 400);
    }

    // Find the existing comment
    const existingComment = await Comment.findOne({ where: { id, userId, investmentId, active: true } });
    if (!existingComment) {
        throw new AppError("Comment not created yet", 400);
    }

    // Prepare the update object
    const updateData = {
        comment: (comment !== undefined || '') ? comment : existingComment.comment,
    };

    // Update the comment
    const updatedRecord = await Comment.update(updateData, { where: { id, userId, investmentId } });

    // Send the response
    const message = "Comment updated successfully";
    sharedController.response(res, updatedRecord, {}, message, 200);
});

exports.deleteComment = catchAsync(async (req, res) => {
    // Extract and validate required fields
    const { id } = req.body;
    if (!id) {
        throw new AppError("id required", 400);
    }

    // Find the existing comment
    const existingComment = await Comment.findOne({ where: { id } });
    if (!existingComment) {
        throw new AppError("Comment not created yet", 400);
    }

    // Prepare the update object
    const updateData = { active: false }
    const comment = await Comment.update(updateData, { where: { id } });
    // Send the response
    const message = "Comment deleted successfully";
    sharedController.response(res, comment, {}, message, 200);
});




