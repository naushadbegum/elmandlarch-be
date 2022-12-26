const express = require("express");
const router = express.Router();

const {Luggage, Brand, Material, Type} = require('../models')
const {bootstrapField, createLuggageForm} = require('../forms');

router.get('/', async (req,res)=> {
    let luggages = await Luggage.collection().fetch({
        withRelated: ['brand','material','types'],
    });
    res.render('luggages/index', {
        'luggages': luggages.toJSON()
    })
});

router.get('/create', async (req,res)=>{

    

    const allMaterials = await Material.fetchAll().map((material)=> {
        return [material.get('id'), material.get('material')];
    })

    const allBrands = await Brand.fetchAll().map((brand)=> {
        return [brand.get('id'), brand.get('brand')];
    })

    const allTypes = await Type.fetchAll().map(type => [type.get('id'), type.get('type')]);

    const luggageForm = createLuggageForm(allMaterials, allBrands, allTypes);
    res.render('luggages/create',{
        'form': luggageForm.toHTML(bootstrapField),
        "cloudinaryName": process.env.CLOUDINARY_NAME,
        "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
        "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
    })
});

router.post('/create', async(req,res)=>{
    const allMaterials = await Material.fetchAll().map((material)=> {
        return [material.get('id'), material.get('material')];
    })
    
    const allBrands = await Brand.fetchAll().map((brand)=> {
        return [brand.get('id'), brand.get('brand')];
    })

    const allTypes = await Type.fetchAll().map(type => [type.get('id'), type.get('type')]);

    const luggageForm = createLuggageForm(allMaterials, allBrands, allTypes);

    luggageForm.handle(req, {
        'success': async (form) => {
            let { types, ...luggageData} = form.data;
            const luggage = new Luggage(luggageData);
            // luggage.set('model', form.data.model);
            // luggage.set('cost', form.data.cost);
            // luggage.set('description', form.data.description);
            await luggage.save();
            if (types){
                await luggage.types().attach(types.split(","));
            }
            req.flash("success_messages", `New Luggage ${luggage.get('model')} has been created`)
            res.redirect('/luggages');
        },
        'error': async (form) => {
            res.render('luggages/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;