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


        #check grid
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[1]/table/tbody/tr/td[1]/div',
            '123 fake street')
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[1]/table/tbody/tr/td[2]/div',
            'fakeville')
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[1]/table/tbody/tr/td[3]/div',
            '9')

        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[1]/div',
            '345 false street')
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[2]/div',
            'falsetown')
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[3]/div',
            '9001')
        s.click('ExampleForm.actions.register')
        s.waitForText("//div[contains(@class, 'dijitDialog')]"
                      "/div[@class='dijitDialogTitleBar']"
                      "/span[@class='dijitDialogTitle']",
                      'Submitting Form failed')
        s.verifyTextPresent('Value is too big')
        s.verifyTextPresent('Weight: Missing Input')

        s.click("//div[contains(@class, 'dijitDialog')]"
                "/div[@class='dijitDialogPaneContent']"
                "/div[2]/span[contains(@class, 'dijitButton')]")

        s.type('weight', '23.5')

        s.click('//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[1]/div')
        s.click('addresses.dojo.edit.btn')
        s.type('addresses.awesomeness', '2')
        s.click('addresses.dojo.save.btn')

        # check delete & immediate add
        s.click(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[1]/div')
        s.click('addresses.dojo.delete.btn')

        # add a new record
        s.click('addresses.dojo.new.btn')
        s.type('addresses.street', 'The thirteenth Floor')
        s.type('addresses.city', 'Somewhere')
        s.type('addresses.awesomeness', '1')
        s.click('addresses.dojo.save.btn')

        s.click('ExampleForm.actions.register')

        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[1]/div',
            'The thirteenth Floor')
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[2]/div',
            'Somewhere')
        s.verifyText(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[2]/table/tbody/tr/td[3]/div',
            '1')

        # check the deleted item doesn't exist
        s.verifyTextNotPresent('345 false street')
        s.verifyTextNotPresent('falsetown')

        # now try a delete & save
        s.click(
            '//div[@id=\'dojox_grid__View_1\']/div/div/div/div[1]/table/tbody/tr/td[1]/div')
        s.click('addresses.dojo.delete.btn')
        s.click('ExampleForm.actions.register')

        s.verifyTextNotPresent('123 fake street')
        s.verifyTextNotPresent('fakeville')

        # Verify that multiple actions work
        s.type('weight', 'abcdefg')
        s.click('ExampleForm.actions.validate')
        s.waitForText("//div[contains(@class, 'dijitDialog')]"
                      "/div[@class='dijitDialogTitleBar']"
                      "/.[@title='Submitting Form failed']"
                      "/span[@class='dijitDialogTitle']",
                      'Submitting Form failed')
        s.verifyTextPresent('Weight: Missing Input')
        s.click("//div[contains(@class, 'dijitDialog')]"
                "/div[@class='dijitDialogPaneContent']"
                "/div[2]/span[contains(@class, 'dijitButton')]")
        s.type('weight', '3')
        s.click('ExampleForm.actions.validate')
        s.waitForText("//div[contains(@class, 'dijitDialog')]"
                      "/div[@class='dijitDialogTitleBar']"
                      "/.[@title='Success!']"
                      "/span[@class='dijitDialogTitle']",
                      'Success!')
        s.verifyTextPresent('Form validated')
        s.click("//div[contains(@class, 'dijitDialog')]"
                "/div[@class='dijitDialogPaneContent']"
                "/div[2]/span[contains(@class, 'dijitButton')]")
