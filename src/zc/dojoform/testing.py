import bobo
import os
import simplejson

here = os.path.dirname(__file__)

def read_test_file(name):
    f = open(os.path.join(here, 'test-examples', name))
    r = f.read()
    f.close()
    return r


@bobo.query('/get_form', content_type='application/json')
def get_form(bobo_request):
     js = read_test_file('1.js').replace('definition = ', '')
     json = simplejson.loads(js)
     del json['definition']['actions'][0]['handler']
     json['definition']['actions'][0]['url'] = '/action'
     return json


@bobo.query('/action', content_type='application/json')
def action(bobo_request):
     return {'success': True, 'message': 'yay!'}
