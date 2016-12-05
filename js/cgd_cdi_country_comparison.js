(function ($) {
  Drupal.behaviors.cgd_cdi_compare = {
    attach: function (context, settings) {
      window.cgdCdi = new cdiApp({
        el: '#new_cdi',
        url: '/sites/all/modules/custom/cgd_cdi/ParserTest.php',
        args: {
          countryCodes: countryCodes,
          comparison: true
        },
        onLoad: 'loadCountry'
      });

      $('.social a').click(function(e) {
        e.preventDefault();
        openWindow(this, $(this).data('target'));
      });

      function openWindow(element, type){
        var url = element.href;
        var pageUrl = window.parent.location.href;
        if(type && type == "fb")
            url += "?u=" + pageUrl;
        else if(type == "tw")
            url += "&url=" + pageUrl;
            
        window.open(url, '_blank', 'height=570,width=520,scrollbars=yes,status=yes');
        return false;
      }

    }
  };
})(jQuery);
