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

name = 'zc.extjs'
version = '0.1'

import os
from setuptools import setup, find_packages


entry_points = """
"""

def read(rname):
    return open(os.path.join(os.path.dirname(__file__), *rname.split('/')
                             )).read()

long_description = (
        read('src/%s/README.txt' % ('/'.join(name.split('.'))))
        + '\n' +
        'Download\n'
        '--------\n'
        )

open('doc.txt', 'w').write(long_description)

setup(
    name = name,
    version = version,
    author = 'Jim Fulton',
    author_email = 'jim@zope.com',
    description = '',
    long_description=long_description,
    license = 'ZPL 2.1',
    
    packages = find_packages('src'),
    namespace_packages = ['zc'],
    package_dir = {'': 'src'},
    install_requires = [
        'setuptools',
        'simplejson',
        'zc.extjsresource',
        'zope.deferredimport',
        ],
    extras_require = dict(
        test=['zope.app.zcmlfiles',
              'zope.testbrowser']),
    zip_safe = False,
    entry_points=entry_points,
    )
