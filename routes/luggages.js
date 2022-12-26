const express = require("express");
const router = express.Router();

const { Luggage, Brand, Material, Type } = require('../models')
const { bootstrapField, createLuggageForm, createSearchForm } = require('../forms');

router.get('/', async (req, res) => {

    const allBrands = await Brand.fetchAll().map((brand) => {
        return [brand.get('id'), brand.get('brand')];
    })
    allBrands.unshift([0, '----']);

    const allMaterials = await Material.fetchAll().map((material) => {
        return [material.get('id'), material.get('material')];
    })
    allMaterials.unshift([0, '----']);

    const allTypes = await Type.fetchAll().map(type => [type.get('id'), type.get('type')]);

    let searchForm = createSearchForm(allBrands, allMaterials, allTypes);
    let q = Luggage.collection();

    searchForm.handle(req, {
        'empty': async (form) => {

            let luggages = await q.fetch({
                withRelated: ['brand', 'material'],
            })
            res.render('luggages/index', {
                'luggages': luggages.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            let luggages = await q.fetch({
                withRelated: ['brand', 'material'],
            })
            res.render('luggages/index', {
                'luggages': luggages.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {
            if (form.data.model) {
                q.where('model', 'like', '%' + form.data.model + '%')
            }

            if (form.data.brand_id && form.data.brand_id != "0") {
                q.where('brand_id', '=', form.data.brand_id)
            }

            if (form.data.material_id && form.data.material != "0"){
                q.where('material_id', '=', form.data.material_id)
            }
            
            if(form.data.types){
                q.query('join', 'luggages_types', 'luggages.id', 'luggage_id')
                .where('type_id', 'in', form.data.types.split(','))
            }

            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost)
            }

            if(form.data.max_cost){
                q = q.where('cost', '<=', form.data.max_cost)
            }

            let luggages = await q.fetch({
                withRelated: ['brand', 'material'],
            })
            res.render('luggages/indes',{
                'luggages': luggages.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/create', async (req, res) => {

            const allMaterials = await Material.fetchAll().map((material) => {
                return [material.get('id'), material.get('material')];
            })

            const allBrands = await Brand.fetchAll().map((brand) => {
                return [brand.get('id'), brand.get('brand')];
            })

            const allTypes = await Type.fetchAll().map(type => [type.get('id'), type.get('type')]);

            const luggageForm = createLuggageForm(allMaterials, allBrands, allTypes);
            res.render('luggages/create', {
                'form': luggageForm.toHTML(bootstrapField),
                "cloudinaryName": process.env.CLOUDINARY_NAME,
                "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
                "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
            })
        });

        router.post('/create', async (req, res) => {
            const allMaterials = await Material.fetchAll().map((material) => {
                return [material.get('id'), material.get('material')];
            })

            const allBrands = await Brand.fetchAll().map((brand) => {
                return [brand.get('id'), brand.get('brand')];
            })

            const allTypes = await Type.fetchAll().map(type => [type.get('id'), type.get('type')]);

            const luggageForm = createLuggageForm(allMaterials, allBrands, allTypes);

            luggageForm.handle(req, {
                'success': async (form) => {
                    let { types, ...luggageData } = form.data;
                    const luggage = new Luggage(luggageData);
                    // luggage.set('model', form.data.model);
                    // luggage.set('cost', form.data.cost);
                    // luggage.set('description', form.data.description);
                    await luggage.save();
                    if (types) {
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


router.get('/:luggage_id/update', async (req, res) => {

            const luggageId = req.params.luggage_id
            const luggage = await Luggage.where({
                'id': luggageId
            }).fetch({
                require: true,
                withRelated: ['types']
            });


            const allMaterials = await Material.fetchAll().map((material) => {
                return [material.get('id'), material.get('material')];
            })
            const allBrands = await Brand.fetchAll().map((brand) => {
                return [brand.get('id'), brand.get('brand')];
            })
            const allTypes = await Type.fetchAll().map(type => [type.get('id'), type.get('type')]);
            const luggageForm = createLuggageForm(allMaterials, allBrands, allTypes);

            luggageForm.fields.model.value = luggage.get('model');
            luggageForm.fields.cost.value = luggage.get('cost');
            luggageForm.fields.description.value = luggage.get('description');
            luggageForm.fields.material_id.value = luggage.get('material_id');
            luggageForm.fields.brand_id.value = luggage.get('brand_id');
            luggageForm.fields.image_url.value = luggage.get('image_url');
            luggageForm.fields.thumbnail_url.value = luggage.get('thumbnail_url');


            let selectedTypes = await luggage.related('types').pluck('id');
            luggageForm.fields.types.value = selectedTypes;

            res.render('luggages/update', {
                'form': luggageForm.toHTML(bootstrapField),
                'luggage': luggage.toJSON(),

                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
            })
        });

        router.post('/:luggage_id/update', async (req, res) => {
            const allMaterials = await Material.fetchAll().map((material) => {
                return [material.get('id'), material.get('material')];
            })

            const allBrands = await Brand.fetchAll().map((brand) => {
                return [brand.get('id'), brand.get('brand')];
            })

            const luggage = await Luggage.where({
                'id': req.params.luggage_id
            }).fetch({
                require: true,
                withRelated: ['types']
            });

            const luggageForm = createLuggageForm(allMaterials, allBrands);
            luggageForm.handle(req, {
                'success': async (form) => {
                    let { types, ...luggageData } = form.data;
                    luggage.set(luggageData);
                    luggage.save();

                    let typeIds = types.split(',');
                    let existingTypeIds = await luggage.related('types').pluck('id');

                    let toRemove = existingTypeIds.filter(id => typeIds.includes(id) === false);
                    await luggage.types().detach(toRemove);

                    await luggage.types().attach(typeIds);

                    res.redirect('/luggages');
                },
                'error': async (form) => {
                    res.render('luggages/update', {
                        'form': form.toHTML(bootstrapField),
                        'luggage': luggage.toJSON()
                    })
                }
            })
        })


router.get('/:luggage_id/delete', async (req, res) => {
            const luggage = await Luggage.where({
                'id': req.params.luggage_id
            }).fetch({
                require: true
            });

            res.render('luggages/delete', {
                'luggage': luggage.toJSON()
            })
        });

router.post('/:luggage_id/delete', async (req, res) => {
            const luggage = await Luggage.where({
                'id': req.params.luggage_id
            }).fetch({
                require: true
            });
            await luggage.destroy();
            res.redirect('/luggages')
        })

module.exports = router;