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

import zc.slots.interfaces
import zope.app.form
import zope.app.form.interfaces
import zope.app.form.browser.interfaces
import zope.interface
import zope.component
import zope.schema.interfaces

class Base(zope.app.form.InputWidget):

    zope.interface.implements(zope.app.form.interfaces.IInputWidget)

    _error = None
    def error(self):
        return self._error
    
    def js_config(self):
        config = dict(
            widget = self.__class__.__name__,
            fieldLabel = self.label,
            fieldHint = self.hint,
            name = self.name,
            )

        if self._renderedValueSet():
            config.value = self._toForm(self._data)
        
        return config 

    def _toForm(v):
        return v

    def _toValue(v):
        return v

    def hasInput(self):
        return self.name in self.request.form

    def getInputValue(self):
        if not self.hasInput():
            raise zope.app.form.interfaces.MissingInputError(
                self.name, self.label, None)

        raw = self.request.form[self.name]
        try:
            value = self._toValue(raw)
        except zope.app.form.interfaces.ConversionError, error:
            self._error = error
            raise self._error

        # value must be valid per the field constraints
        try:
            self.context.validate(value)
        except zope.schema.interfaces.ValidationError, v:
            self._error = WidgetInputError(
                self.context.__name__, self.label, v)
            raise self._error
 

class InputBool(Base):

    zope.component.adapts(
        zope.schema.interfaces.IBool,
        zc.extjs.interfaces.IAjaxRequest,
        )

    def _toForm(self, v):
        return bool(v)
    
class InputChoice(Base):

    zope.component.adapts(
        zope.schema.interfaces.IChoice,
        zc.extjs.interfaces.IAjaxRequest,
        )

    zope.interface.implements(zope.app.form.interfaces.IInputWidget)

    def js_config(self):
        result = Base.js_config(self)
        terms = zope.component.getMultiAdapter(
            (self.context.source, self.request),
            zope.app.form.browser.interfaces.ITerms,
            )
        result['values'] = [
            [term.token, term.title]
            for term in (terms.getTerm(v) for v in self.context.source)
            ]

        return result

class InputInt(Base):

    zope.component.adapts(
        zope.schema.interfaces.IInt,
        zc.extjs.interfaces.IAjaxRequest,
        )

    def _toValue(self, v):
        try:
            return int(v)
        except:
            raise zope.app.form.interfaces.ConversionError(
                u"Invalid integer: %r" % v
                )

class InputTextLine(Base):

    zope.component.adapts(
        zope.schema.interfaces.ITextLine,
        zc.extjs.interfaces.IAjaxRequest,
        )
    
