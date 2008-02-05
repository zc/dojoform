##############################################################################
#
# Copyright (c) 2002 Zope Corporation.  All Rights Reserved.
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

import logging

import zope.security.interfaces

logger = logging.getLogger(__name__)

def raising(exc_info, request=None):
    if isinstance(exc_info[1], zope.security.interfaces.Unauthorized):
        return
    
    if request is not None:
        logger.error(request.URL, exc_info=exc_info)
    else:
        logger.error('', exc_info=exc_info)
        
