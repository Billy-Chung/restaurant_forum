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
          isLike:isLike,
        })
      })
    },
  
    getFeeds: (req, res) => {
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
          return res.render('feeds', {
            restaurants: restaurants,
            comments: comments
          })
        })
      })
    },
  
    getDashboard: (req, res) => {
      return Restaurant.findByPk(req.params.id, {
        include: [Category, { model: Comment, include: [User] }
        ]
      }).then(restaurant => {
        //console.log(restaurant.Comments[0].dataValues)      
        return res.render('dashboard', {
          restaurant: restaurant.toJSON()
        })
      })
    },
  
    getTopRestaurants: (req, res) => {
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
        return res.render('topRestaurant', { restaurants })
      })
      .catch(err => res.send(console.log(err)))
    }
  }
  module.exports = restController