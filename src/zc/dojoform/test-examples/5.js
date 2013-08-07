definition = {
    "definition": {
        "prefix": "ExampleForm",
        left_fields: {
            first_name: true,
            last_name: true,
            happy: true,
            description: true,
            secret: true
        },
        "widgets": [
            {
                "fieldHint": "Given name.",
                "fieldLabel": "First name",
                "id": "first_name",
                "minLength": 0,
                "name": "first_name",
                "required": true,
                "value": "Happy",
                "widget_constructor": "TextLine"
            },
            {
                "fieldHint": "Family name.",
                "fieldLabel": "Last name",
                "id": "last_name",
                "minLength": 0,
                "name": "last_name",
                "required": true,
                "value": "Camper",
                "widget_constructor": "TextLine"
            },
            {
                "fieldHint": "Are they happy?",
                "fieldLabel": "Happy",
                "id": "happy",
                "name": "happy",
                "required": false,
                "value": true,
                "widget_constructor": "Bool"
            },
            {
                "fieldHint": "What do they look like?",
                "fieldLabel": "Description",
                "id": "description",
                "minLength": 0,
                "name": "description",
                "required": true,
                "value": "10ft tall\nRazor sharp scales.",
                "widget_constructor": "Text"
            },
            {
                "fieldHint": "Don't tell anybody",
                "fieldLabel": "Secret Key",
                "id": "secret",
                "name": "secret",
                "required": true,
                "value": "5ecret sauce",
                "widget_constructor": "Hidden"
            }
        ]
    }
};
