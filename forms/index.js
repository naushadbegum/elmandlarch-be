// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createLuggageForm = (allMaterials = [], allBrands = [], allTypes = []) => {
    return forms.create({
        'model': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'material_id': fields.string({
            label: 'Material',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: allMaterials
        }),
        'brand_id': fields.string({
            label: 'Brand',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: allBrands
        }),
        'types': fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: allTypes
        }),
        'image_url': fields.url({
            required: validators.required('Image required'),
            errorAfterField: true,
            validators: [validators.url()],
            widget: forms.widgets.hidden()
        }),
        'thumbnail_url': fields.url({
            widget: forms.widgets.hidden()
        })
    })
};


module.exports = {bootstrapField, createLuggageForm}
