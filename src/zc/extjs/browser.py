##############################################################################
#
# Copyright (c) 2007 Zope Corporation and Contributors.
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
"""Experimental support for browser "applications"
"""

import sys

import simplejson

import zope.app.pagetemplate
import zope.schema.interfaces

import zope.component
import zope.component._declaration
import zope.publisher.browser
import zope.publisher.interfaces.browser
import zope.security.proxy
import zope.traversing.interfaces

import zc.resourcelibrary

def page(func):
    func.__is_page__ = True
    return func

def json(func):
    return lambda *a, **k: simplejson.dumps(func(*a, **k))

class jsonmethod(object):
    zope.interface.implementsOnly(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    __is_page__ = True

    def __init__(self, inst, func):
        self.im_self = inst
        self.im_func = func

    def __call__(self, *a, **k):
        result = self.im_func(self.im_self, *a, **k)
        if not result:
            result = {}
        elif isinstance(result, basestring):
            result = dict(error=result)

        return simplejson.dumps(result)

    def browserDefault(self, request):
        return self, ()


class jsonpage(object):
    """A decorator for methods returning JSON data.

    The returned value is automatically serialized into JSON.  If you
    return a string, it is put in a dict {'error': s}.

    The decorated methods can be traversed into easily
    (see ExtApplication.publishTraverse).
    """

    def __init__(self, func):
        self.func = func

    def __get__(self, inst, cls):
        if inst is None:
            return self
        return jsonmethod(inst, self.func)


def jsonvocabulary(vocab_factory, sort_vocab=True):
    """A vocabulary exposed through JSON.

    The contents are returned as a list of tuples [(token, title)].

    Here's an example of usage:

        class MyApp(zc.extjs.browser.ExtApplication):
            persons = zc.ext.browser.jsonvocabulary('Person')
            rooms = zc.ext.browser.jsonvocabulary(RoomVocabulary)

    """
    def method(self):
        if isinstance(vocab_factory, basestring):
            factory = zope.component.getUtility(
                  zope.schema.interfaces.IVocabularyFactory, vocab_factory)
        else:
            factory = vocab_factory
        vocabulary = factory(self.context)
        # TODO: Return dicts {key: X, value: Y} instead of tuples.
        values = [(t.token, t.title) for t in vocabulary]
        if sort_vocab:
            values = sorted(values)
        return dict(data=values)
    return jsonpage(method)


class ExtApplication(zope.publisher.browser.BrowserView):

    zope.interface.implementsOnly(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    trusted = True

    def __init__(self, context, request):
        if self.trusted: # XXX remove this
            context = zope.security.proxy.removeSecurityProxy(context)
        self.context = context
        self.request = request

    def browserDefault(self, request):
        return self, ('index.html', )

    def publishTraverse(self, request, name):
        name = name.replace('.', '_')
        result = getattr(self, name, None)
        if (result is not None
            and (getattr(result, '__is_page__', None)
            or getattr(getattr(result, 'im_func', None), '__is_page__', None)
            )):
            return result
        raise zope.publisher.interfaces.NotFound(self, name, request)

    def title(self):
        return self.__class__.__name__

    def js_module(self):
        return self.__class__.__module__

    def resource_library(self):
        return self.__class__.__module__ + '.' + self.__class__.__name__

    def initial_data(self):
        return {}

    # TODO: Why not @jsonpage?
    @page
    @json
    def js_data(self):
        return self.initial_data()

    template = zope.app.pagetemplate.ViewPageTemplateFile("macros.pt")

    @page
    def index_html(self):
        library = self.resource_library()
        if library is not None:
            zc.resourcelibrary.need(library)
        return self.template()


# XXX shouldn't have to use so much internal info
def view_for(iface):
    frame = sys._getframe(1)
    locals = frame.f_locals

    # Try to make sure we were called from a class def. In 2.2.0 we can't
    # check for __module__ since it doesn't seem to be added to the locals
    # until later on.
    if (locals is frame.f_globals) or (
        ('__module__' not in locals) and sys.version_info[:3] > (2, 2, 0)):
        raise TypeError("adapts can be used only from a class definition.")

    if '__component_adapts__' in locals:
        raise TypeError("adapts can be used only once in a class definition.")

    locals['__component_adapts__'] = zope.component._declaration._adapts_descr(
        (iface, zope.publisher.interfaces.browser.IBrowserRequest)
        )
