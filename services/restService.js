const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10
const Comment = db.Comment
const User = db.User

let restService = {
    getRestaurants: (req, res, callback) => {
        let offset = 0
        let whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (req.query.page - 1) * pageLimit
        }
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery['categoryId'] = categoryId
        }
        Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
            // data for pagination
            let page = Number(req.query.page) || 1
            let pages = Math.ceil(result.count / pageLimit)
            let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
            let prev = page - 1 < 1 ? 1 : page - 1
            let next = page + 1 > pages ? pages : page + 1
            // clean up restaurant data
            const data = result.rows.map(r => ({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.Category.name,
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
                isLike: req.user.LikeRestaurants.map(d => d.id).includes(r.id)
            }))
            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => {
                return callback({
                    restaurants: data,
                    categories: categories,
                    categoryId: categoryId,
                    page: page,
                    totalPage: totalPage,
                    prev: prev,
                    next: next
                })
            })
        })
    },

    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category, { model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikeUsers' }, { model: Comment, include: [User] }
            ]
        })
            .then(restaurant => restaurant.increment('viewCounts'))
            .then(restaurant => {
                //console.log(restaurant.Comments[0].dataValues)
                const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
                const isLike = restaurant.LikeUsers.map(d => d.id).includes(req.user.id)
                callback({
                    restaurant: restaurant.toJSON(),
                    isFavorited: isFavorited,
                    isLike: isLike,
                })
            })
    },

    getFeeds: (req, res, callback) => {
        return Restaurant.findAll({
            limit: 10,
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']],
            include: [Category]
        }).then(restaurants => {
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            }).then(comments => {
                callback({
                    restaurants: restaurants,
                    comments: comments
                })
            })
        })
    },

    getDashboard: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category, { model: Comment, include: [User] }
            ]
        }).then(restaurant => {
            //console.log(restaurant.Comments[0].dataValues)      
            return callback({ restaurant: restaurant })
        })
    },

    getTopRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            include: [
                { model: User, as: 'FavoritedUsers' }
            ]
        })
            .then(restaurants => {
                restaurants = restaurants.map(r => ({
                    ...r.dataValues,
                    description: r.dataValues.description.substring(0, 50),
                    FavoriteCount: r.FavoritedUsers.length,
                    isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id)
                }))
                restaurants = restaurants.sort((a, b) => (b.FavoriteCount - a.FavoriteCount)).slice(0, 10)
                return callback({ restaurants })
            })
            .catch(err => res.send(console.log(err)))
    }
}
module.exports = restService