import cgi
import zc.ajaxform.application
import zc.ajaxform.calculator_example
import zc.ajaxform.calculator_subapplication_example
import zc.ajaxform.form_example
import zope.formlib.form

DOJO_VERSION = '1.4'
DOJO_THEME = 'tundra'

template = """
<html>
    <head>
        <style type="text/css" medial="all">
            @import url("http://o.aolcdn.com/dojo/%(dojo)s/dijit/themes/%(theme)s/%(theme)s.css");
            @import url("http://o.aolcdn.com/dojo/%(dojo)s/dojox/grid/enhanced/resources/%(theme)sEnhancedGrid.css");
        </style>
        <script type="text/javascript" src="http://o.aolcdn.com/dojo/%(dojo)s/dojo/dojo.xd.js"></script>
        <script type="text/javascript" src="/@@/zc.dojoform/zc.dojo.js"></script>
        <script type="text/javascript" src="/@@/zc.dojoform/%(name)s_example.js"></script>
    </head>
    <body class="%(theme)s">
    </body>
</html>""".strip()


class Base:

    def template(self):
        version = cgi.escape(self.request.form.get('dojo', DOJO_VERSION))
        theme = cgi.escape(self.request.form.get('theme', DOJO_THEME))
        return template % dict(dojo=version,
                               theme=theme,
                               name=self.__class__.__name__.lower())


class Calculator(Base, zc.ajaxform.calculator_example.Calculator):
    pass


class Container(Base, zc.ajaxform.calculator_subapplication_example.Container):
    pass


class Form(Base, zc.ajaxform.form_example.FormExample):

    class ExampleForm(zc.ajaxform.form_example.FormExample.ExampleForm):

        actions = zc.ajaxform.form_example.FormExample.ExampleForm.actions
        form_fields = zc.ajaxform.form_example.FormExample.ExampleForm.form_fields

        @zope.formlib.form.action('Validate')
        def validate(self, action, data):
            return dict(success=True, message='Form validated.')
