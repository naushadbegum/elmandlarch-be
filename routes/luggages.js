const express = require("express");
const router = express.Router();

const {Luggage} = require('../models')

router.get('/', async (req,res)=> {
    let luggages = await Luggage.collection().fetch();
    res.render('luggages/index', {
        'luggages': luggages.toJSON()
    })
})

module.exports = router;