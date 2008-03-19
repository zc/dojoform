import zc.extjs.application
import zc.extjs.form
import zope.formlib
import zope.interface
import zope.schema

class IPerson(zope.interface.Interface):

    first_name = zope.schema.TextLine(
        title = u"First name",
        description = u"Given name.",
        )

    last_name = zope.schema.TextLine(
        title = u"Last name",
        description = u"Family name.",
        )

    favorite_color = zope.schema.TextLine(
        title = u"Favorite color",
        required = False,
        )

    age = zope.schema.Int(
        title = u"Age",
        description = u"Age in years",
        min = 0,
        )

class FormExample(zc.extjs.application.Application):

    class Form(zc.extjs.form.Form):
        
        form_fields = zope.formlib.form.Fields(IPerson)

        @zope.formlib.form.action("Register")
        def register(self, action, data):
            return dict(
                data = data,
                form_name = self.__class__.__name__,
                page_name = self.page.__class__.__name__,
                context_name = self.context.__class__.__name__,
                )
