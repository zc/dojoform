##############################################################################
#
# Copyright (c) Zope Foundation and Contributors.
# All Rights Reserved.
#
# This software is subject to the provisions of the Zope Public License,
# Version 2.0 (ZPL).  A copy of the ZPL should accompany this distribution.
# THIS SOFTWARE IS PROVIDED "AS IS" AND ANY AND ALL EXPRESS OR IMPLIED
# WARRANTIES ARE DISCLAIMED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF TITLE, MERCHANTABILITY, AGAINST INFRINGEMENT, AND FITNESS
# FOR A PARTICULAR PURPOSE.
#
##############################################################################
from __future__ import absolute_import

import BeautifulSoup
import bobo
import doctest
import manuel.capture
import manuel.doctest
import manuel.testing
import os
import re
import selenium.webdriver
import signal
import subprocess
import threading
import unittest
import wsgiref.simple_server
import zc.customdoctests.js

from zope.testing import doctest

home = None # set by buildout
here = os.path.dirname(__file__)

def maybe_encode(s):
    if isinstance(s, unicode):
        s = s.encode('utf8')
    return s

def matches(observed, expected):
    observed = BeautifulSoup.BeautifulSoup(observed).form
    expected = BeautifulSoup.BeautifulSoup(expected).form
    try:
        matches_(observed, expected)
    except AssertionError, e:
        message, expected, observed = e.args
        print maybe_encode(message)
        print '\nExpected:'
        if not isinstance(expected, basestring):
            expected = expected.prettify()
        print maybe_encode(expected)
        print '\nObserved:'
        if not isinstance(observed, basestring):
            observed = observed.prettify()
        print maybe_encode(observed)

def beautifulText(node):
    if isinstance(node, unicode):
        return node
    if hasattr(node, 'name'):
        return u' '.join(beautifulText(c) for c in node)
    return ''

def matches_(observed, expected):
    if getattr(expected, 'name', None) != getattr(observed, 'name', None):
        raise AssertionError("tag names don't match", expected, observed)

    wild = False
    for name, e_val in expected.attrs:
        if name == 'xxx':
            wild = True
            continue

        o_val = observed.get(name)
        if o_val is None:
            raise AssertionError("missing "+name, expected, observed)

        if (e_val != o_val and not
            (re.match(r'^/.+/$', e_val) and re.match(e_val[1:-1], o_val))
            ):

            if name == 'class':
                oclasses = set(o_val.strip().split())
                for cname in e_val.strip().split():
                    if cname not in oclasses:
                        raise AssertionError("missing class: "+cname,
                                             expected, observed)
            else:
                raise AssertionError(
                    "attribute %s has different values: %r != %r"
                    % (name, e_val, o_val),
                    expected, observed)

    if wild:
        match_text = ''
        for enode in expected:
            if hasattr(enode, 'name'):
                if enode.get('id'):
                    onode = observed(id=enode['id'])
                    if not onode:
                        raise AssertionError(
                            "In wildcard id search, couldn't find %r" %
                            enode['id'],
                            enode, observed)
                    matches_(onode[0], enode);
                else:
                    for onode in observed(enode.name):
                        try:
                            matches_(onode, enode);
                        except AssertionError:
                            pass
                        else:
                            break
                    else:
                        raise AssertionError(
                            "Couldn't find wildcard match", enode, observed)
            else:
                match_text += ' ' + enode.encode('utf8')

        match_text = match_text.strip()
        if match_text:
            text = beautifulText(observed)
            for token in match_text.split():
                try:
                    i = text.index(token)
                except ValueError:
                    raise AssertionError(token + " not found in text content.",
                                         expected, observed)
                text = text[i+len(token):]
    else:
        enodes = [n for n in expected
                  if not isinstance(n, basestring) or n.strip()]
        onodes = [n for n in observed
                  if not isinstance(n, basestring) or n.strip()]
        if len(enodes) != len(onodes):
            raise AssertionError(
                "Wrong number of children %r!=%r"
                % (len(onodes), len(enodes)),
                expected, observed)
        for enode, onode in zip(enodes, onodes):
            if hasattr(enode, 'name') or hasattr(onode, 'name'):
                matches_(onode, enode)
            else:
                e = beautifulText(enode).strip()
                o = beautifulText(onode).strip()
                if e != o:
                    raise AssertionError(
                        'text nodes differ %r != %r' % (e, o),
                        expected, observed)

def read_test_file(name):
    f = open(os.path.join(here, 'test-examples', name))
    r = f.read()
    f.close()
    return r

def setUp(test):
    test.globs.update(
        read_test_file = read_test_file,
        selenium = selenium,
        matches = matches,
        port = SeleniumLayer.port,
        )


bobo_resources_template = """
boboserver:static('/test', %r)
boboserver:static('/dojoform', %r)
boboserver:static('/dojo', %r)
"""

class SeleniumLayer:
    bobo_running = False

    @classmethod
    def setUp(self):
        if not self.bobo_running:
            app = bobo.Application(bobo_resources=bobo_resources_template  % (
                os.path.join(here, 'test-examples'),
                here,
                os.path.join(home, 'parts', 'dojo'),
                ))
            server = wsgiref.simple_server.make_server('', 0, app)
            self.port = server.server_port
            thread = threading.Thread(target=server.serve_forever)
            thread.setDaemon(True)
            thread.start()
            self.bobo_running = True
        self.java = subprocess.Popen(
            ['java', '-jar',
             home+'/parts/selenium.jar/selenium-server-standalone-2.0b2.jar'])

    @classmethod
    def tearDown(self):
        os.kill(self.java.pid, signal.SIGTERM)

def test_suite():

    selenium_suite = manuel.testing.TestSuite(
            manuel.doctest.Manuel(parser=zc.customdoctests.js.parser) +
            manuel.doctest.Manuel(parser=zc.customdoctests.js.eq_parser) +
            manuel.doctest.Manuel() +
            manuel.capture.Manuel(),
            'build_form2.test',
            setUp=setUp)
    selenium_suite.layer = SeleniumLayer
    return selenium_suite

if __name__ == '__main__':
    unittest.main(defaultTest='test_suite')

