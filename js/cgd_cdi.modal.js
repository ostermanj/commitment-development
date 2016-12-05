/**
 * Modal expanded Model and View.
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