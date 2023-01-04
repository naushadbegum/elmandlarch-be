const express = require('express')
const router = express.Router();

const luggageDataLayer = require('../../dal/luggages')

// router.get('/', async (req, res)=> {
//     res.send(await luggageDataLayer.getAllLuggages())
// })

router.get('/', async(req,res)=>{
    const searchFields = req.query;
    const luggages = await luggageDataLayer.searchLuggages(searchFields);
    res.send({luggages})
    // console.log({luggages});
    }
)


router.get('/search_options', async function (req, res){
    const brands = await luggageDataLayer.getAllBrands();
    brands.unshift([0, '------']);

    const materials = await luggageDataLayer.getAllMaterials();
    materials.unshift([0, '------']);

    const types = await luggageDataLayer.getAllTypes();
    types.unshift([0, '------']);

    const options = {
        brands,
        materials,
        types
    }
    res.send({options})

})

router.get(':/luggage_id', async function (req, res){

    const luggage = await luggageDataLayer.getLuggageById(req.params.luggage_id);
    
    res.send({luggage})
})

module.exports = router;