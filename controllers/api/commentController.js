const db = require('../../models')
const Comment = db.Comment
const commentService = require('../../services/commentService')

let commentController = {
    postComment: (req, res) => {
        commentService.postComment(req, res, (data) => {
            return res.json(data)
        })
    },

    deleteComment: (req, res) => {
        return Comment.findByPk(req.params.id)
            .then((comment) => {
                comment.destroy()
                    .then((comment) => {
                        res.redirect(`/restaurants/${comment.RestaurantId}`)
                    })
            })
    },

}


module.exports = commentController