##############################################################################
#
# Copyright (c) Zope Corporation and Contributors.
# All Rights Reserved.
#
# This software is subject to the provisions of the Zope Public License,
# Version 2.1 (ZPL).  A copy of the ZPL should accompany this distribution.
# THIS SOFTWARE IS PROVIDED "AS IS" AND ANY AND ALL EXPRESS OR IMPLIED
# WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST INFRINGEMENT, AND FITNESS
# FOR A PARTICULAR PURPOSE.
#
##############################################################################

import zc.extjs.extjs
import zope.cachedescriptors.property
import zope.formlib.form
import zope.publisher.interfaces.browser
import zope.security.checker

class FormType(type):

    def __get__(self, inst, class_):
        if inst is None:
            return self
        return self(inst)

_FormBase = FormType('_FormBase', (object, ), {})

class Form(_FormBase):

    zope.interface.implementsOnly(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    __is_page__ = True

    __Security_checker__ = zope.security.checker.NamesChecker((
        '__call__', 'browserDefault', 'publishTraverse'))

    def __init__(self, page):
        self.page = page

    @zope.cachedescriptors.property.Lazy
    def prefix(self):
        return self.__class__.__name__

    @zope.cachedescriptors.property.Lazy
    def context(self):
        return self.page.context

    @zope.cachedescriptors.property.Lazy
    def base(self):
        base = getattr(self.page, 'base', None)
        if base is not None:
            base += '/'
        else:
            base = ''
        return base+self.__class__.__name__

    @zope.cachedescriptors.property.Lazy
    def request(self):
        return self.page.request

    def get_definition(self):
        widgets = zope.formlib.form.setUpWidgets(
            self.form_fields, self.prefix, self.context, self.request,
            ignore_request=True)

        return dict(
            widgets = [widget.js_config() for widget in widgets],
            actions = [dict(label=action.label,
                            url="%s/%s" % (base,
                                          action.__name__.split('.')[-1],
                                          ),
                            name=action.__name__,
                            )
                       for action in self.actions],
            )
        
    def __call__(self):
        """Return rendered js widget configs
        """
        return zc.extjs.extjs.result(dict(definition=self.get_definition()))
    
    def browserDefault(self, request):
        return self, ()

    def publishTraverse(self, request, name):
        name = name.replace('.', '_')
        result = getattr(self, name, None)
        if (result is not None):
            if (getattr(result, '__is_page__', None)
                or
                getattr(getattr(result, 'im_func', None), '__is_page__', None)
                ):
                return result
            elif isinstance(result, zope.formlib.form.Action):
                return Action(self, result)
        

        raise zope.publisher.interfaces.NotFound(self, name, request)

    def getObjectData(self, ob, extra):
        widgets = zope.formlib.form.setUpWidgets(
            self.form_fields, self.prefix, self.context, self.request,
            ignore_request=True)

        result = {}
        for widget in widgets:
            if widget.name in extra:
                result[widget.name] = extra[widget.name]
            else:
                result[widget.name] = widget.context.get(ob)

        return result

class Action:

    zope.interface.implementsOnly(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    def __init__(self, page, action):
        self.page = page
        self.action = action

    def __call__(self):
        widgets = zope.formlib.form.setUpWidgets(
            self.page.form_fields,
            self.page.prefix,
            self.page.context,
            self.page.request,
            ignore_request=True)
        data = {}
        errors = zope.formlib.form.getWidgetsData(
            widgets, self.page.prefix, data)
        if errors:
            errors = {}
            for widget in widgets:
                error = widget.error()
                if not error:
                    continue
                
                if not isinstance(error, basestring):
                    view = zope.component.getMultiAdapter(
                        (error, self.page.request),
                        zope.app.form.browser.interfaces.IWidgetInputErrorView,
                        )
                    title = getattr(error, 'widget_title', None) # duck typing
                    error = view.snippet()
                    
                errors[widget.name] = error

            return zc.extjs.extjs.result(dict(errors=errors))

        # XXX action validator and failure handlers

        return zc.extjs.extjs.result(self.action.success(data))

    def browserDefault(self, request):
        return self, ()
