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