definition = {
    "actions": [
        {
            "label": "Register",
            "name": "ExampleForm.actions.register",
            "handler": "test.register"
        }
    ],
    "groups": [
        {
            "id": "left-fields",
            "class": 'zc-left-fields',
            "widgets": [
                "first_name",
                "last_name",
                "age",
                "other"
            ]
        },
        {
            "id": "right-fields",
            "class": 'zc-right-fields',
            "widgets": [
                "favorite_color",
                "happy",
                "pet",
                "temperment",
                "weight",
                "description",
                "secret",
                "siblings",
                "addresses"
            ]
        }
    ],
    "id": "ExampleForm",
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
            "fieldHint": "",
            "fieldLabel": "Favorite color",
            "id": "favorite_color",
            "minLength": 0,
            "name": "favorite_color",
            "required": false,
            "value": "Blue",
            "widget_constructor": "TextLine"
        },
        {
            "allowBlank": false,
            "fieldHint": "Age in years",
            "fieldLabel": "Age",
            "field_max": 200,
            "field_min": 0,
            "id": "age",
            "name": "age",
            "required": true,
            "value": "23",
            "widget_constructor": "Int"
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
            "fieldHint": "This person's best friend.",
            "fieldLabel": "Pet",
            "id": "pet",
            "name": "pet",
            "required": false,
            "values": [
                [
                    "c935d187f0b998ef720390f85014ed1e",
                    "Dog"
                ],
                [
                    "fa3ebd6742c360b2d9652b7f78d9bd7d",
                    "Cat"
                ],
                [
                    "071642fa72ba780ee90ed36350d82745",
                    "Fish"
                ]
            ],
            "widget_constructor": "ComboBox"
        },
        {
            "allowBlank": false,
            "fieldHint": "What is the person like?",
            "fieldLabel": "Temperment",
            "hiddenName": "temperment.value",
            "id": "temperment",
            "name": "temperment",
            "required": true,
            "value": "Right Neighborly",
            "values": [
                [
                    "Nice",
                    "Nice"
                ],
                [
                    "Mean",
                    "Mean"
                ],
                [
                    "Ornery",
                    "Ornery"
                ],
                [
                    "Right Neighborly",
                    "Right Neighborly"
                ]
            ],
            "widget_constructor": "Choice"
        },
        {
            "allowBlank": false,
            "fieldHint": "Weight in lbs?",
            "fieldLabel": "Weight",
            "id": "weight",
            "name": "weight",
            "required": true,
            "widget_constructor": "Decimal"
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
        },
        {
            "allowBlank": false,
            "fieldHint": "Number of siblings",
            "fieldLabel": "Siblings",
            "field_max": 8,
            "field_min": 0,
            "id": "siblings",
            "name": "siblings",
            "required": true,
            "value": "1",
            "widget_constructor": "NumberSpinner"
        },
        {
            "fieldHint": "All my wonderful homes",
            "fieldLabel": "Addresses",
            "id": "addresses",
            "name": "addresses",
            "record_schema": {
                "readonly": false,
                "widgets": [
                    {
                        "fieldHint": "The street",
                        "fieldLabel": "Street",
                        "id": "street",
                        "minLength": 0,
                        "name": "street",
                        "required": true,
                        "widget_constructor": "TextLine"
                    },
                    {
                        "fieldHint": "The city",
                        "fieldLabel": "City",
                        "id": "city",
                        "minLength": 0,
                        "name": "city",
                        "required": true,
                        "widget_constructor": "TextLine"
                    },
                    {
                        "allowBlank": false,
                        "fieldHint": "The awesomeness on a scale of 1 to 10",
                        "fieldLabel": "Awesomeness",
                        "field_max": 10,
                        "field_min": 1,
                        "id": "awesomeness",
                        "name": "awesomeness",
                        "required": true,
                        "widget_constructor": "Int"
                    }
                ]
            },
            "required": true,
            "value": [
                {
                    "awesomeness": "9",
                    "city": "fakeville",
                    "street": "123 fake street"
                },
                {
                    "awesomeness": "9001",
                    "city": "falsetown",
                    "street": "345 false street"
                }
            ],
            "widget_constructor": "List"
        },
        {
            "fieldHint": "Any other notes",
            "fieldLabel": "Other",
            "id": "other",
            "minLength": 0,
            "name": "other",
            "required": true,
            "value": "I've got a magic toenail",
            "widget_constructor": "Text"
        }
    ]
};
