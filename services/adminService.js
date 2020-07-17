const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User

const adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
            callback({ restaurants: restaurants })
        })
    },

    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, { include: [Category] })
            .then(restaurant => {
                callback({ restaurant: restaurant.toJSON() })
            })
    },

    postRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: '名子是必填值!!!' })
        }
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name: req.body.name,
                    tel: req.body.tel,
                    address: req.body.address,
                    opening_hours: req.body.opening_hours,
                    description: req.body.description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                }).then((restaurant) => {
                    callback({ status: 'success', message: '餐廳已經成功新增!!!' })
                })
            })
        } else {
            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                CategoryId: req.body.categoryId
            })
                .then((restaurant) => {
                    callback({ status: 'success', message: '餐廳已經成功新增!!!' })
                })
        }
    },

    putRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: '名子是必填值!!!' })
        }

        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return Restaurant.findByPk(req.params.id)
                    .then((restaurant) => {
                        restaurant.update({
                            name: req.body.name,
                            tel: req.body.tel,
                            address: req.body.address,
                            opening_hours: req.body.opening_hours,
                            description: req.body.description,
                            image: file ? img.data.link : restaurant.image,
                            CategoryId: req.body.categoryId,
                        })
                            .then((restaurant) => {
                                callback({ status: 'success', message: '餐廳已經成功修改!!!' })
                            })
                    })
            })
        }
        else
            return Restaurant.findByPk(req.params.id)
                .then((restaurant) => {
                    restaurant.update({
                        name: req.body.name,
                        tel: req.body.tel,
                        address: req.body.address,
                        opening_hours: req.body.opening_hours,
                        description: req.body.description,
                        image: restaurant.image,
                        CategoryId: req.body.categoryId
                    })
                        .then((restaurant) => {
                            callback({ status: 'success', message: '餐廳已經成功修改!!!' })
                        })
                })
    },

    editRestaurant: (req, res, callback) => {
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            return Restaurant.findByPk(req.params.id).then(restaurant => {
                return callback({
                    categories: categories,
                    restaurant: restaurant,
                })
            })
        })
    },

    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
                restaurant.destroy()
                    .then((restaurant) => {
                        callback({ status: 'success', message: '' })
                    })
            })
    },

    getUsers: (req, res, callback) => {
        return User.findAll({ raw: true })
            .then(users => {
                callback({ users: users })
            })
    },

    putUser: (req, res, callback) => {
        return User.findByPk(req.params.id)
            .then((user) => {
                return user.update({
                    isAdmin: !user.isAdmin
                })
            })
            .then((user) => {
                callback({ status: 'success', message: `${user.name}已成功修改權限` })
            })

    },
}

module.exports = adminService