##############################################################################
#
# Copyright (c) 2009 Zope Corporation and Contributors.
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
import zc.ajaxform.interfaces
import zc.ajaxform.schema
import zc.ajaxform.widgets
import zope.schema.interfaces


class CKEditorWidget(zc.ajaxform.widgets.InputText):
    """A CKEditor widget.
    """
    zope.component.adapts(
        zc.ajaxform.schema.RichHTML,
        zc.ajaxform.interfaces.IAjaxRequest)

    widget_constructor = 'zc.dojoform.ckeditor.CKEditor'
