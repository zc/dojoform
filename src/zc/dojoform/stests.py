##############################################################################
#
# Copyright (c) 2010 Zope Corporation and Contributors.
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

from zope.testing import doctest
import manuel.doctest
import manuel.testing
import re
import unittest
import zc.seleniumrc.selenium
import zc.seleniumrc.client.selenium


def setUp(test):
    host = 'localhost'
    url = 'http://%s:%s' % (host, zc.seleniumrc.selenium.selenium_config.port)
    port = zc.seleniumrc.selenium.selenium_config.sel_port
    browser = zc.seleniumrc.selenium.selenium_browser
    selenium = zc.seleniumrc.client.selenium.selenium(
        host, port, '*%s' % browser, url)
    selenium.start()
    selenium.window_focus();
    selenium.window_maximize()
    test.globs['selenium'] = selenium


def tearDown(test):
    test.globs['selenium'].stop()


def test_suite():
    mdoc = manuel.doctest.Manuel()
    return manuel.testing.TestSuite(
        mdoc, 'README.txt', setUp=setUp, tearDown=tearDown)


if __name__ == '__main__':
    unittest.main(defaultTest='test_suite')
