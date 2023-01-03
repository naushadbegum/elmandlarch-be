const express = require("express");
const router = express.Router();

const { Luggage, Brand, Material, Type, Variant } = require('../models')
const { bootstrapField, createLuggageForm, createSearchForm, createVariantForm } = require('../forms');

const dataLayer = require('../dal/luggages');
const { checkIfAuthenticated } = require("../middlewares");

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
                withRelated: ['brand', 'material', 'types'],
            })
            res.render('luggages/index', {
                'luggages': luggages.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            let luggages = await q.fetch({
                withRelated: ['brand', 'material', 'types'],
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

            if (form.data.brand_id && form.data.brand_id !== "0") {
                q.where('brand_id', '=', form.data.brand_id)
            }

            if (form.data.material_id && form.data.material_id !== "0"){
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
                q.where('cost', '<=', form.data.max_cost)
            }

            let luggages = await q.fetch({
                withRelated: ['brand', 'material', 'types'],
            })
            // console.log(luggages);
            // console.log(form.data)
            res.render('luggages/index',{
                'luggages': luggages.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/create', checkIfAuthenticated, async (req, res) => {

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

router.post('/create', checkIfAuthenticated, async (req, res) => {
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
        });


router.get('/:luggage_id/variants', async function(req,res){
    const luggage = await dataLayer.getLuggageById(req.params.luggage_id);
    const variants = await dataLayer.getVariantsByLuggageId(req.params.luggage_id);

    // console.log(variants.toJSON())
    // if (variants) {
    //     variants = variants.toJSON();
    // }
    // else{
    //     variants=[];
    // }
    // console.log(luggage);

    // console.log(variants.toJSON());

    res.render('luggages/variants',{
        'luggage': luggage.toJSON(),
        'variants': variants.toJSON()
    });
});

router.get('/:luggage_id/variants/create', async function(req,res){
    
    const choices = await dataLayer.getAllVariantFormChoices();
    const variantForm = createVariantForm(choices);

    res.render('luggages/create-variant',{
        form: variantForm.toHTML(bootstrapField),
        "cloudinaryName": process.env.CLOUDINARY_NAME,
        "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
        "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
        
    })
})

router.post('/:luggage_id/variants/create', async function(req,res){
    const choices = await dataLayer.getAllVariantFormChoices();
    const variantForm = createVariantForm(choices);

    variantForm.handle(req, {
        success: async function (form){
            const variantData = {
                ...form.data,
                luggage_id: req.params.luggage_id
            };

            await dataLayer.addVariant(variantData);

            req.flash('success_messages', 'New variant added successfully');
            res.redirect('/luggages');
        },
        error: function (form){
            res.render('luggages/create-variant', {
                form: form.toHTML(bootstrapField)
            });
        },
        empty: function (form){
            res.render('/luggages/create-variant', {
                form: form.toHTML(bootstrapField)
            });
        }
    });
});

router.get('/:luggage_id/variants/:variant_id/update', async function (req, res) {
    // Get variant to be updated
    const variant = await dataLayer.getVariantById(req.params.variant_id);
  
    // Get choices for variant form
    const choices = await dataLayer.getAllVariantFormChoices();
  
    // Create variant form and populate with existing data
    const variantForm = createVariantForm(choices);
  
    variantForm.fields.color_id.value = variant.get('color_id');
    variantForm.fields.dimension_id.value = variant.get('dimension_id');
    variantForm.fields.stock.value = variant.get('stock');
    variantForm.fields.image_url.value = variant.get('image_url');
    variantForm.fields.thumbnail_url.value = variant.get('thumbnail_url');
  
    res.render('luggages/variant-update', {
      variant: variant.toJSON(),
      form: variantForm.toHTML(bootstrapField),
      "cloudinaryName": process.env.CLOUDINARY_NAME,
      "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
      "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
      
    });
  });
  
  router.post('/:luggage_id/variants/:variant_id/update', async function (req, res) {
    // Get variant to be updated
    const variant = await dataLayer.getVariantById(req.params.variant_id);
  
    // Get choices for variant form
    const choices = await dataLayer.getAllVariantFormChoices();
  
    // Process variant form
    const variantForm = createVariantForm(choices);
    variantForm.handle(req, {
      success: async function (form) {
        const result = await dataLayer.updateVariant(req.params.variant_id, form.data);
  
        if (!result) {
          req.flash('error_messages', 'An error occurred when updating. Please try again');
        }
        else {
          req.flash('success_messages', 'Variant successfully updated');
        }
  
        res.redirect(`/luggages/${req.params.luggage_id}/variants`);
      },
      error: function (form) {
        res.render('luggages/update-variant', {
          variant: variant.toJSON(),
          form: form.toHTML(bootstrapField)
        });
      },
      empty: function (form) {
        res.render('luggages/update-variant', {
          variant: variant.toJSON(),
          form: form.toHTML(bootstrapField)
        });
      }
    })
  });

router.get('/:luggage_id/variants/:variant_id/delete', async (req,res)=> {
    const variant = await dataLayer.getVariantById(req.params.variant_id)
    res.render('luggages/variant-delete', {
        variant: variant.toJSON()
    })
})

router.post('/:luggage_id/variants/:variant_id/delete', async function (req,res){
    const result = await dataLayer.deleteVariant(req.params.variant_id);
    
    if (result){
        req.flash('success_messages', 'Variant deleted');
    }
    else {
        req.flash('error_messages', 'An error occured when deleting.')
    }

    res.redirect(`/luggages/${req.params.luggage_id}/variants`);
})

module.exports = router;