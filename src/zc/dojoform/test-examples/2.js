definition = {
    "definition": {
        "actions": [
            {
                "label": "Register",
                "name": "ExampleForm.actions.register",
                "url": "ExampleForm/register"
            }
        ],
        groups: [
            {
                'class': 'left',
                id: 'left',
                condition: 'function (v) {return v; }',
                condition_on: ['happy'],
                widgets: ['first_name', 'last_name']
            },
            {
                'class': 'right',
                widgets: ['happy', 'siblings', 'other']

            }
        ],
        "prefix": "ExampleForm",
        "widgets": [
            {
                "hint": "Given name",
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
                condition: 'function (v) {return v; }',
                condition_on: ['happy'],
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
            },
            {
                condition: 'function (v) {return v; }',
                condition_on: ['happy'],
                "allowBlank": false,
                "hint": "Number of siblings",
                "label": "Siblings",
                "field_max": 8,
                "field_min": 0,
                "id": "siblings",
                "name": "siblings",
                "required": true,
                "value": "1",
                "widget_constructor": "NumberSpinner"
            },
            {
                condition: 'function (v) {return v; }',
                condition_on: ['happy'],
                "hint": "All my wonderful homes",
                "label": "Addresses",
                "id": "addresses",
                "name": "addresses",
                "record_schema": {
                    "readonly": false,
                    "widgets": [
                        {
                            "hint": "The street",
                            "label": "Street",
                            "id": "street",
                            "minLength": 0,
                            "name": "street",
                            "required": true,
                            "widget_constructor": "TextLine"
                        },
                        {
                            "hint": "The city",
                            "label": "City",
                            "id": "city",
                            "minLength": 0,
                            "name": "city",
                            "required": true,
                            "widget_constructor": "TextLine"
                        },
                        {
                            "allowBlank": false,
                            "hint": "The awesomeness on a scale of 1 to 10",
                            "label": "Awesomeness",
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
                condition: 'function (v) {return v; }',
                condition_on: ['happy'],
                "hint": "Any other notes",
                "label": "Other",
                "id": "other",
                "minLength": 0,
                "name": "other",
                "required": true,
                "value": "I've got a magic toenail",
                "widget_constructor": "Text"
            }
        ]
    }
}
