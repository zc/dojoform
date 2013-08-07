import bobo
import os
import json

here = os.path.dirname(__file__)

def read_test_file(name):
    f = open(os.path.join(here, 'test-examples', name))
    r = f.read()
    f.close()
    return r

get_example_template = """
<script type="text/javascript">
%(definition)s;

require(["dojo/_base/window", "zc.dojoform", "zc.dojoform/List",
         "dojo/domReady!"],
        function (window, dojoform) {
    form = dojoform(definition);
    window.body().appendChild(form.domNode);
    form.startup();
});
</script>
</head>
"""


@bobo.query('/get_example')
def get_example(bobo_request, name):
    html = read_test_file("blank.html")
    definition = read_test_file(name)
    return html.replace(
        '</head>',
        get_example_template % dict(definition=definition),
        )

@bobo.query('/get_form', content_type='application/json')
def get_form(bobo_request):
     js = read_test_file('1.js').replace('definition = ', '')
     data = json.loads(js)
     del data['definition']['actions'][0]['handler']
     data['definition']['actions'][0]['url'] = '/action'
     return data


@bobo.query('/action', content_type='application/json')
def action(bobo_request):
     js = read_test_file('1.js').replace('definition = ', '')
     data = json.loads(js)
     for widget in data['definition']['widgets']:
         if widget['id'] == 'addresses':
             ix = 0
             form_val = []
             for value in widget['value']:
                 form_r_value = {}
                 for wname, wvalue in value.items():
                     form_r_value[wname] = bobo_request.POST['.'.join(
                         ('addresses', wname, str(ix)))]
                 form_val.append(form_r_value)
                 ix += 1
             test = True
         else:
             form_val = bobo_request.POST[widget['id']]
         val = widget.get('value', None)
         if form_val == '':
             form_val = None
         if isinstance(val, bool):
             val = 'on' if val else ''
         if form_val != val:
             print widget['id']
             print form_val
             print val
             return {'success': False, 'error': 'awww'}
     return {'success': True, 'message': 'yay!'}
