======================
Dojo widgets and forms
======================

Dojoform provides client-side form and widget implementations in JavaScript
using the Dojo framework.


Using zc.dojoform
=================

To use dojoform, we need to include ``zc.dojo.js``.  This is available as a
resource library [1]_.

``zc.dojo.js`` depends on the Dojo framework.  Currently, this must be
included manually.


Form building
=============

Forms are built by calling the `build_form()` function.

Often, the configuration object containing the form definition will be
provided through an AJAX method, in which case `call_server()` will be used
as well.

A typical use will look like so::

    zc.dojo.call_server({
        'url': 'MyForm',
        'task': 'Loading form',
        'success': function(formData) {
            var form = zc.dojo.build_form(
                formData,
                dojo.create('div', null, dojo.body())
                );
            form.startup();
            form.resize();
        }
    });


Widgets
=======

The following widgets are provided:

- zc.ajaxform.widgets.BasicDisplay
- zc.ajaxform.widgets.BoolDisplay
- zc.ajaxform.widgets.ComboBox
- zc.ajaxform.widgets.DateRange
- zc.ajaxform.widgets.Hidden
- zc.ajaxform.widgets.IntRange
- zc.ajaxform.widgets.NumberSpinner
- zc.ajaxform.widgets.RangeDisplay
- zc.ajaxform.widgets.RichText
- zc.ajaxform.widgets.RichTextDisplay
- zope.schema.Bool
- zope.schema.Choice
- zope.schema.Date
- zope.schema.Decimal
- zope.schema.Int
- zope.schema.List
- zope.schema.Object
- zope.schema.Password
- zope.schema.Text
- zope.schema.TextLine
- zope.schema.Time


Todo
====

1. Provide a more maintainable alternative to `build_form`

   - This should provide a method of customizing layouts

2. All styles should be defined in external CSS files.  No styles should be
   set in the widget and form implementations directly (classes should be
   used instead)

3. Provide improved widget loading (See
   `http://wiki.zope.com/Dojoform_Widget_Loading`_)

4. Improve dojoform resource dependencies.  Right now, it's hard to include
   dojoform as a resource library because it doesn't depend on a library that
   provides the Dojo framework (although it should).

   Fixing this will also involve providing some way of specifying script
   configuration sections, since these are sometimes needed in Dojo
   applications. (Example: ``zc.z4m.redirect/redirect.pt``)


.. [1] See ``zc.resourcelibrary``
