const express = require("express");
const router = express.Router();

const {Luggage} = require('../models')
const {bootstrapField, createLuggageForm} = require('../forms');

router.get('/', async (req,res)=> {
    let luggages = await Luggage.collection().fetch();
    res.render('luggages/index', {
        'luggages': luggages.toJSON()
    })
});

router.get('/create', async (req,res)=>{
    const luggageForm = createLuggageForm();
    res.render('luggages/create',{
        'form': luggageForm.toHTML(bootstrapField)
    })
});

router.post('/create', async(req,res)=>{
    const luggageForm = createLuggageForm();
    luggageForm.handle(req, {
        'success': async (form) => {
            const luggage = new Luggage();
            luggage.set('model', form.data.model);
            luggage.set('cost', form.data.cost);
            luggage.set('description', form.data.description);
            await luggage.save();
            res.redirect('/luggages');
        },
        'error': async (form) => {
            res.render('luggage/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;