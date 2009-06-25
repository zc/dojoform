##############################################################################
#
# Copyright (c) Zope Corporation. All Rights Reserved.
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

import zc.selenium.pytest
class SeleniumTests(zc.selenium.pytest.Test):

    def testCalculator(self):
        s = self.selenium
        s.open('/calculator.html?login')
        s.waitForText('value', '0')
        s.type('input', '2')
        s.click('dijit_form_Button_0')
        s.waitForText('value', '2')
        s.click('dijit_form_Button_0')
        s.waitForText('value', '4')
        s.type('input', '3')
        s.click('dijit_form_Button_1')
        s.waitForText('value', '1')
      
    def testForm(self):
        s = self.selenium
        s.open('/form.html?login')
        s.waitForValue('ExampleForm.first_name', "Happy") 
        s.verifyValue('ExampleForm.last_name', 'Camper') 
        s.verifyValue('ExampleForm.age', '23') 
        s.verifyValue('ExampleForm.other', "I've got a magic toenail")
        s.verifyValue('ExampleForm.favorite_color', "Blue")
        s.assertChecked('ExampleForm.happy')
        s.verifyValue('ExampleForm.temperment', 'Right Neighborly')
        s.verifyValue('ExampleForm.siblings', '1')
        s.assertNotChecked('ExampleForm.addresses.0')
        s.assertNotChecked('ExampleForm.addresses.1')
        s.assertNotChecked('ExampleForm.addresses.new')
        s.verifyValue('ExampleForm.addresses.street.0', "123 fake street")
        s.verifyValue('ExampleForm.addresses.city.0', "fakeville")
        s.verifyValue('ExampleForm.addresses.awesomeness.0', "9")
        s.verifyValue('ExampleForm.addresses.street.1', "345 false street")
        s.verifyValue('ExampleForm.addresses.city.1', "falsetown")
        s.verifyValue('ExampleForm.addresses.awesomeness.1', "9001")
        s.click('ExampleForm.actions.register')
        s.verifyTextPresent('Submitting Form failed')
        s.verifyTextPresent('Value is too big')
        s.verifyTextPresent('Weight: Missing Input')
        s.click("//div[@id='dijit_Dialog_0']/div[1]/span[2]")
        s.type('ExampleForm.weight', '23.5')
        s.type('ExampleForm.addresses.awesomeness.1', '2')
        s.click('ExampleForm.actions.register')
        
