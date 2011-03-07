var definition = {
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
                bool_flag: 'happy',
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
                "fieldHint": "Given name.",
                "fieldLabel": "First name",
                "id": "first_name",
                "minLength": 0,
                "name": "first_name",
                "required": true,
                "value": "Happy",
                "widget_constructor": "zope.schema.TextLine"
            },
            {
                "fieldHint": "Family name.",
                "fieldLabel": "Last name",
                "id": "last_name",
                "minLength": 0,
                "name": "last_name",
                "required": true,
                "value": "Camper",
                "widget_constructor": "zope.schema.TextLine"
            },
            {
                "fieldHint": "Are they happy?",
                "fieldLabel": "Happy",
                "id": "happy",
                "name": "happy",
                "required": false,
                "value": true,
                "widget_constructor": "zope.schema.Bool"
            },
            {
                bool_flag: 'happy',
                "fieldHint": "What do they look like?",
                "fieldLabel": "Description",
                "id": "description",
                "minLength": 0,
                "name": "description",
                "required": true,
                "value": "10ft tall\nRazor sharp scales.",
                "widget_constructor": "zope.schema.Text"
            },
            {
                "fieldHint": "Don't tell anybody",
                "fieldLabel": "Secret Key",
                "id": "secret",
                "name": "secret",
                "required": true,
                "value": "5ecret sauce",
                "widget_constructor": "zc.ajaxform.widgets.Hidden"
            },
            {
                bool_flag: 'happy',
                "allowBlank": false,
                "fieldHint": "Number of siblings",
                "fieldLabel": "Siblings",
                "field_max": 8,
                "field_min": 0,
                "id": "siblings",
                "name": "siblings",
                "required": true,
                "value": "1",
                "widget_constructor": "zc.ajaxform.widgets.NumberSpinner"
            },
            {
                bool_flag: 'happy',
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
                            "widget_constructor": "zope.schema.TextLine"
                        },
                        {
                            "fieldHint": "The city",
                            "fieldLabel": "City",
                            "id": "city",
                            "minLength": 0,
                            "name": "city",
                            "required": true,
                            "widget_constructor": "zope.schema.TextLine"
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
                            "widget_constructor": "zope.schema.Int"
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
                "widget_constructor": "zope.schema.List"
            },
            {
                bool_flag: 'happy',
                "fieldHint": "Any other notes",
                "fieldLabel": "Other",
                "id": "other",
                "minLength": 0,
                "name": "other",
                "required": true,
                "value": "I've got a magic toenail",
                "widget_constructor": "zope.schema.Text"
            }
        ]
    }
}
