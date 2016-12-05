cdiApp.LineChart = {};
cdiApp.LineChart.Model = Backbone.Model.extend({
    initialize: function(args) {
	var item = cgdCdi.indicatorColors[args.indicator];
	var border_color = item.border;
	var background_color = item.background;
	var scaleLineColor = "rgba(0,0,0,.1)";
	var scaleFontColor = "#666";
/*	if(border_color=="#FFFFFF"){
		scaleLineColor = "rgba(255,255,255,.1)";
		scaleFontColor = "#ffffff";
	}*/

        this.data = {
            labels: [],
            datasets: [{
                data: [],
                fillColor: 'rgba(0,0,0,0)',
                pointStrokeCol: border_color,
                strokeColor: border_color,
                pointColor: border_color,
            }]
        };
        var that = this;
        args.data.forEach(function(value) {
            that.data.labels.push(value.year);
            that.data.datasets[0].data.push(parseFloat(value.data).toFixed(2));
        });
        this.options = {
            
            
           scaleOverride: true,
           
            scaleSteps: 6,
            scaleStepWidth: 2,
            scaleStartValue: 0,         
            scaleShowGridLines: false,
            tooltipTemplate: "<%= value %>",
            tooltipFillColor: background_color,
            tooltipFontColor: '#706E69',
            tooltipXPadding: 10,
	    scaleLineColor: scaleLineColor,
                scaleFontColor: scaleFontColor,
            pointDotRadius: 2,
	    percentageInnerCutout : 70,
            pointHitDetectionRadius: 4
        };
    } 
});

cdiApp.LineChart.View = Backbone.View.extend({
    initialize: function() {
        this.data = this.model.data;
        this.options = this.model.options;
        this.render();
    },
    render: function() {
        var chartHolder = this.el.getContext('2d');
        var myLineChart = new Chart(chartHolder).Line(this.data, this.options);
    }
});
