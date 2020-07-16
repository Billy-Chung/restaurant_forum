const db = require('../models')
const Category = db.Category

let categoryService = {
    getCategories: (req, res, callback) => {
        return Category.findAll({
            raw: true,
            nest: true
        }).then(categories => {
            if (req.params.id) {
                Category.findByPk(req.params.id)
                    .then((category) => {
                        return callback({
                            categories: categories,
                            category: category.toJSON()
                        })
                    })
            } else {
                return callback({ categories: categories })
            }
        })
    },

    postCategory: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "分類名稱未填寫!!!" })
        }
        else {
            return Category.create({
                name: req.body.name
            })
                .then((category) => {
                    callback({ status: 'success', message: '分類名稱創建成功!!!' })
                })
        }
    },

    putCategory: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "分類名稱未填寫!!!" })
        } else {
            return Category.findByPk(req.params.id)
                .then((category) => {
                    category.update(req.body)
                        .then((category) => {
                            callback({ status: 'success', message: "分類名稱修改成功!!!" })
                        })
                })
        }
    },

    deleteCategory: (req, res, callback) => {
        return Category.findByPk(req.params.id)
            .then((category) => {
                category.destroy()
                    .then((category) => {
                        callback({ status: 'success', message: '' })
                    })
            })
    }
}

module.exports = categoryService