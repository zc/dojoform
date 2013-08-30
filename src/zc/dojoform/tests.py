##############################################################################
#
# Copyright (c) Zope Foundation and Contributors.
# All Rights Reserved.
#
# This software is subject to the provisions of the Zope Public License,
# Version 2.0 (ZPL).  A copy of the ZPL should accompany this distribution.
# THIS SOFTWARE IS PROVIDED "AS IS" AND ANY AND ALL EXPRESS OR IMPLIED
# WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST INFRINGEMENT, AND FITNESS
# FOR A PARTICULAR PURPOSE.
#
##############################################################################
import bobo
import boboserver
import doctest
import os
import json
import zc.htmlchecker
import zc.wsgidriver

here = os.path.dirname(__file__)

def read_test_file(name):
    f = open(os.path.join(here, 'test-examples', name))
    r = f.read()
    f.close()
    return r

dojo_base = "//ajax.googleapis.com/ajax/libs/dojo/1.9.1/"

@bobo.query('/get_example')
def get_example(bobo_request, name=None):
    scripts = (
        """
        var dojoConfig = {
        packages: [
        {
                 name: "zc.dojoform",
                 location: "/resources/dojoform"
                }
            ],
            isDebug: true
        };
        """,
        "/resources/ckeditor/ckeditor.js",
        dojo_base + "dojo/dojo.js",
        )
    if name:
        scripts += (
            read_test_file(name),
            """
            require(["dojo/_base/window", "zc.dojoform", "zc.dojoform/List",
                     "dojo/domReady!"],
                    function (window, dojoform) {
                form = dojoform(definition);
                window.body().appendChild(form.domNode);
                form.startup();
            });
            """,
            )

    return zc.wsgidriver.html(
        css = (
            dojo_base + "dojo/resources/dojo.css",
            dojo_base + "dijit/themes/tundra/tundra.css",
            dojo_base + "dojox/grid/enhanced/resources/EnhancedGrid.css",
            dojo_base + "dojox/grid/enhanced/resources/tundra/EnhancedGrid.css",
            dojo_base + "dojox/grid/enhanced/resources/EnhancedGrid_rtl.css",
            "/resources/zc.dojo.css",
            ),
        scripts = scripts,
        body =
        '<body class="tundra" style="height: 100%; width: 100%;"></body>',
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

static = boboserver.static('/resources', os.path.join(here, 'resources'))

app = bobo.Application(bobo_resources = __name__)

def start_server(*a, **k):
    zc.wsgidriver.start_server(app, *a, **k)

def setUp(test):
    zc.wsgidriver.setUp(test, app)
    test.globs['read_test_file'] = read_test_file
    checker = zc.htmlchecker.HTMLChecker()
    test.globs['matches'] = lambda obs, exp: checker.check(exp, obs)

def test_suite():
    return zc.wsgidriver.TestSuite(
        'build.test',
        'rangewidget.test',
        'datetime.test',
        'ckwidget.test',
        'recordlistwidget.test',
        setUp=setUp, tearDown=zc.wsgidriver.tearDown,
        optionflags=doctest.ELLIPSIS | doctest.NORMALIZE_WHITESPACE)

#     return manuel.testing.TestSuite(
#         manuel.doctest.Manuel(parser=zc.customdoctests.js.parser) +
#         manuel.doctest.Manuel(parser=zc.customdoctests.js.eq_parser) +
#         manuel.doctest.Manuel(
#             optionflags=doctest.NORMALIZE_WHITESPACE | doctest.ELLIPSIS) +
#         manuel.capture.Manuel(),
#         'build.test',
#         'rangewidget.test',
#         'datetime.test',
#         'ckwidget.test',
#         'recordlistwidget.test',
#         setUp=setUp, tearDown=tearDown)

# if __name__ == '__main__':
#     unittest.main(defaultTest='test_suite')

