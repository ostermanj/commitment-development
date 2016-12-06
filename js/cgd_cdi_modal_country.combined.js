(function ($) {
  Drupal.behaviors.cgd_cdi = {
    attach: function (context, settings) {
      window.cgdCdi = new cdiApp({
        el: '#new_cdi',
        url: '/sites/all/modules/custom/cgd_cdi/ParserTest.php',
        onLoad: 'startApp'
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

/**
 * Modal expanded Model and View. was cgd_cdi.modal.js
 */
cdiApp.Modal = {};
cdiApp.Modal.Model = Backbone.Model.extend({
    initialize: function(args) {
        this.app = args.app;
        this.indicatorName = args.indicatorName;
        this.indicatorDescription = args.indicatorDescription;
    }
});
cdiApp.Modal.View = Backbone.View.extend({
    modalTemplate: null,
    initialize: function() {
        this.modalTemplate = _.template(this.model.app.getTemplate('modal'));
        this.render();
    },
    render: function() {
        var template = this.modalTemplate({
            indicatorName: this.model.indicatorName,
            indicatorDescription: this.model.indicatorDescription
        });
        $('body').append(this.$el);
        this.$el.html(template);
        this.centerModal();
        this.$el.fadeIn(200);
    },
    events: {
        'click a.cdi-modal-button': 'closeModal'
    },
    closeModal: function(e) {
        var that = this;
        this.$el.fadeOut(200, function() {
            that.$el.remove();
        });
        e.preventDefault();
    },
    centerModal: function() {
        var scrollTop = $(window).scrollTop();
        var windowWidth = $(window).width();
        var top = scrollTop + 70;
        var left = windowWidth / 2 - this.$el.width() / 2;
        this.$el.css({
            top: top,
            left: left
        });
    }
});

/*
 *
 * was cgd_cdi_country.js
 */

(function ($) {
  Drupal.behaviors.cgd_cdi_country = {
    attach: function (context, settings) {
      window.cgdCdi = new cdiApp({
        el: '#new_cdi',
        url: '/sites/all/modules/custom/cgd_cdi/ParserTest.php',
        onLoad: 'loadCountry',
        args: {countryCodes: countryCodes}
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
