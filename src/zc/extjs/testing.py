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

import base64
import pprint
import simplejson
import urllib
import zope.interface
import zope.app.security.interfaces
import zope.security.interfaces
import zope.security.simplepolicies
import zope.security.checker

def _marshal_scalar(n, v):
    if not isinstance(v, str):
        if isinstance(v, bool):
            return "%s:boolean=%s" % (n, v and '1' or '')
        if isinstance(v, int):
            return "%s:int=%s" % (n, v)
        if isinstance(v, float):
            return "%s:float=%s" % (n, v)
        if isinstance(v, unicode):
            return "%s=%s" % (n, urllib.quote(v.encode('utf-8')))
        raise ValueError("can't marshal %r" % v)
    return "%s=%s" % (n, urllib.quote(v.encode('ascii')))
    
def call_form(browser, url, __params=(), **params):

    browser.addHeader('X-Requested-With', 'XMLHTTPRequest')
    if params or __params:
        params = params.copy()
        params.update(__params)
        query = []
        for n, v in params.items():
            if isinstance(v, list):
                n += ':list'
                for vv in v:
                    query.append(_marshal_scalar(n, vv))
            else:
                query.append(_marshal_scalar(n, v))

        browser.open(url, '&'.join(query))
    else:
        browser.open(url)

    # XXX TestBrowser needs a removeHeader
    browser.mech_browser.addheaders[:] = [
        header for header in browser.mech_browser.addheaders
        if header[0] != 'X-Requested-With']

    return simplejson.loads(browser.contents)

def print_form(*a, **kw):
    pprint.pprint(call_form(*a, **kw), width=1)


class Principal:

    description = ''

    def __init__(self, id):
        self.id = id
        self.title = 'principal: '+id

class UnauthenticatedPrincipal:

    id = 'unauthenticatedprincipal'
    title = u'UnauthenticatedPrincipal'
    description = u''

unauthenticatedPrincipal = UnauthenticatedPrincipal()

class DumbAuth:

    zope.interface.implements(zope.app.security.interfaces.IAuthentication)

    def authenticate(self, request):
        if request._auth:
            if request._auth.lower().startswith(u'basic '):
                credentials = request._auth.split()[-1]
                login, password = base64.decodestring(credentials).split(':')
                return Principal(login)

    def unauthenticatedPrincipal(self):
        return unauthenticatedPrincipal

    def unauthorized(self, id, request):
        request.response.setHeader("WWW-Authenticate", 'basic realm="test"',
                                   literal=True)
        request.response.setStatus(401)

    def getPrincipal(self, id):
        return Principal(id)

class AuthenticatedAllowed(zope.security.simplepolicies.ParanoidSecurityPolicy):

    def checkPermission(self, permission, object):
        if permission is zope.security.checker.CheckerPublic:
            return True

        users = [p.principal
                 for p in self.participations
                 if p.principal is unauthenticatedPrincipal]

        return not users


    
