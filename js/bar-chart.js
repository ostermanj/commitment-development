var BarChartModel = Backbone.Model.extend({
    initialize: function(attributes) {
	this.level = attributes.level;
        this.data = attributes.data;
	this.data_labels = attributes.data_labels;
        this.indicators = attributes.indicators;
	this.weighted = attributes.weighted;
	this.max = attributes.max;
	this.min = attributes.min;
	this.min_label = attributes.min_label;
	this.max_label = attributes.max_label;
	this.total_weighted = attributes.total_weighted;
    }
});

var BarChartView = Backbone.View.extend({
    initialize: function(options) {
        this.includeValueOnChart = options.includeValueOnChart;
     
      
        this.render();
    },
    
    render: function() {
   
        var data = this.model.data;
        var that = this;

        data.forEach(function(value, index){
            var barCharItemModel = new BarChartItemModel({
                data: value,
		data_label: that.model.data_labels[index],
                holder: that.$el,
		level: that.model.level,
                numElements: data.length,
                trend: that.model.indicators[index],
		weighted: that.model.weighted[index],
		min: that.model.min,
		max: that.model.max,
		min_label : that.model.min_label,
		max_label : that.model.max_label,
		total_weighted: that.model.total_weighted
            });
            var barCharItem = new BarChartItemView({
                model: barCharItemModel,
                className: that.model.indicators[index] + '-bg',
                includeValue: that.includeValueOnChart
            });
            that.$el.append(barCharItem.$el);
        });

  	if(this.model.level!=1 && this.model.level!=2){ 	
	   // MIN and MAX indicators
	   this.$el.append('<div class="indicator min">' + this.model.min_label + '</div>');
	   if(this.model.min<0 && this.model.max!=0){
	      var range_space = this.model.max-this.model.min;
	      var negative_number_space = Math.abs(this.model.min)/range_space;
	      var zero_position = negative_number_space*100;

	      this.$el.append('<div class="indicator zero" style="left:'+zero_position+'%">0</div>');
	   }

	   this.$el.append('<div class="indicator max">' + this.model.max_label + '</div>');
	}
    }
});


/**
 * Bar Chart items.
 */
var BarChartItemModel = Backbone.Model.extend({
    initialize: function(attributes) {
        this.data = attributes.data;
	this.data_label = attributes.data_label;
        this.holderWidth = attributes.holder.width();
        this.numElements = attributes.numElements;
        this.trend = attributes.trend;
	this.weighted = attributes.weighted;
	this.min = attributes.min;
	this.max = attributes.max;
	this.min_label = attributes.min_label;
	this.max_label = attributes.max_label;
	this.total_weighted = attributes.total_weighted;
    }
});

var BarChartItemView = Backbone.View.extend({
    initialize: function(options) {
        this.includeValue = options.includeValue;
        this.render();
    },
    render: function() {
        var data = this.model.data;
       
       
        var left = 0;
	if(this.model.numElements==1){ // if single indicator chart
	  var range_space = this.model.max-this.model.min;
	  if(this.model.min > 0){
	 	var range_value = data-this.model.min;
	  } else {
		var range_value = Math.abs(data);
	  }

	  var percent_value = range_value/range_space;
	  var width = percent_value * 100;
	
	  
	  if(this.model.min<0){
	
	  	var range_space = this.model.max-this.model.min;
	    var negative_number_space = Math.abs(this.model.min)/range_space;
        var zero_position = negative_number_space*100;//this.model.holderWidth;
        
		left = 0;
		
		if(data<0){
		    
			width = zero_position - width;
		} 
		else {
		   width += zero_position;
		}
		
		
	  }

	} else { // if main 7-indicator chart

	 var availableSpace = this.model.max;
	  
     var percent_width = this.model.weighted / availableSpace;	
   
     var width = percent_width * 100;//this.model.holderWidth;
    }

	this.$el.css({
            width: width + '%',
	    left: left+'%'
        });
        this.$el.data('value', data);
	this.$el.attr('data-weighted', this.model.weighted);

        // If we display the value on the bar we don't need the tooltip.
        if (this.includeValue) {
            this.$el.append('<div class="value">' + this.model.data_label + '</div>');
        } else {
            var tooltipModel = new BarChartTooltipModel({
                trend: cgdCdi.indicators[this.model.trend],
                value: this.model.data_label
            });
            var tooltip = new BarChartTooltipView({
                model: tooltipModel,
                className: 'tooltip'
            });
            this.$el.append(tooltip.$el);
        }
    }
});

/**
 * Tooltip.
 */
var BarChartTooltipModel = Backbone.Model.extend({
    initialize: function(attributes) {
        this.trend = attributes.trend,
        this.value = attributes.value
    }
});

var BarChartTooltipView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.append('<span class="trend">' + this.model.trend + '</span><br/>');
        this.$el.append('<span class="value">' + parseFloat(this.model.value).toFixed(1) + '</span>');
    }
});
