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

import simplejson
import zope.component
import zc.extjs.interfaces
import zope.exceptions.interfaces
import zope.security.exceptions.interfaces

class Unauthorized:

    zope.component.adapts(zope.security.exceptions.interfaces.IUnauthorized,
                          zc.extjs.interfaces.IAjaxRequest)

    def __init__(self, context, request):
        pass

    def __call__(self):
        return simplejson.dumps(dict(session_expired = True))

class UserError(zope.publisher.browser.BrowserPage):

    zope.component.adapts(zope.exceptions.interfaces.IUserError,
                          zc.extjs.interfaces.IAjaxRequest)

    def __init__(self, context, request):
        self.context = context

    def __call__(self):
        return simplejson.dumps(dict(error = str(self.context)))

    
