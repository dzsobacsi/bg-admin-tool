const dateRouter = require('express').Router()

dateRouter.get('/', async (req, res) => {
    res.send(new Date())
})

module.exports = dateRouter
