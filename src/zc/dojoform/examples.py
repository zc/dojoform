import zc.ajaxform.application
import zc.ajaxform.calculator_example
import zc.ajaxform.calculator_subapplication_example
import zc.ajaxform.form_example

class Calculator(zc.ajaxform.calculator_example.Calculator):

    def template(self):
        return """<html><head>
               <style type="text/css">@import "http://o.aolcdn.com/dojo/1.4.0/dijit/themes/tundra/tundra.css";</style>
               <script type="text/javascript" src="http://o.aolcdn.com/dojo/1.4.0/dojo/dojo.xd.js"></script>
               <script type="text/javascript" src="/@@/zc.dojoform/zc.dojo.js"></script>
               <script type="text/javascript" src="/@@/zc.dojoform/calculator_example.js"></script>
               </head><body class=tundra></body></html>"""


class Container(zc.ajaxform.calculator_subapplication_example.Container):

    def template(self):
        return """<html><head>
               <style type="text/css">@import "http://o.aolcdn.com/dojo/1.4.0/dijit/themes/tundra/tundra.css";</style>
               <script type="text/javascript" src="http://o.aolcdn.com/dojo/1.4.0/dojo/dojo.xd.js"></script>
               <script type="text/javascript" src="/@@/zc.dojoform/zc.dojo.js"></script>
               <script type="text/javascript" src="/@@/zc.dojoform/container_example.js"></script>
               </head><body class=tundra></body></html>"""


class Form(zc.ajaxform.form_example.FormExample):

    def template(self):
        return """<html><head>
               <style type="text/css">
               @import "http://o.aolcdn.com/dojo/1.4.0/dijit/themes/tundra/tundra.css";</style>

               <style type="text/css" media="all">
               @import url("http://o.aolcdn.com/dojo/1.4.0/dojox/grid/enhanced/resources/tundraEnhancedGrid.css");
               </style>
               <script type="text/javascript" src="http://o.aolcdn.com/dojo/1.4.0/dojo/dojo.xd.js"></script>
               <script type="text/javascript" src="/@@/zc.dojoform/zc.dojo.js"></script>
               <script type="text/javascript" src="/@@/zc.dojoform/form_example.js"></script>
               </head><body class=tundra></body></html>"""

