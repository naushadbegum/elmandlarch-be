const express = require('express')
const router = express.Router();

const luggageDataLayer = require('../../dal/luggages')

router.get('/', async(req,res)=>{
    res.send(await luggageDataLayer.getAllLuggages())
})

module.exports = router;