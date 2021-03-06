definition = {
    "id": "ExampleForm",
    "widgets": [
        {
            "hint": "Given name.",
            "label": "First name",
            "id": "first_name",
            "minLength": 0,
            "name": "first_name",
            "required": true,
            "value": "Happy",
            "widget_constructor": "TextLine"
        },
        {
            "hint": "Family name.",
            "label": "Last name",
            "id": "last_name",
            "minLength": 0,
            "name": "last_name",
            "required": true,
            "value": "Camper",
            "widget_constructor": "TextLine"
        },
        {
            "hint": "Are they happy?",
            "label": "Happy",
            "id": "happy",
            "name": "happy",
            "required": false,
            "value": true,
            "widget_constructor": "Bool"
        },
        {
            "hint": "What do they look like?",
            "label": "Description",
            "id": "description",
            "minLength": 0,
            "name": "description",
            "required": true,
            "value": "10ft tall\nRazor sharp scales.",
            "widget_constructor": "Text"
        },
        {
            "hint": "Don't tell anybody",
            "label": "Secret Key",
            "id": "secret",
            "name": "secret",
            "required": true,
            "value": "5ecret sauce",
            "widget_constructor": "Hidden"
        }
    ]
};
