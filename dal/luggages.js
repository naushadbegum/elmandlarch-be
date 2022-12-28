const {Luggage, Variant} = require('../models');

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

module.exports = {
    getLuggageById,
    getVariantsByLuggageId,
    getVariantById
}