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
import doctest
import manuel.capture
import manuel.doctest
import manuel.testing
import os
import textwrap
import unittest
import zc.customdoctests.js

from zope.testing import doctest

home = None # set by buildout
here = os.path.dirname(__file__)

def jsiter(jsob):
    for i in range(jsob.length):
        yield jsob[i]

def _pretty_print_dom(node, indent, out):
    out.append(indent+'<'+node.tagName)
    attrs = [("%s=%s" % (attr.name, repr(attr.value)[1:]))
             for attr in jsiter(node.attributes)]
    childNodes = [childNode for childNode in jsiter(node.childNodes)
                  if childNode.tagName or childNode.textContent.strip()]
    if not childNodes:
        attrs.append('/')

    indent += '    '

    if ((len(' '.join(attrs)) + len(out[-1])) > 74):
        out.append('\n')
        if childNodes:
            attrs.append('>')
        else:
            attrs[-1] += '>'
        for attr in attrs:
            out.append(indent+attr+'\n')
    else:
        out.append(' '+' '.join(attrs)+'>\n')

    indent = indent[:-2]

    if childNodes:
        for childNode in childNodes:
            if childNode.tagName:
                _pretty_print_dom(childNode, indent, out)
            else:
                out.append(
                    indent+(indent+'\n').join(
                        textwrap.dedent(
                            childNode.textContent
                            ).rstrip().split('\n')
                        )+'\n'
                    )
        out.append(indent[:-2] + '</%s>\n' % node.tagName)

    return out

def check_element(expected, observed):
    if expected.tagName != observed.tagName:
        raise AssertionError(
            "tag names don't match", expected.xml, observed.xml)
    wild = False
    for i in range(expected.attributes.length):
        name = expected.attributes[i].name
        e_val = expected.attributes[i].value

        if name == 'xxx':
            wild = True
            continue

        o_val = observed.getAttribute(name)
        if o_val is None:
            raise AssertionError("missing "+name, expected.xml, observed.xml)
        if e_val != o_val:
            if name == 'class':
                oclasses = set(o_val.strip().split())
                for cname in e_val.strip().split():
                    if cname not in oclasses:
                        raise AssertionError("missing class: "+cname,
                                             expected.xml, observed.xml)
            else:
                raise AssertionError(
                    "attribute %s has different values" % name, e_val, o_val,
                    expected.xml, observed.xml)

    ec = listify_nodes(expected.childNodes)
    if wild:
        match_text = ''
        for n in ec:
            if n.tagName:
                for e in listify_nodes(
                    observed.getElementsByTagName(n.tagName)):
                    try:
                        check_element(n, e);
                    except AssertionError:
                        pass
                    else:
                        break
                else:
                    raise AssertionError("Couldn't find match for", n.xml)
            else:
                match_text += ' ' + n.textContent
        match_text = match_text.strip()
        if match_text:
            text = observed.textContent
            match_text = match_text.split()
            while match_text:
                token = match_text.pop(0)
                i = text.index(token)
                if i < 0:
                    raise AssertionError(token + " not found in text content.",
                                         expected.xml, observed.xml)
                text = text[i+len(token):]
    else:
        oc = listify_nodes(observed.childNodes)
        if len(oc) != len(ec):
            raise AssertionError(
                "No match for", len(ec), len(oc), expected, observed)
        for e, o in zip(ec, oc):
            if (e.tagName or o.tagName):
                check_element(e, o)
            else:
                e = e.textContent.strip()
                o = o.textContent.strip()
                if e != o:
                    raise AssertionError('text nodes differ', e, o,
                                         expected.xml, observed.xml)




def listify_nodes(nodes):
    return [nodes[i] for i in range(nodes.length)
            if nodes[i].tagName or nodes[i].textContent.strip()]

def pretty_print_dom(node):
    print ''.join(_pretty_print_dom(node, '', [])),

def run_example(js, name):
    js('load(%r)' % os.path.join(here, 'test-examples', name+'.js'))
    js("""
    form = zc.dojo.build_form2(definition);
    dojo.body().appendChild(form.domNode);
    form.startup();
    """)

    dname = os.path.join(here, 'test-examples', name+'.html')
    if not os.path.exists(dname):
        print 'No expected output for', name, 'got:'
        pretty_print_dom(js.form.domNode)
    else:
        js.expected_text = open(dname).read()
        js("""
            expected = document.createElement('div');
            expected.innerHTML = expected_text;
            expected = expected.childNodes[0];
            """)

        check_element(js.expected, js.form.domNode)

    js("""
    dojo.body().removeChild(form.domNode);
    form.destroyRecursive();
    nwidgets = dijit.registry.length;
    form = zc.dojo.build_form2(definition);
    dojo.body().appendChild(form.domNode);
    form.startup();
    """)

    if os.path.exists(dname):
        check_element(js.expected, js.form.domNode)

    js("""
    dojo.body().removeChild(form.domNode);
    form.destroyRecursive();
    """)
    if js.nwidgets != js.dijit.registry.length:
        raise AssertionError('Widget leak', nwidgets, js.dijit.registry.length)

def setUp(test):
    js = zc.customdoctests.js.setUp(test)
    js.load(home+'/parts/envjs/env.js')
    js('Envjs.log = print;')

    # Work around bug in Envjs 1.2 XXX really need to try 1.3 again
    js('Envjs.sync = function(fn){return fn;};');

    js('repr = JSON.stringify;')
    #js.console.error = js.console.log;
    js("djConfig = {baseUrl: 'file://%s/parts/dojo/dojo/'};" % home)
    js.djConfig.modulePaths = {
        'zc.dojo': 'file://'+home+'/src/zc/dojoform/resources/zc.dojo',
        'zc.RangeWidget':
        'file://'+home+'/src/zc/dojoform/resources/rangewidget',
        }
    js.load(home+'/src/zc/dojoform/dojo_in_spidermonkey_helper.js')
    js.Envjs.parseHtmlDocument(
        '<!doctype html>\n<html><body></body></html>\n',
        js.document)
    js.load(js.djConfig.baseUrl+'dojo.js')

    # XXX dojo hostenv_ff_ext.js should define this:
    js.dojo.addOnUnload = lambda *a: None

    js.load(home+'/src/zc/dojoform/resources/zc.dojo.js')

    js.pretty_print_dom = pretty_print_dom

    js.read_file = lambda path: open(path).read()

    js.test_examples = os.path.join(here, 'test-examples')

    js.check_element = check_element
    test.globs['js'] = test.globs['JS_']

def test_suite():
    return unittest.TestSuite((
        manuel.testing.TestSuite(
            manuel.doctest.Manuel(parser=zc.customdoctests.js.parser) +
            manuel.doctest.Manuel(parser=zc.customdoctests.js.eq_parser) +
            manuel.doctest.Manuel() +
            manuel.capture.Manuel(),
            'build_form2.test',
            setUp=setUp),
        ))

if __name__ == '__main__':
    unittest.main(defaultTest='test_suite')

