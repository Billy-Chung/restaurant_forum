const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10
const Comment = db.Comment
const User = db.User
const restService = require('../../services/restService')

let restController = {
    getRestaurants: (req, res) => {
        restService.getRestaurants(req, res, (data) => {
            return res.json(data)
        })
    },

    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category, { model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikeUsers' }, { model: Comment, include: [User] }
            ]
        })
            .then(restaurant => restaurant.increment('viewCounts'))
            .then(restaurant => {
                //console.log(restaurant.Comments[0].dataValues)
                const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
                const isLike = restaurant.LikeUsers.map(d => d.id).includes(req.user.id)
                return res.render('restaurant', {
                    restaurant: restaurant.toJSON(),
                    isFavorited: isFavorited,
                    isLike: isLike,
                })
            })
    },

    getFeeds: (req, res) => {
        restService.getFeeds(req, res, (data) => {
            return res.json(data)
        })
    },

    getDashboard: (req, res) => {
        restService.getDashboard(req, res, (data) => {
            return res.json(data)
        })
    },

    getTopRestaurants: (req, res) => {
        restService.getTopRestaurants(req, res, (data) => {
            return res.json(data)
        })
    }
}
module.exports = restController