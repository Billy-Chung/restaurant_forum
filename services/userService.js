const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const userService = {
    getUser: (req, res) => {
        return User.findByPk(req.params.id, { raw: true }).then(users => {
            const id = req.params.id
            const pageLimit = 7
            let offset = 0

            if (req.query.page) {
                offset = (req.query.page - 1) * pageLimit
            }

            Comment.findAndCountAll({ include: Restaurant, where: { UserId: id }, offset: offset, limit: pageLimit })
                .then(result => {
                    const count = result.count
                    const page = Number(req.query.page) || 1
                    const pages = Math.ceil(count / pageLimit)
                    const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
                    const prev = page - 1 < 1 ? 1 : page - 1
                    const next = page + 1 > pages ? pages : page + 1
                    const comments = result.rows.map(r => ({
                        id: r.Restaurant.id,
                        image: r.Restaurant.image
                    }))

                    return User.findByPk(id)
                        .then(profile => {
                            return res.render('users', {
                                profile: profile.toJSON(),
                                count: count,
                                page: page,
                                totalPage: totalPage,
                                prev: prev,
                                next: next,
                                comments: comments,
                            })
                        })
                })
        })
    },

    editUser: (req, res) => {
        if (parseInt(req.user.id) === parseInt(req.params.id)) {
            return User.findByPk(req.params.id, { raw: true }).then(users => {
                return res.render('user', {
                    users: users
                })
            })
        }
        else {
            return res.redirect('back')
        }

    },

    putUser: (req, res) => {
        if (!req.body.name) {
            req.flash('error_messages', "名子是必填值!!!")
            return res.redirect('back')
        }

        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.params.id)
                    .then((user) => {
                        user.update({
                            name: req.body.name,
                            img: file ? img.data.link : user.image,
                        })
                            .then((user) => {
                                req.flash('success_messages', '使用者已經成功修改!!!')
                                res.redirect(`/users/${user.id}`)
                            })
                    })
            })
        }
        else
            return User.findByPk(req.params.id)
                .then((user) => {
                    user.update({
                        name: req.body.name,
                        img: user.img
                    })
                        .then((user) => {
                            req.flash('success_messages', '使用者已經成功修改!!!')
                            res.redirect(`/users/${user.id}`)
                        })
                })
    },

    addFavorite: (req, res, callback) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((restaurant) => {
                return callback({ status: 'success', message: '' })
            })
    },

    removeFavorite: (req, res) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        callback({ status: 'success', message: '' })
                    })
            })
    },

    addLike: (req, res, callback) => {
        return Like.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then((Like) => {
                return callback({ status: 'success', message: '' })
            })
    },

    unLike: (req, res) => {
        return Like.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((Like) => {
                Like.destroy()
                    .then((Like) => {
                        return res.redirect('back')
                    })
            })
    },
    getTopUser: (req, res) => {
        // 撈出所有 User 與 followers 資料
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            // 整理 users 資料
            users = users.map(user => ({
                ...user.dataValues,
                // 計算追蹤者人數
                FollowerCount: user.Followers.length,
                // 判斷目前登入使用者是否已追蹤該 User 物件
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            // 依追蹤者人數排序清單
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
            return res.render('topUser', { users: users })
        })
    },

    addFollowing: (req, res) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
            .then((followship) => {
                return res.redirect('back')
            })
    },

    removeFavorite: (req, res, callback) => {
        return Favorite.findOne({
            where: {
                UserId: req.user.id,
                RestaurantId: req.params.restaurantId
            }
        })
            .then((favorite) => {
                favorite.destroy()
                    .then((restaurant) => {
                        return callback({ status: 'success', message: '' })
                    })
            })
    },
}




module.exports = userService