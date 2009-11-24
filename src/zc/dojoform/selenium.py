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
        s.waitForValue('first_name', "Happy") 
        s.verifyValue('last_name', 'Camper') 
        s.verifyValue('age', '23')
        # XXX Iframe selection not implemented yet apparently
        #s.selectFrame('other_iframe')
        #s.verifyTextPresent("I've got a magic toenail")
        #s.selectFrame('description_iframe')
        #s.verifyTextPresent("10ft tall Razor sharp scales.")

        # test the pet combobox:
        s.verifyValue('pet', '')
        # 1) the combobox has a pulldown menu
        s.click(
            '//div[@id=\'widget_pet\']/div'
            '/div[contains(@class, \'dijitDownArrowButton\')][1]')
        # 2) the combobox has text input
        s.type('pet', 'Cockatiel')
        s.verifyValue('pet', 'Cockatiel')

        s.verifyValue('favorite_color', "Blue")
        s.assertChecked('happy')
        s.verifyValue('temperment', 'Right Neighborly')
        s.verifyValue('siblings', '1')
        s.assertNotChecked('addresses.0')
        s.assertNotChecked('addresses.1')
        s.assertNotChecked('addresses.new')
        s.verifyValue('street.0', "123 fake street")
        s.verifyValue('city.0', "fakeville")
        s.verifyValue('awesomeness.0', "9")
        s.verifyValue('street.1', "345 false street")
        s.verifyValue('city.1', "falsetown")
        s.verifyValue('awesomeness.1', "9001")
        s.click('ExampleForm.actions.register')
        s.verifyTextPresent('Submitting Form failed')
        s.verifyTextPresent('Value is too big')
        s.verifyTextPresent('Weight: Missing Input')
        s.click("//div[@id='dijit_Dialog_0']/div[1]/span[2]")
        s.type('weight', '23.5')
        s.type('awesomeness.1', '2')
        s.click('ExampleForm.actions.register')
        
