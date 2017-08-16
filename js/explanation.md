# How this all works

The main CDI page is initialized on line 4 of cdi2016_modal.combined.js, wich construct a `new cdiApp` defined in cdi2016_app.combined.unmin.js line 243.

That fetches the data from the XML parser, which is passed in as options.url 