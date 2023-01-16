const {Luggage, Variant, Color, Dimension, Brand, Material, Type} = require('../models');

const getAllLuggages = async () => {
    return await Luggage.fetchAll();
}

const getAllBrands = async function (){
    const brands = await Brand.fetchAll().map((brand)=> {
        return [brand.get('id'), [brand.get('brand')]];
    });
    return brands
}

const getAllMaterials = async function () {
    const materials = await Material.fetchAll().map((material)=> {
        return [material.get('id'), [material.get('material')]];
    });
    return materials
}

const getAllTypes = async function (){
    const types = await Type.fetchAll().map((type)=> {
        return [type.get('id'), [type.get('type')]];
    });
    return types
}


const getLuggageById = async function (luggageId) {
    const luggage = await Luggage.where({
        id: luggageId
    }).fetch({
        withRelated: ['brand', 'material', 'types', 'variants', 'variants.color', 'variants.dimension'],
        require: true
    });
    return luggage;
}

const getVariantsByLuggageId = async function (luggageId) {
    const variants = await Variant.collection()
    .where({
        luggage_id : luggageId
    })
    .fetch({
        require: false,
        withRelated: [
            'color',
            'dimension'
        ]
    });
    return variants;
}

const getVariantById = async function (variantId) {
    const variant = await Variant.where({
        id: variantId
    }).fetch({
        require: true,
        withRelated: [
            'color',
            'dimension'
        ]
    });

    return variant;
}

const getAllColors = async function () {
    const colors = await Color.fetchAll().map((color) => {
        return [color.get('id'), color.get('color')];
    });

    return colors;
}

const getAllDimensions = async function () {
    const dimensions = await Dimension.fetchAll().map((dimension)=> {
        return [dimension.get('id'), dimension.get('dimension')];
    });

    return dimensions;
}

const getAllVariantFormChoices = async function(){
    const colors = await getAllColors();
    const dimensions = await getAllDimensions();

    // console.log(colors, dimensions)

    return {
        colors,
        dimensions
    }
}

const addVariant = async function (formData) {
	const variant = new Variant(formData);
	await variant.save();

	return variant;
};

const updateVariant = async function (variantId, formData) {
	// Get variant to be updated
	const variant = await getVariantById(variantId);

	if (!variant) {
		return;
	}

	// Populate variant with new data
	variant.set(formData);
	await variant.save();

	return true; // Indicate success
};

const deleteVariant = async function(variantId) {
    
    const variant = await getVariantById(variantId);
    await variant.destroy();

    return true;
}



const searchLuggages = async function (searchFields) {
    let query = Luggage.collection();

    if(searchFields.model){
        if (process.env.DB_DRIVER == 'mysql'){
            query.where('model', 'like', `%${searchFields.model}%`);
        } else {
            query.where('model', 'ilike', `%${searchFields.model}%`);
        }
    }

    if(searchFields.brand_id && searchFields.brand_id != '0'){
        query.where('brand_id', '=', searchFields.brand_id)
    };

    if(searchFields.material_id && searchFields.material_id != '0'){
        query.where('material_id', '=', searchFields.material_id)
    }

    if(searchFields.types && searchFields.types != '0'){
        query.query('join', 'luggages_types', 'luggages.id', 'luggage_id')
        .where('type_id', 'in', searchFields.types.split(','))
    }

    if (searchFields.min_cost) {
        query.where('cost', '>=', searchFields.min_cost)
    }
    
    if(searchFields.max_cost){
        query.where('cost', '<=', searchFields.max_cost)
    }

    let luggages = (
        await query.orderBy('id').fetch({
            withRelated: [
                'brand',
                'material',
                'types'
            ]
        })
    ).toJSON();
    return luggages;
}

module.exports = {
    getLuggageById,
    getVariantsByLuggageId,
    getVariantById,
    getAllBrands,
    getAllMaterials,
    getAllTypes,
    getAllVariantFormChoices,
    addVariant,
    updateVariant,
    deleteVariant,
    getAllLuggages,
    searchLuggages
}