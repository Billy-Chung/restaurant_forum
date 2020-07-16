const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const adminService = require('../services/adminService.js')

const adminController = {
    getRestaurants: (req, res) => {
        adminService.getRestaurants(req, res, (date) => {
            return res.render('admin/restaurants', date)
        })
    },

    createRestaurant: (req, res) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return res.render('admin/create', {
                categories: categories
            })
        })
    },

    postRestaurant: (req, res) => {
        adminService.postRestaurant(req, res, (data) => {
            if (data['status'] === 'error') {
                req.flash('error_messages', data['message'])
                return res.redirect('back')
            }
            req.flash('success_messages', data['message'])
            res.redirect('/admin/restaurants')
        })
    },

    getRestaurant: (req, res,) => {
        adminService.getRestaurant(req, res, (date) => {
            return res.render('admin/restaurant', date)
        })
    },

    editRestaurant: (req, res) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return Restaurant.findByPk(req.params.id).then(restaurant => {
                return res.render('admin/create', {
                    categories: categories,
                    restaurant: restaurant.toJSON()
                })
            })
        })
    },

    putRestaurant: (req, res) => {
        adminService.putRestaurant(req, res, (data) => {
            if (data['status'] === 'error') {
              req.flash('error_messages', data['message'])
              return res.redirect('back')
            }
            req.flash('success_messages', data['message'])
            res.redirect('/admin/restaurants')
          })
    },

    deleteRestaurant: (req, res) => {
        adminService.deleteRestaurant(req, res, (data) => {
            if (data['status'] === 'success') {
                return res.redirect('/admin/restaurants')
            }
        })
    },

    getUsers: (req, res) => {
        return User.findAll({ raw: true }).then(users => {
            return res.render('admin/users', { users: users, user: req.user, isAuthenticated: req.isAuthenticated })
        })
    },

    putUser: (req, res) => {
        return User.findByPk(req.params.id)
            .then((user) => {
                return user.update({
                    isAdmin: !user.isAdmin
                })
            })
            .then((user) => {
                req.flash('success_messages', `${user.name}已成功修改權限`)
                res.redirect('/admin/users')
            })

    },
}

module.exports = adminController