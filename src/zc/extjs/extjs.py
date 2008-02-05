##############################################################################
#
# Copyright (c) 2005 Zope Corporation. All Rights Reserved.
#
# This software is subject to the provisions of the Zope Visible Source
# License, Version 1.0 (ZVSL).  A copy of the ZVSL should accompany this
# distribution.
#
# THIS SOFTWARE IS PROVIDED "AS IS" AND ANY AND ALL EXPRESS OR IMPLIED
# WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST INFRINGEMENT, AND FITNESS
# FOR A PARTICULAR PURPOSE
#
##############################################################################
"""Experimental extjs support
"""

import logging
import simplejson

import zope.security.proxy
import zope.schema.interfaces

import browser


logger = logging.getLogger(__name__)

class Result(object):
    """A form submission result object.

    A `result` is passed as an argument to form handler methods.
    """

    def __init__(self):
        self.success = True
        self.errors = {}
        self.data = {}

    def error(self, name, message=None):
        """Show an error next to a specified field.

        Make sure that a field with the given name is on the JavaScript form,
        or you will get a JS error.
        """
        if message is None:
            return self.error('page', name)

        self.success = False
        error = self.errors.get(name)
        if error:
            error += u'<br />%u' % message
        else:
            error = unicode(message)
        self.errors[name] = error

    def __unicode__(self):
        return simplejson.dumps(dict(
            success = self.success,
            errors = [dict(id=k, msg=v) for (k, v) in self.errors.items()],
            data = self.data,
            ))

    def validate(self, data, iface, fields=None):
        """Validate data according to a schema.

        Flags erroneous fields on the client side.

        If you do not want to check all fields, you can specify a list of
        field names in `fields`.
        """
        if fields is None:
            fields = list(iface)
        for name in fields:
            field = iface[name]
            value = data[name]
            if zope.schema.interfaces.IText.providedBy(field):
                # Hack to make sure that empty Text/TextLine fields are checked.
                if not value:
                    value = None
            if zope.schema.interfaces.IField.providedBy(field):
                try:
                    field.validate(value)
                except Exception, e:
                    self.error(name, message=str(e))


class FormMethod(object):

    __is_page__ = True

    zope.interface.implementsOnly(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    def __init__(self, *args):
        self.args = args

    def browserDefault(self, request):
        return self, ()

    def __call__(self):
        inst, func = self.args
        result = Result()
        try:
            func(inst, result)
        except Exception, v:
            logging.exception('Calling an extjs form')
            # XXX error formatting
            result.error('page', v)
            raise
        return unicode(result)


class FormHandler(object):

    def __init__(self, func=None):
        self.func = func

    def __get__(self, inst, cls):
        if inst is None:
            return self

        return FormMethod(inst, self.func)


def apply_changes(context, data, fields=None):
    if fields is None:
        fields = data.keys()
    for key in fields:
        value = data[key]
        if getattr(context, key) != value:
            setattr(context, key, value)
