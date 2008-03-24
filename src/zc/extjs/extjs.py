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

"""Experimental support for browser "applications"
"""

import cgi
import simplejson
import zc.extjs.interfaces
import zc.resourcelibrary
import zope.app.exception.browser.unauthorized
import zope.app.pagetemplate
import zope.component
import zope.publisher.browser
import zope.publisher.interfaces.browser
import zope.security.proxy
import zope.traversing.interfaces

def page(func):
    func.__is_page__ = True
    return func

def json(func):
    return lambda *a, **k: simplejson.dumps(func(*a, **k))

def result(data):
    if not data:
        data = dict(success=True)
    elif isinstance(data, basestring):
        data = dict(success=False, error=data)
    elif isinstance(data, dict) and not 'success' in data:
        data['success'] = not (('error' in data)
                                 or ('errors' in data))

    return simplejson.dumps(data)

class jsonmethod:

    zope.interface.implementsOnly(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    __is_page__ = True

    def __init__(self, inst, func):
        self.im_self = inst
        self.im_func = func

    def __call__(self, *a, **k):
        return result(self.im_func(self.im_self, *a, **k))

    def browserDefault(self, request):
        return self, ()

class jsonpage(object):

    def __init__(self, func):
        self.func = func

    def __get__(self, inst, cls):
        if inst is None:
            return self
        return jsonmethod(inst, self.func)

class PageTraversable(object):

    zope.interface.implements(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    __Security_checker__ = zope.security.checker.NamesChecker((
        'browserDefault', 'publishTraverse'))

    def publishTraverse(self, request, name):
        name = name.replace('.', '_')
        result = getattr(self, name, None)
        
        if (result is not None
            and
            (zope.publisher.interfaces.browser.IBrowserPublisher.providedBy(
                result)
             or
             getattr(result, '__is_page__', None)
             or
             getattr(getattr(result, 'im_func', None), '__is_page__', None)
             )
            ):
            zope.interface.directlyProvides(request,
                                            zc.extjs.interfaces.IAjaxRequest)
            return result
        raise zope.publisher.interfaces.NotFound(self, name, request)    

    @property
    def base_href(self):
        return self.base                # BBB

class Application(PageTraversable):

    zope.component.adapts(
        zope.traversing.interfaces.IContainmentRoot,
        zope.publisher.interfaces.browser.IBrowserRequest,
        )

    trusted = True
    
    def __init__(self, context, request):
        if self.trusted:
            context = zope.security.proxy.removeSecurityProxy(context)
        self.context = context
        self.request = request

    def browserDefault(self, request):
        return self, ('index.html', )

    def title(self):
        return self.__class__.__name__

    def js_module(self):
        return self.__class__.__module__

    def resource_library(self):
        return self.__class__.__module__ + '.' + self.__class__.__name__

    def initial_data(self):
        return {}

    @page
    @json
    def js_data(self):
        return self.initial_data()

    def template(self):
        return ('<html><head><title>%s</title></head><body>\n'
                '</body></html>\n'
                % cgi.escape(self.title())
                )

    @page
    def index_html(self):
        library = self.resource_library()
        if library is not None:
            zc.resourcelibrary.need(library)
        return self.template()

class traverser(object):

    def __init__(self, func, inst=None):
        self.func = func
        self.inst = inst
    
    def __get__(self, inst, cls):
        if inst is None:
            return self
        return traverser(self.func, inst)

    zope.interface.implements(
        zope.publisher.interfaces.browser.IBrowserPublisher)

    __Security_checker__ = zope.security.checker.NamesChecker((
        'publishTraverse', ))

    def publishTraverse(self, request, name):
        return self.func(self.inst, request, name)

    def __call__(self, *args, **kw):
        if self.inst is None:
            return self.func(*args, **kw)
        else:
            return self.func(self.inst, *args, **kw)
            
