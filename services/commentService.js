const db = require('../models')
const Comment = db.Comment

let commentController = {
    postComment: (req, res, callback) => {
        return Comment.create({
            text: req.body.text,
            RestaurantId: req.body.restaurantId,
            UserId: req.user.id
        })
            .then((comment) => {
                console.log(comment)
                return callback({
                    status: 'success',
                    message: '留言成功',
                    RestaurantId: comment.RestaurantId,
                    commentId: comment.id
                })
            })
    },

    deleteComment: (req, res, callback) => {
        return Comment.findByPk(req.params.id)
            .then((comment) => {
                const restaurantId = comment.RestaurantId
                comment.destroy()
                    .then((comment) => {
                        return callback({ status: 'success', message: '成功刪除留言 ', RestaurantId: restaurantId })
                    })
            })
    },

}
module.exports = commentController