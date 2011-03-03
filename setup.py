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

name = 'zc.dojoform'
version = '0'

import os
from setuptools import setup, find_packages


entry_points = """
"""

def read(rname):
    return open(rname).read()

here = os.getcwd()
os.chdir(os.path.join(os.path.dirname(__file__), 'src', *name.split('.')))

os.chdir(here)

setup(
    name = name,
    version = version,
    author = 'Jim Fulton',
    author_email = 'jim@zope.com',
    description = '',
    license = 'ZPL 2.1',
    packages = find_packages('src'),
    namespace_packages = ['zc'],
    package_dir = {'': 'src'},
    include_package_data = True,
    install_requires = [
        'setuptools',
        'zc.ajaxform',
        'zc.resourcelibrary',
        'zope.html >=2.0',
        'zope.schema',
        ],
    extras_require = dict(
        test=[
            'manuel',
            'zc.selenium',
            'zope.app.server',
            'zope.component',
            'zope.formlib',
            'zope.security',
            'zc.customdoctests',
            'python-spidermonkey',
            ]
        ),
    zip_safe = False,
    entry_points=entry_points,
    )
