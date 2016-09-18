/**
 * Components expanded Model and View.
 */
cdiApp.Components = {};
cdiApp.Components.Model = Backbone.Model.extend({
    initialize: function(args) {
        this.app = args.app;
        this.countryCode = args.countryCode;
        this.data = this.app.getIndicatorsLabels(args.indicators);
    }
});
cdiApp.Components.View = cdiApp.collapsibleView.extend({
    initialize: function() {
        this.countryCode = this.model.countryCode;
        this.indicator = this.model.indicator;
        this.data = this.model.data;
        this.app = this.model.app;
    },
    render: function() {
        if (!this.loaded) {
            this.loaded = true;
            var $contentTd = $('<td colspan="4"></td>');
            var $contentWrapper = $('<div class="components-wrapper"></div>');
            var $content = $('<div class="components-inner-wrapper"></div>');
            $contentWrapper.append($content);
            $contentTd.append($contentWrapper);
            this.$el.append($contentTd);
          
          
            for(var i in this.data) {
                var $label, $chart;
                var indicators = [];
		var parent = this.app.flatIndicators[i];

                if (this.app.flatIndicators[i].children) {
                    $label = $('<div class="indicator-label category ' + this.app.flatIndicators[i].parent + '">' + this.data[i] + '</div>');
                    $content.append($label);
                    for (var j in this.app.flatIndicators[i].children) {
                        $label = $('<div class="indicator-label"><a href="#info" class="indicator-info" data-indicator="' + this.app.flatIndicators[i].children[j] + '">i</a>' + this.app.flatIndicators[this.app.flatIndicators[i].children[j]].label + '</div>');
                        $chart = $('<div class="chart-holder"></div>');
                        $content.append($label);
                        $content.append($chart);
                        indicators = [this.app.flatIndicators[i].children[j]];
			parent = this.app.flatIndicators[this.app.flatIndicators[i].children[j]];

			this.app.createBarChart(2015, this.countryCode, indicators, $chart, true, parent.min, parent.max, parent.user_friendly_min, parent.user_friendly_max, 4);
                    }
                } else {
                    var $label = $('<div class="indicator-label"><a href="#info" class="indicator-info" data-indicator="' + i + '">i</a>' + this.data[i] + '</div>');
                    var $chart = $('<div class="chart-holder"></div>');
                    indicators = [i];
                    $content.append($label);
                    $content.append($chart);
                    this.app.createBarChart(2015, this.countryCode, indicators, $chart, true, parent.min, parent.max, parent.user_friendly_min, parent.user_friendly_max, 3);
                }
            }
        }
        var cHeight = $('.components-inner-wrapper').height() + 40;
        $('.components-wrapper').height(cHeight);
    },
    events: {
        'click a.indicator-info': 'showIndicatorInfo'
    },
    showIndicatorInfo: function(event) {
        $target = $(event.target);
        var indicatorCode = $target.data('indicator');
        console.log('Indicator: ' + indicatorCode + ': ' + this.app.flatIndicators[indicatorCode].description);
        var modalModel = new cdiApp.Modal.Model({
            app: this.app,
            indicatorName: this.app.flatIndicators[indicatorCode].label,
            indicatorDescription: this.app.flatIndicators[indicatorCode].description
        });
        var modalView = new cdiApp.Modal.View({
            model: modalModel,
            className: 'cdi-modal',
            tagName: 'div'
        });

        event.preventDefault();
    },
});
