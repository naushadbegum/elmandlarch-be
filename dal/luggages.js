const {Luggage, Variant, Color, Dimension} = require('../models');

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
        require: true,
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

const getAllLuggages = async () => {
    return await Luggage.fetchAll();
}


module.exports = {
    getLuggageById,
    getVariantsByLuggageId,
    getVariantById,
    getAllVariantFormChoices,
    addVariant,
    updateVariant,
    deleteVariant,
    getAllLuggages
}