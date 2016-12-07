Backbone.pubSub = _.extend({}, Backbone.Events); //creates a global mechanism to subscribe views to events published in others
var originalRanks = {};

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
            window.setTimeout(function(){
                barCharItem.$el.removeClass('initial-load');
            }, 200);
        });

  	if(this.model.level!=1 && this.model.level!=2){ 	
	   // MIN and MAX indicators
	   this.$el.append('<div class="indicator min"><span>' + this.model.min_label + '</span></div>');
	   if(this.model.min<0 && this.model.max!=0){
	      var range_space = this.model.max-this.model.min;
	      var negative_number_space = Math.abs(this.model.min)/range_space;
	      var zero_position = negative_number_space*100;

	      this.$el.append('<div class="indicator zero" style="left:'+zero_position+'%">0</div>');
	   }

	   this.$el.append('<div class="indicator max"><span>' + this.model.max_label + '</span></div>');
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
        this.$el.addClass('initial-load transition bar-segment');

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

/**
 * The main APP for the new CDI section. was cdi_app.js
 */

/* NEW CODE
invSTD is one-over-standard-deviation for the range of scores in the component. original overall country scores ( flatIndicators.CDI.original.values[country] ) were calculated as the sum of the products of raw component scores
( flatIndicator[indicator].original.values[country] ) and userWeights[indicator].invSTD divided by the sum of all invSTDs.
this calculation has to be reproduced to allow users to adjust weights and return valid results. 
 */
/*(function($){
    if (Modernizr.testAllProps('display','flexbox') === true){
        $('html').addClass('flexbox');

    }
});   */

 var userWeights = {
       CDI_AID: {
          value: 1,
          unlocked: true,
          invSTD: 1.205188013          
       },
       CDI_INV: {
          value: 1,
          unlocked: true,
          invSTD: 1.95125084
       },
       CDI_TEC: {
          value: 1,
          unlocked: true,
          invSTD: 0.913599031
       },
       CDI_ENV: {
          value: 1,
          unlocked: true,
          invSTD: 1.023006239
       },
       CDI_TRA: {
          value: 1,
          unlocked: true,
          invSTD: 1.356537167
       },
       CDI_SEC: {
          value: 1,
          unlocked: true,
          invSTD: 0.803143505
       },
       CDI_MIG: {
          value: 1,
          unlocked: true,
          invSTD: 0.757060201
       }
   };
   
/* end new code - jo */

var cdiApp = Backbone.View.extend({

    /**
     * The main indicators order.
     *
     * @var {array}
     */
    indicatorsOrder: [
        'CDI_AID',
        'CDI_INV',
        'CDI_TEC',
        'CDI_ENV',
        'CDI_TRA',
        'CDI_SEC',
        'CDI_MIG'
    ],

    /**
     * The main indicators background and border colors.
     *
     * @var {object}
     */
    indicatorColors: {
    CDI: {
        background: '#d4c7b5',
        border: '#574D40'
    },
        CDI_TEC: {
            background: '#F5EACF',
            border: '#ECBA42'
        },
        CDI_INV: {
            background: '#FFE8DA',
            border: '#C85A18'
        },
        CDI_AID: {
            background: '#FBE2E7',
            border: '#9E1421'
        },
        CDI_ENV: {
            background: '#E6FCF0',
            border: '#41B976'
        },
        CDI_TRA: {
            background: '#E9EDFF',
            border: '#21358B'
        },
        CDI_SEC: {
            background: '#DCF5FF',
            border: '#1792C5'
        },
        CDI_MIG: {
            background: '#F6E8FF',
            border: '#8850AC'
        }
    },

    /**
     * Initializes the view.
     * @param {object} options
     *    Specific options for this view.
     *    - url: the url of the data file to download.
     */
    initialize: function(options) {
        Backbone.pubSub.on('userInput', this.userInput, this); //subscribe this view to 'selectorStopped' event published in cdiApp.mainNav.view (home.cdi.js)
        Backbone.pubSub.on('adjustCDI', function(params){this.adjustCDI(params);}, this);

        var that = this;
        $('#html5_wrapper').css('display','block');

        // Get the data file.

        $.get(options.url).done(function(data){
            that.data = data;
            console.log(data);
            var countryCodes = that.getCountryCodes();
            that.getCountryNames(countryCodes);
            that.getMainIndicators();
            that.flattenData();

            if (options.onLoad && typeof that[options.onLoad] === 'function') {
                that[options.onLoad](options.args);
            }
        });
        
    },
    userInput: function(args){
        if (args === 'resetWeight'){

            for (var ind in userWeights){ 
              userWeights[ind].value = 1;
            }

            var isWeighted = 0;
            for (var ind in userWeights){    
              userWeights[ind].totalWeight = userWeights[ind].value * userWeights[ind].invSTD; // creates a total weight obj for each
              
            }
            var that = this;
      //      window.setTimeout(function(){

                that.changeWeight(0,1,'click');
    //        }, 400);
            return;
        }
        eventType = args.type;
        transition = args.data.transition;

        if (eventType !== 'keyup'){
            whichInd = this.indicatorsOrder[args.data.i];            
        } else {
            whichInd = args.data.i;            
        }
        userWeights[whichInd].value = args.data.notch >= 0 ? 1 + (this.changeFactor - 1) * args.data.notch : 1 / (1 + (this.changeFactor - 1) * Math.abs(args.data.notch));
        var isWeighted = 0;
        for (var ind in userWeights){    
          userWeights[ind].totalWeight = userWeights[ind].value * userWeights[ind].invSTD; // creates a total weight obj for each
          isWeighted += userWeights[ind].value === 1 ? 0 : 1
        }
  
       
    
        this.changeWeight(isWeighted, transition, eventType);
        
        
    },

    /**
     * Create an object with all the indicators in the first level, removing
     * the hierarchy from the data object.
     */
    flattenData: function() {

        var that = this;
        this.flatIndicators = {};

        flattenIndicators(this.data.indicators);
        function flattenIndicators(indicators) {

            for (var i in indicators) {
                that.flatIndicators[i] = JSON.parse(JSON.stringify(indicators[i]));

                if (indicators[i].children) {
                    flattenIndicators(indicators[i].children);
                    if (i === 'CDI') {
                        that.flatIndicators[i].children = that.indicatorsOrder;

                    }
                    else {
                        that.flatIndicators[i].children = Object.keys(that.flatIndicators[i].children);
                    }
                }
           
            }

        }
/*
new code : adds object 'original' to main indicators and copies data to it so that the values can be manipulated by user-initiated weighting without losing the original values
*/

        for (var ind in that.flatIndicators){
            if (ind.indexOf('CDI') != -1){

              that.flatIndicators[ind].original = $.extend(true,{},that.flatIndicators[ind]); //using jquery extend method to clone object without  setting up persistent equivalency (newObj = oldObj). later changes in one would be made in the other, which is exactly not the point
            }
        };
        that.flatIndicators.CDI.previous = that.flatIndicators.CDI.previous ? that.flatIndicators.CDI.previous : $.extend(true,{},that.flatIndicators.CDI);



/* end new */        

    },

    /**
     * Creates a Bar Chart for a specific country in a specific year, including
     * the provided indicators.
     *
     * @param {integer} year
     *   The year to get the data from.
     * @param {string} countryCode
     *   The country code to get the data.
     * @param {array} indicators
     *   An array of indicator codes to include in the chart.
     * @param {jquery object} $el
     *   The element where the chart should be included.
     * @param {boolean} includeValueOnChart
     *   Whether the indicator value should be displayed on the bar and hice the
     *   tooltip.
     */
    createBarChart: function(year, countryCode, indicators, $el, includeValueOnChart, min, max, min_label, max_label, level) {

        var data = [];
    var data_labels = [];
        var that = this;
    var weighted = [];
    var min_val = isNaN(min)?0:min;
    var max_val = isNaN(max)?0:max;
    var min_label = min_label;
    var max_label = max_label;
    var total_val = 0;
        indicators.forEach(function(indicator) {
            var value = that.flatIndicators[indicator].values ?  that.flatIndicators[indicator].values[countryCode] : 0;
            data.push(value);
        
        var value_data =  that.flatIndicators[indicator].user_friendly_values ?  that.flatIndicators[indicator].user_friendly_values[countryCode] : "0";
        data_labels.push(value_data);

        var weighted_value = that.flatIndicators[indicator].weighted ?  that.flatIndicators[indicator].weighted[countryCode] : 0;
        weighted.push(weighted_value);

        total_val+= weighted_value;
    
        });
    
        var model = new BarChartModel({
            data: data,
        data_labels : data_labels,
        weighted: weighted,
        level: level,
        min: min_val,
        max: max_val,
        min_label : min_label,
        max_label  : max_label,
        total_weighted: total_val,
            indicators: indicators
        });
        var view = new BarChartView({
            model: model,
            el: $el,
            includeValueOnChart: includeValueOnChart
        });
    },

    /**
     * Get all country codes.
     *
     * @return {array}
     *   The country codes included in the data file.
     */
    getCountryCodes: function() {
        var countryCodes = [];
        for (var i in this.data.indicators.CDI.values) {
            if (this.data.indicators.CDI.values.hasOwnProperty(i)) {
                countryCodes.push(i);
            }
        }
        return countryCodes;
    },

    /**
     * Gets the name of the provided countries.
     *
     * @param {array} countryCodes
     *   The countries to get the names.
     */
    getCountryNames:function(countryCodes) {
       
        this.countries = {
            AUS: "Australia",
            AUT: "Austria",
            BEL: "Belgium",
            CAN: "Canada",
            CHE: "Switzerland",
            CZE: "Czech Republic",
            DEU: "Germany",
            DNK: "Denmark",
            ESP: "Spain",
            FIN: "Finland",
            FRA: "France",
            GBR: "United Kingdom",
            GRC: "Greece",
            HUN: "Hungary",
            IRL: "Ireland",
            ITA: "Italy",
            JPN: "Japan",
            KOR: "South Korea",
            LUX: "Luxembourg",
            NLD: "Netherlands",
            NOR: "Norway",
            NZL: "New Zealand",
            POL: "Poland",
            PRT: "Portugal",
            SVK: "Slovakia",
            SWE: "Sweden",
            USA: "United States"
        };
    },

    sortScore: function (indicator, poperty, reverse, year) {
        var indicatorData = this.flatIndicators[indicator];
        return indicatorData;
    },

    /**
     * Returns the labels of the indicators for the Main Nav.
     */
    getMainIndicators: function() {
        this.indicators = {};
        var that = this;
        var indicators = this.data.indicators.CDI.children;
        
        for (var i in indicators) {
            if (indicators.hasOwnProperty(i)) {
                this.indicators[i] = indicators[i].label;
            }
        }
    },

    reload: function(indicator, country) {

        var viewName = indicator.toLowerCase() + 'View';
        if (indicator === 'CDI') { //this[viewName]) {

            this[viewName].show(indicator);
            $('.weight-toggle, .reset-weight').removeClass('weighted-override');
            $('.reset-weight, .weights-instruct').attr('aria-hidden', false);
            if (country != null) {
                $mainRow = $('tr#' + country + '-master');
                console.log($mainRow);
                console.log($mainRow.offset().top);
                $('html, body').animate({                 
                        scrollTop: $mainRow.offset().top - $('#main-menu').height() - $('#cdi-mainNav').height() - 20
                    }, 500); 
            }
        }
        else {

            this.loadIndicator(indicator, country);
        }
    },

    hideIndicator: function(indicator) {
        console.log(indicator);
        var indicator = indicator.toLowerCase();
        var viewName =  (indicator === 'cdi' ? 'cdi' : 'indicator') + 'View';

        if (this[viewName]) {
            this[viewName].hide();
        }
    },

    /**
     * Get the label of the given indicators.
     *
     * @param {array} indicators
     *   The indicator codes.
     * @return {object}
     *   An object with the code as key and the label as value.
     */
    getIndicatorsLabels: function(indicators) {
        var indicatorsLabels = {};
        var that = this;
        indicators.forEach(function(indicator) {
            indicatorsLabels[indicator] = that.flatIndicators[indicator].label;
        });
        return indicatorsLabels;
    },
    
    changeFactor: 2, 
   

    totalWeightsFn: function(){
      var totalWeights = 0;
      for (var ind in userWeights){
          totalWeights += userWeights[ind].totalWeight;
      }
      return totalWeights;
    },
    changeWeight: function(a,transition, et){ //a = isWeighted 1 or 0 ie at least one component's weight has been changed (!0)

    if (a === 0){
        $('.reset-weight').attr('aria-hidden', true);
      
        //window.setTimeout(function(){
                $('#cdi-mainNav').removeClass('weighted-component');
            $('.weights-component, .weights-instruct').attr('aria-hidden', false);
          //  },400);
    } else {
        $('.reset-weight').attr('aria-hidden', false);
        $('.weights-component, .weights-instruct').attr('aria-hidden', true);
    }
     sumTotalWeights = this.totalWeightsFn();


     
     for (var ind in this.flatIndicators){

        if (ind.indexOf('CDI_') != -1){

           for (var c in this.flatIndicators[ind].weighted){
          
              this.flatIndicators[ind].weighted[c] = this.flatIndicators[ind].original.values[c] * userWeights[ind].totalWeight / sumTotalWeights;  // changes value that informs width of bar segment according to new weighting
            
           }
        }
     }

    this.changeOverallScores(a, transition, et); 
    },
    changeOverallScores: function(a, transition, et){
        
        this.flatIndicators.CDI.previous.values = $.extend(true,{},this.flatIndicators.CDI.values);
       
        for (var c in this.flatIndicators.CDI.values){
            var sumProduct = 0;

            for (var ind in this.flatIndicators){
               if (ind.indexOf('CDI_') != -1){
                   product = this.flatIndicators[ind].values[c] * userWeights[ind].totalWeight;
                   sumProduct += product;
                   
                }
                
            }
            this.flatIndicators.CDI.values[c] = sumProduct / sumTotalWeights; 
        }




        Backbone.pubSub.trigger('rankCountries', [true, a, transition, et]);
    
      //  this.adjustCDI(a, transition);
    },
    unstackBars: function(){




        var barSpacing = 0.5; // spacing between bars expressed as percentage of chart-holder width
        var maxOfAll = function(maxes) {
            return Math.max.apply(null, maxes);
        }
        if (!this.maxes){
            this.maxes = [];
            for (var ind in this.flatIndicators){
                 if (ind.indexOf('CDI_') != -1){
                     this.maxes.push(this.flatIndicators[ind].original.max)
                 }
            }
            this.maxes.push(maxOfAll(this.maxes)); //push maximum follow of array to be last value of that array
        }
        
         for (var ind in this.flatIndicators){
             if (ind.indexOf('CDI_') != -1){
                
                for (var c in this.flatIndicators[ind].original.values){ //refactor code below. 1 helper function to handle unstackBars and adjustCDI
                    var segment = $('tr#' + c + '-master div.' + ind + '-bg');
                    segment.addClass('transition');
                    if (!segment[0].hasAttribute('data-unweighted')){ // if first time unstacking bars set new data atribute to hold the unweighted value
                        $(segment).attr('data-unweighted', this.flatIndicators[ind].original.values[c])
                    }
                    var originalWidth = $(segment).attr('style').replace(/width: ?(.[^;]+);.*/,'$1');
                    
                                                                       
                    $(segment).attr('data-stacked-width', originalWidth);
                    var barIndex = cgdCdi.indicatorsOrder.indexOf(ind); //get the index of the bar segment
                    var bWidth = $(segment).attr('data-unweighted') / this.maxes[this.maxes.length - 1] * ( 100 / 7 - barSpacing ) + '%';
                    $(segment).css({'left': barIndex * 100 / 7 + '%', 'position': 'absolute', 'width': bWidth});
                    var zeroMark = $('<div class="zero-mark">');
                    $(zeroMark).css('left', barIndex * 100 / 7 + '%');
                    $('#' + c + '-master .chart-holder').append(zeroMark);
                    $('#home-cdi').addClass('unstacked');
                    
                    
                    
                }
            }
         }

        $('.slider').addClass('hide-slider');
            window.setTimeout(function(){
                $('.slider, .reset-weight').css('display', 'none');
        }, 500);
    //    $('.weight-toggle, .reset-weight').addClass('weighted-override');
        $('.reset-weight').attr('aria-hidden', true);
    },
    restackBars: function(){

        $('.reset-weight').css('display', 'inline').attr('aria-hidden', false);
        $('.slider').css('display', 'block');
        
        $('.bar-segment').each(function(){
            $(this).css({'position': 'relative', 'left': '0%', 'width': $(this).attr('data-stacked-width')})
         });
        $('#home-cdi').removeClass('unstacked');
        setTimeout(function(){
            $('.slider').removeClass('hide-slider');
            $('.weight-toggle, .reset-weight').removeClass('weighted-override');
      },200);
    },
    adjustCDI: function(params){ //params = [0, 1, Object, Object, "click"]
         /*
         * ADJUST BARS
    */

        if (params[4] === 'resorted'){

            this.adjustScores(params);
            return;
        }
        this.isUserWeighted = params[0];

        for (var ind in this.flatIndicators){    
            
            if (ind.indexOf('CDI_') != -1){
          
                for (var c in this.flatIndicators[ind].weighted){
          
                    var segment = $('tr#' + c + '-master div.' + ind + '-bg');
                    if (transition === 1){
                        segment.addClass('transition');
                
                    } else {
                        segment.removeClass('transition');
                    }
                    segment.attr('data-weighted', this.flatIndicators[ind].weighted[c]);
                    newWidth = this.flatIndicators[ind].weighted[c] * 100  / 7;
                    segment.css('width', newWidth + '%')
                    
                }
            }
            
        }
        
     if (params[4] === 'mousemove' || params[4] === 'touchmove'){
         return;
     } else {

         this.adjustScores(params);
     }
        

    },
    
    adjustScores: function(params){
        /*
        * ADJUST RANKS AND SCORES
        */
    
        if (params[4] === 'resorted'){

        }
        a = params[0];
        transition = params[1];
        ranksObj = params[2];
        originalRanksObj = params[3];
        if (a !== 0){
            $('.original-rank').addClass('locked');
        } else {$('.original-rank').removeClass('locked');}
        
        $('tr.master-row').removeClass('processed');

        that = this;
        for (var c in that.flatIndicators.CDI.values){
           var newScore = $('tr#' + c + '-master span.new-score');
       
           var originalScore = $('tr#' + c + '-master span.original-score');
    
           originalScore[0].innerHTML = '(' + that.flatIndicators.CDI.original.values[c].toFixed(1) + ')';
           newScore[0].innerHTML = that.flatIndicators.CDI.values[c].toFixed(1);
               
       }
    window.setTimeout(function(){
        
      
        for (var c in ranksObj){
            if (parseFloat(that.flatIndicators.CDI.values[c].toFixed(1)) > parseFloat(that.flatIndicators.CDI.original.values[c].toFixed(1))){
               $('tr#' + c + '-master').addClass('change-score better');
           } else if (parseFloat(that.flatIndicators.CDI.values[c].toFixed(1)) < parseFloat(that.flatIndicators.CDI.original.values[c].toFixed(1))){
               $('tr#' + c + '-master').addClass('change-score worse');
           } else {
                $('tr#' + c + '-master').removeClass('change-score worse better small-score-change medium-score-change large-score-change');
           }
           var scoreDiff = Math.abs(Math.round((that.flatIndicators.CDI.values[c] - that.flatIndicators.CDI.original.values[c]) * 10)) / 10;
          
           if (scoreDiff >= 0.4){
               $('tr#' + c +'-master').addClass('large-score-change');
           } else if (scoreDiff >= 0.2) {
               $('tr#' + c +'-master').addClass('medium-score-change');
           } else if (scoreDiff > 0){
               $('tr#' + c +'-master').addClass('small-score-change');
           }
            
            var newRank = $('tr#' + c + '-master span.new-rank');
          if (parseInt(ranksObj[c].rank_label) !== parseInt(originalRanksObj[c].rank_label)){  
            $('tr#' + c +'-master').addClass('change-rank');
            newRank[0].innerHTML = ranksObj[c].rank_label;
              rankDiff = Math.abs((parseInt(ranksObj[c].rank_label)) - parseInt(originalRanksObj[c].rank_label));
              if (rankDiff <= 2){
                  $('tr#' + c +'-master').addClass('small-rank-change');
              } else if (rankDiff <= 4){
                  $('tr#' + c +'-master').addClass('medium-rank-change');
              } else {
                  $('tr#' + c +'-master').addClass('large-rank-change');
              }
          } else {
              newRank[0].innerHTML = '';
          }
            if (parseInt(ranksObj[c].rank_label) < parseInt(originalRanksObj[c].rank_label)){  
            
            $('tr#' + c +'-master').addClass('better-rank');
          } else if (parseInt(ranksObj[c].rank_label) > parseInt(originalRanksObj[c].rank_label)){  
              $('tr#' + c +'-master').addClass('worse-rank');
          } else {
              $('tr#' + c +'-master').removeClass('worse-rank better-rank small-rank-change medium-rank-change large-rank-change');
          }
            
        }
        
        for (var c in originalRanksObj){
           
            var originalRank = $('tr#' + c + '-master span.original-rank');


           
           
                originalRank[0].innerHTML = originalRanksObj[c].rank_label;
           
        }
        
        
        
       
       if (a !== 0){ // if there is user-initiated weight change
                $('tr.master-row').addClass('processed');
        }
            
    }, 700);   
           
       
    },
    /**
     * Create main nav and load the Overall tab.
     */
    startApp: function() { // still in var cdiApp = Backbone.View.extend
        // Create main nav.
        var mainNavModel = new cdiApp.mainNav.Model({
            items: this.indicators,
        });
        mainNavModel.addOverallItem();
        this.mainNavView = new cdiApp.mainNav.View({
            model: mainNavModel,
            className: 'mainNav',
            tagName: 'div',
            id:'cdi-mainNav'
        });
        $('#new_cdi .mainNav').remove();  // NEW code to keep from duplicating main CDI navbar
        $('#new_cdi').prepend(this.mainNavView.$el);
        $('#indicator-description-wrapper').addClass('idw-processed home').append('<a href="#" data-indicator="CDI_AID" class="next-button">Next up: aid</a>');
        
        this.loadCDI();
    },
    events: {
      'click a.next-button': 'triggerNext',
        'click #unstack-td': 'toggleStack' //is this event in the right place?
    },
    toggleStack: function(){
      $('.unstack-slider').toggleClass('off');
        if ($('.unstack-slider').hasClass('off')){
            this.unstackBars();
        } else {
            this.restackBars();
        }
    },
    triggerNext: function(e){
        e.preventDefault();

        Backbone.pubSub.trigger('triggerNext', e); //using event pubSub to trigger event in another view
    },

    /**
     * Load the Overall tab.
     */
    loadCDI: function(a, userWeighted, scroll) {

        

   
        var cdiModel = new cdiApp.CDI.Model({
            indicator: this.flatIndicators['CDI'],
            countries: this.countries,
            app: this
            //,            reload: userWeighted
        });
    
        this.cdiView = new cdiApp.CDI.View({
            model: cdiModel,
            el: '#home-cdi'
        });
        this.cdiView.render();
    },
    loadIndicator: function(indicator, country) {
        
        $('.weight-toggle, .reset-weight').addClass('weighted-override');
        $('.reset-weight, .weights-instruct').attr('aria-hidden', true);
        var indicatorLowerCase = indicator.toLowerCase();
        var data = this.sortScore(indicator, 'score');
        var cdiModel = new cdiApp.CDI_Indicator.Model({
            data: data,
            countries: this.countries,
            indicator: indicator,
            app: this
        });
        if (!this.indicatorView) {
            this.indicatorView = new cdiApp.CDI_Indicator.View({
                model: cdiModel,
                el: '#home-cdi-indicator'
            });
        } else {
            this.indicatorView.model = cdiModel;
            this.indicatorView.initialize();
        }
        this.indicatorView.render();
        console.log(country);
        this.indicatorView.show(country);
    },

    loadCountry: function(args) {

    

        var that = this;
        var cssSelector = '';
        var $indicatorElement;
        args.countryCodes.forEach(function(countryCode) {
            cssSelector = '.country-details.' + countryCode.toLowerCase();

            if (args.comparison) {
                $indicatorElement = $('.indicator.cdi ' + cssSelector);
            } else {
                $indicatorElement = $(cssSelector + ' .indicator.cdi');
            }
            // Set Overall data.
            var $rank = $indicatorElement.find('.indicator-rank');
            $rank.html('Rank: ' + that.getRank(countryCode, 'CDI'));
            var $avg = $indicatorElement.find('.avg');
            $avg.html(that.flatIndicators['CDI'].values[countryCode].toFixed(2));


            for (var i in that.indicators) {
                var data = [];
                var indicatorLowerCase = i.toLowerCase();
                if (args.comparison) {
                    $indicatorElement = $('.indicator.' + indicatorLowerCase + ' ' + cssSelector);
                } else {
                    $indicatorElement = $(cssSelector + ' .indicator.' + indicatorLowerCase);
                }
                var $content = $indicatorElement.find('.line-chart');
                var $canvas = $('<canvas></canvas>');
                $content.append($canvas);

                for (var year in that.flatIndicators[i].trends[countryCode]) {
                    data.push({
                        year: year,
                        data: that.flatIndicators[i].trends[countryCode][year]
                    });
                }

                var lineChartModel = new cdiApp.LineChart.Model({
                    data: data,
                    indicator: i
                });
                var lineChartView = new cdiApp.LineChart.View({
                    model: lineChartModel,
                    el: $canvas
                });
                $content.append(lineChartView.$el);

                // Set rank.
                var $rank = $indicatorElement.find('.indicator-rank');
                $rank.html('Rank: ' + that.getRank(countryCode, i));

                // Set average.
                var $avg = $indicatorElement.find('.avg');
                $avg.html(that.flatIndicators[i].values[countryCode].toFixed(2));

                // Load bar charts.
                var $label, $chart;
                var indicators = [];
                $content = $indicatorElement.find('.bar-charts');
                var children = that.flatIndicators[i].children;
                for (var j in children) {
                    var child = that.flatIndicators[children[j]];
                    $label = $('<div class="indicator-label category ' + i + '">' + child.label + '</div>');
                    $content.append($label);
                    if (child.children) {
                        for (var k in child.children) {
                            $label = $('<div class="indicator-label">' + that.flatIndicators[child.children[k]].label + ' <a href="#info" class="indicator-info" data-indicator="' + child.children[k] + '">i</a></div>');
                            $chart = $('<div class="chart-holder"></div>');
                            $content.append($label);
                            $content.append($chart);
                            indicators = [child.children[k]];
                all_data = that.flatIndicators[child.children[k]];

            
                            that.createBarChart(2016, countryCode, indicators, $chart, true, all_data.min, all_data.max, all_data.user_friendly_min, all_data.user_friendly_max, 4);
                        }
                    } else {
                        $label = $('<div class="indicator-label">' + child.label + ' <a href="#info" class="indicator-info" data-indicator="' + children[j] + '">i</a></div>');
                        $chart = $('<div class="chart-holder"></div>');
                        indicators = [children[j]];
                        $content.append($label);
                        $content.append($chart);
            all_data = that.flatIndicators[children[j]];

                        
                        that.createBarChart(2016, countryCode, indicators, $chart, true, all_data.min, all_data.max, all_data.user_friendly_min, all_data.user_friendly_max, 3);
                    }
                }
            }
        });
        $('a.indicator-info').click(function(e) {
            e.preventDefault();
            $target = $(e.target);
            var indicatorCode = $target.data('indicator');

            var modalModel = new cdiApp.Modal.Model({
                app: that,
                indicatorName: that.flatIndicators[indicatorCode].label,
                indicatorDescription: that.flatIndicators[indicatorCode].description
            });
            var modalView = new cdiApp.Modal.View({
                model: modalModel,
                className: 'cdi-modal',
                tagName: 'div'
            });
        });
    },

    /**
     * Get the rank of a country in an specific indicator.
     *
     * @param {string} countryCode
     *   The country code to get the rank.
     * @param {string} indicator
     *   The incidicator code.
     *
     * @return {integer}
     *   The rank of the given country in the given indicator.
     */
    getRank: function(countryCode, indicator) {
        var indicatorData = this.flatIndicators[indicator];
        var rank = 0;
        for (var i in indicatorData.values) {
            rank++;
            if (i === countryCode) {
                break;
            }
        }
        return rank;
    },

    /**
     * Load a template file.
     *
     * @param {string} templateName
     *   The template name to load.
     *
     * @return {string}
     *   The template content.
     */
    getTemplate: function(templateName) {
        var template = '';
        $.ajax({
            url: Drupal.settings.basePath + Drupal.settings.cgd_cdi.pathToModule + '/templates/' + templateName + '.tmpl.html',
            method: 'GET',
            async: false
        }).done(function(data) {
            template = data;
        });
        return template;
    }
});

/**
 * Model and View for the Overall tab on the homepage. was home.cdi.js
 */
cdiApp.CDI = {};
cdiApp.CDI.Model = Backbone.Model.extend({
    initialize: function(args) {
        
        /*
         * Using a publish/subscribe method to handle calling functions outside the current scope. maybe
         * there's a better way, but this solution works, adds needed flexibility
         */
        
        Backbone.pubSub.on('rankCountries', function(params){this.rankCountries(params);}, this); //subscribe to rankCountries trigger published in cdi_app.js
        this.indicator = args.indicator;
        this.countries = args.countries;
        this.app = args.app;
        this.rankCountries([]);
    },
    rankCountries: function(params){

    if (params[1]){
     this.isWeighted = params[1]; // ie if user has adjusted the weights of the seven component
    } else {
        this.isWeighted = 0;
    }

    if (params[3] === 'mousemove' || params[3] === 'touchmove'){ // re-ranking should occur only when the user finishes adjusting the weights, ie, mouseup or touchend. on mousemove/touch move, the bars adjust but no re-ranking happens
        Backbone.pubSub.trigger('adjustCDI', [params[1], params[2], this.ranksObj, this.originalRanksObj, params[3]]);
        return;
    }
    //RANKING BEGINS       
    this.groupedValues = [];
       
    var rank = 1, correlative = 1, prev_value=0, tie_word = false, previous_rank=0, previous_object;

/*
 *  pushing values from object to an array so that the order can be sorted by value.
 *  the tool previously relied on the order of key-value pairs in an object, which cannot be
 *  guaranteed. the order of an array can be guaranteed.
 */
        console.log(this.indicator);
    var sortable = []; 
    for (var country in this.indicator.values){
        var obj = {};
        obj.country = country;
        obj.value = this.indicator.values[country];
        sortable.push(obj); // pushes to array
    }
        sortable.sort(function(a,b){ //sorts array
        return b.value - a.value;
    });

        for (j = 0; j < sortable.length; j++){    
        i = sortable[j].country;

/*
line below sets user_friendly_values to be rounded to one decimal. previously the 
rounding was happening in the import from the XML file, which was influencing later 
calculations on the overall scores. new feature require client-side recalculations
*/  

    this.indicator.user_friendly_values[i] = this.indicator.values[i].toFixed(1); 

    if (this.indicator.values.hasOwnProperty(i)) {
/* 
below now compares each countries trimmed value to determine ties since those values
are now brought in untrimmed form the XML
*/            
        currentTrimmed = parseFloat(this.indicator.values[i].toFixed(1)); 
        if( currentTrimmed != prev_value){
                   rank = correlative;
           prev_value = currentTrimmed;
                   tie_word = false;
                } else {
                   tie_word = true;
                }
                correlative++;
        
        if(tie_word){
          previous_object.rank_label = previous_rank+'*';
        }
              
        var values_object = {
                        
                        rank            : correlative,
                        rank_label      : rank+ (tie_word?'*':''),
                        country         : this.countries[i],
                        value           : this.indicator.values[i],
                        value_label     : this.indicator.user_friendly_values[i],
                        index           : i
                       
                };
        previous_rank = rank;
        previous_object = values_object;
       
        this.groupedValues.push(values_object);
              

        }
      }
        
        this.ranksObj = {};
        for (i = 0; i < this.groupedValues.length; i++){
            c = this.groupedValues[i].index;
            this.ranksObj[c] = this.groupedValues[i];
        }



        if (params[0] === true){


            Backbone.pubSub.trigger('adjustCDI', [params[1], params[2], this.ranksObj, this.originalRanksObj, params[3]]);
        } else {
           this.originalRanksObj = $.extend(true,{}, this.ranksObj);

        }

//RANKING ENDS      
    }
   
});

cdiApp.CDI.View = Backbone.View.extend({
    initialize: function() {
        this.indicator = this.model.indicator;
        this.countries = this.model.countries;
        this.app = this.model.app;
        this.groupedValues = this.model.groupedValues;
        this.propName = "";    
        this.sortAsc = true;
        FB.init({
          appId: '445215188878009'
        });
        
    },
    sortArray: function(sortAsc,field){ //this successfully reordered the array but it's in the wrong place: after the ranking's been done
       if (sortAsc == null) {

           sortAsc = true;
       } 



        var key = field === 'country' ? 'country' : 'value';
        if (key === 'value'){
            return function(a,b){
                if(a[key]<b[key])
                     return sortAsc ? 1 : -1;
                if(a[key]>b[key])
                    return sortAsc ? -1 : 1;
              return 0;
            };
        } else {
            return function(a,b){
                if(a[key]<b[key])
                     return sortAsc ? -1 : 1;
                if(a[key]>b[key])
                    return sortAsc ? 1 : -1;
              return 0;
            };            
        }

    },
    
    render: function(sortAsc, field){
        
        this.collapsibleViews = {};
        var rank = 0;
        this.$el.find('tbody').html('');
        this.groupedValues.sort(this.sortArray(sortAsc, field));
console.log(this.groupedValues);
        for (var i in this.groupedValues) {
     
            if (this.groupedValues.hasOwnProperty(i)) {
                var item = this.groupedValues[i];

                // Add info row.
                var infoView = new cdiApp.infoView({
                    tagName: 'tr',
                    className: 'info',
                    id: item.index + '-info',
                    countryCode: item.index
                });
                var trendView = new cdiApp.trendView({
                    tagName: 'tr',
                    className: 'trend',
                    id: item.index + '-trend',
                    countryCode: item.index,
                    app: this.app
                });

                this.collapsibleViews[item.index] = {
                    'info': infoView,
                    'trend': trendView
                };

                var $chartHolder = $('<div class="chart-holder"></div>');
                var $row = $('<tr tabindex="0" id="' + item.index + '-master" data-v="info" data-c="' + item.index + '" class="master-row"></tr>');

                $row.html('<td><span class="new-value new-rank"></span> <span class="original-value original-rank">' + item.rank_label + '</span></td>' +
                    '<td><a class="expand-row" href="#" title="Expand row"><span class="country-label">' + item.country + '</span></a></td>' +
                    '<td><div><span class="new-value new-score">' + item.value_label + '</span> <span class="original-value original-score"></span></td>' +
                    '<td><div class="chart-holder"></div></td><td class="spacer"></td><td class="facebook-td"><a data-c="' + item.index + '" href="#"></a></td><td class="twitter-td"><a href="#" data-country="' + item.country + '" data-rank="' + item.rank_label.replace('*','%20(tie)') + '"></a></td>');
 
                this.$el.find('tbody').append($row);
                var indicators = this.indicator.children;

                this.app.createBarChart(2016, item.index, indicators, $row.find('.chart-holder'), false, this.indicator.min, this.indicator.max, "0", this.indicator.user_friendly_max, 1);
                this.$el.find('tbody').append(infoView.$el);
                // Add charts row.
                this.$el.find('tbody').append(trendView.$el);
            }
        }
        
        if (this.model.isWeighted){
            Backbone.pubSub.trigger('adjustCDI', [1, 0, this.model.ranksObj, this.model.originalRanksObj, 'resorted']);
        }
        $('#home-cdi').addClass('home-processed');

    },
    events: {
        'mouseup .active .bar-segment': 'barSegmentClicked',
        'click tr.master-row, .load-trends, .close-info': 'showCollapsed',
        'click a.sorting':'sortColumn',
        'click .facebook-td a': 'facebookShare',
        'click .twitter-td a': 'twitterShare'
       
        
    },
    barSegmentClicked: function(e){
        e.preventDefault();
        console.log(e.currentTarget.className.match(/CDI_\w{3}/)[0]);  
        Backbone.pubSub.trigger('triggerNext', e);
        e.stopImmediatePropagation();
    },
    twitterShare: function(e){

        var urlString = 'https://twitter.com/intent/tweet?original_referer=' + encodeURIComponent(location.href) + '&amp;text=' + e.currentTarget.dataset.country.replace(' ','%20') + '%20ranks%20' + e.currentTarget.dataset.rank + '%20of%2027%20on%20the%202016%20Commitment%20to%20Development%20Index&amp;url=' + encodeURIComponent(location.href) + '&amp;via=CGDev';
        window.open(urlString, null,
'left=20,top=20,width=700,height=400,toolbar=0,resizable=1');
        e.preventDefault();
        e.stopImmediatePropagation();
        $(e.currentTarget).blur(); //remove focus after click   
    },
   
    facebookShare: function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        var countryData = this.model.originalRanksObj[$(event.target).attr('data-c')];
        var fbCountry = countryData.country;
        var fbRank = countryData.rank_label.replace('*',' tie');
        FB.ui(
         {
            method: 'feed',
            name: fbCountry + ' ranks ' + fbRank + ' out of 27 on the 2016 Commitment to Development Index',
            caption: 'The Commitment to Development Index: Ranking the Rich',
            description: 'The Commitment to Development Index ranks 27 of the world\'s richest countries on their dedication to policies that benefit the 5.5 billion people living in poorer nations.',
            link: 'http://www.cgdev.org' + location.pathname,
            picture: 'http://www.cgdev.org/sites/default/files/CDI2015/cdi-2015-fb-crop.jpg'
        }); 
        $(event.currentTarget).blur(); //remove focus after click   
    },
    showCollapsed: function(event) {
        event.preventDefault();
        var $originalTarget = $(event.target);
        var $target = $(event.currentTarget);
        console.log($originalTarget);
        if ($originalTarget.hasClass('bar-segment') && $originalTarget.parent().parent().parent().hasClass('active')){
            console.log('bar segment of active row');
            return;
        }
        var bottom = $target.hasClass('close-bottom-trends') ? true : false;
        
        var countryCode = $target.attr('data-c');
        var viewType = $target.attr('data-v');
        $target = $target.hasClass('close-info') ? $('#' + countryCode + '-master') : $target.hasClass('close-component') ? $('#home-cdi-indicator .' + countryCode + '-master') : $target;
        
        
        var view = this.collapsibleViews[countryCode][viewType];

        var delay = 0;
        if ($target.hasClass('active')){

          if (viewType === 'info'){
              var trendButton = $('#' + countryCode + '-info a.load-trends');
              if (trendButton.hasClass('active-trend')){

                  $targetInfo = $target;
                  $target = trendButton;
                  viewInfo = view;
                  view = this.collapsibleViews[countryCode]['trend'];

                  $('#' + countryCode + '-trend .trends-wrapper').addClass('faster-collapse');
                  delay = 500;
                  console.log($target);
                  this.collapseTrends($target,view,delay,countryCode, bottom);
                  $target = $targetInfo;
                  view = viewInfo;
                  
              }
              
              $('#' + countryCode + '-info .info-wrapper').css('height', 0);
              
              delay = 500;
              this.showCollapsedHelper($target,view,delay,countryCode);
          }
          if (viewType === 'trend'){
            $('#' + countryCode + '-trend .trends-wrapper').css('height', 0);
            
              delay = 750;
              this.collapseTrends($target,view,delay,countryCode);
             
              
          }
          
      } else {
          this.showCollapsedHelper($target,view,delay,countryCode);
      }
  
    },  
    collapseTrends: function($target,view,delay,countryCode, bottom){
        $('#' + countryCode + '-trend .trends-wrapper').css('height', 0);
        this.showCollapsedHelper($target,view,delay,countryCode);
        if (bottom) {
            var $scrollTarget = $target.parent();
             $('html, body').animate({
                    scrollTop: $scrollTarget.offset().top - $('#main-menu').height() - $('#cdi-mainNav').height() - $('tr#' + countryCode + '-master').height()
                }, 500);
        }
        
    },
    showCollapsedHelper: function($target,view,delay,countryCode){
         window.setTimeout(function(){
            
                $target.toggleClass('active').toggleClass('active-trend');
    
            if (view.className === 'trend'){
                if ($target.hasClass('active')){
                    $target.addClass('fading');
                    setTimeout(function(){
                        $target.text('Hide trends');
                        $target.removeClass('fading');
                    },250);
                } else {
                    $target.addClass('fading');
                    setTimeout(function(){
                        $target.text('Show trends');
                        $target.removeClass('fading');
                    },250);
                }
            }
          
            view.toggle();
           $('#' + countryCode + '-trend .trends-wrapper').removeClass('faster-collapse');
            
        }, delay);
    },
   
    show: function(indicator) {
        this.$el.show();
        if (indicator === 'CDI'){
            setTimeout(function(){
                    $('#home-cdi').addClass('home-processed');
            }, 200);
        }
    },
    hide: function() {
        this.$el.hide();
    },
    sortColumn: function(event){
    event.preventDefault();
    var $target = $(event.target);
    this.sortAsc = $target.hasClass('asc');
    var field = $target.data('field');
    $('.sorting').removeClass('asc des');
    if(this.sortAsc){
      
        $target.addClass('des');
    } else {
       $target.addClass('asc');
      
    }
    this.sortAsc = !this.sortAsc;

    this.render(this.sortAsc, field);
        
    }

});


/**
 * Main navigation.
 */
cdiApp.mainNav = {};
cdiApp.mainNav.Model = Backbone.Model.extend({
    initialize: function(args) {
        var that = this;
        var items = args.items;
        this.items = [];
        for (var i in cgdCdi.indicatorsOrder) {
            if (cgdCdi.indicatorsOrder.hasOwnProperty(i)) {
                that.items.push({
                    code: cgdCdi.indicatorsOrder[i],
                    label: items[cgdCdi.indicatorsOrder[i]],
                    active: false
                });
            }
        }
    },
    addOverallItem: function() {
        this.items.unshift({ //unshift() method adds items to beginning of an array
            code: 'CDI',
            label: 'Overall',
            active: true
        });
    }
});
cdiApp.mainNav.View = Backbone.View.extend({
    initialize: function() {
         Backbone.pubSub.on('triggerNext', function(e){this.menuItemClicked(e);}, this); //subscribe to triggerNext trigger from next buttons
        Backbone.pubSub.on('barSegClickContinued', function(e){this.menuItemClickedContinued(e);}, this);
        this.render();
    },
    render: function() {
       
        var items = this.model.items;
        var that = this;
        items.forEach(function(item, j) {
            weightToggle = document.createElement('div');
            weightToggle.setAttribute('data-indicator', item.code);
            weightToggle.className = 'weight-toggle ' + item.code + '-bg ' + (item.active ? 'active' : '');
            activeIndicator = document.createElement('div');
            activeIndicator.className = 'active-indicator';
            weightToggle.appendChild(activeIndicator);
            nameSpan = document.createElement('span');
            nameSpan.innerHTML = '<a class="' + (item.active ? 'active' : '') + ' selectable" href="#' + item.code + '" data-indicator="' + item.code + '">' + item.label + '</a>';
            weightToggle.appendChild(nameSpan);
            if (item.code !== 'CDI'){
                
                sliderDiv = document.createElement('div');
                sliderDiv.className = 'slider';
                for (i = 0; i < 7; i++){
                    sliderNotch = document.createElement('div');
                    sliderNotch.className = 'slider-notches notch-' + i;
                    sliderDiv.appendChild(sliderNotch);
                }
                that.attachSliderEvents(sliderDiv, j);
                sliderSelector = document.createElement('button');
                sliderSelector.className = 'slider-selector';
                sliderSelectorInner = document.createElement('div');
                sliderSelectorInner.className = 'slider-selector-inner';
                sliderSelector.appendChild(sliderSelectorInner);
                sliderDiv.appendChild(sliderSelector);
                that.attachSelectorEvents(sliderSelector, j);
                
                
                
                weightToggle.appendChild(sliderDiv);
            } else {
                var weightsInstruct = document.createElement('div');
                weightsInstruct.className = 'weights-instruct';
                $(weightsInstruct).attr('aria-hidden', false);
                weightsInstruct.innerText = 'Sliders adjust weights';
                weightToggle.appendChild(weightsInstruct);
                
                var resetWeightDiv = document.createElement('div');
                resetWeightDiv.className = 'reset-weight';
                var resetWeight = document.createElement('a');
                resetWeight.href = 'javascript:void(0);';
                $(resetWeightDiv).attr('aria-hidden', true);
               
                resetWeight.innerHTML = 'Reset weights';
                resetWeightDiv.appendChild(resetWeight);
                weightToggle.appendChild(resetWeightDiv);
            }
            that.$el.append(weightToggle);
            
        });
        this.addMenuCloseButton();
        $(window).scroll(function(){
            el = document.getElementById('cdi-mainNav');
            var extra = $('body').width() > 739 ? 31 : $('body').width() > 739 ? 36 : $('body').width() > 539 ? 58 : 35;
            var scrollPoint = $('#section-header').height() + $('.cdi-header-wrapper').height() + extra;


            
            if($('body').scrollTop() >= scrollPoint){
                var navHeight = $('#cdi-mainNav').height() + 20;
                $(el).addClass('stick-to-top');
                $('#new_cdi').css('padding-top', navHeight);
            } else {
                $(el).removeClass('stick-to-top');
                $('#new_cdi').css('padding-top', '');
            }
        });
    },
    addMenuCloseButton: function(){
        this.$el.append('<button id="close-mainNav">(X) Close</button>');
    },
    
   attachSliderEvents: function(el, j){
        var that = this;
        var i = j - 1;
        $(el).click(function(e){
            sliderSelector =  $('.slider .slider-selector').eq(i);
            sliderSelector.addClass('active-selector jump-selector');
            sliderPosition = $(this).offset(); //page position object of the slider
            console.log('page position of slider channel');
            console.log(sliderPosition.left);


            position = that.getXOffset(e); // page position x off the click / touch event in the slider
console.log('page position of the click');
            console.log(position)

            newPosition = position - sliderPosition.left - 18;
console.log(newPosition);


            that.limitPosition();
            e.data = {};
            e.data.that = that;
            e.data.ev = e;
            e.data.i = i;

           that.selectorStop(e);
        });
    },
    attachSelectorEvents: function(el, j){
        var that = this;
        var i = j - 1; // j count includes overall; selectors start on index 1. i below passes as e.data
        $(el).on('mousedown touchstart', null, i, function(e){
            e.stopPropagation();
            e.preventDefault();
           e.xStartOffset = that.getXOffset(e); //get offset position of the mouse click or touch, so passing `e` as event
           e.startPosition = $(this).position();
            
            
           that.selectorStart(e);
       
       });
        $(el).on('keyup', null, i, function(e){
          that.keyedWeight(e);
        });
      
    },
    keyedWeight: function(e){ // handler for arrow-key control over weight toggles. necessary for accessibility
      
      if (e.keyCode === 37 || e.keyCode === 39){


            if (e.keyCode === 37){
                newPosition = e.currentTarget.offsetLeft - 13.6666 < -7 ? -8 : parseFloat($(e.currentTarget).css('left')) - 13.6666;

               
            } else if (e.keyCode === 39) {
                newPosition = e.currentTarget.offsetLeft + 13.6666 > 73 ? 74 : parseFloat($(e.currentTarget).css('left')) + 13.6666;


            }
            
            $(e.currentTarget).css('left', Math.round(newPosition * 3) / 3);
            e.data = {
                ev: {
                    currentTarget: e.currentTarget
                 },
                i: $(e.currentTarget).parent().parent().attr('data-indicator')
            };

            this.selectorStop(e);
        }
    },
    selectorStart: function(e){
        
        sliderIndex = e.data;
        $(e.currentTarget).addClass('active-selector');
        $('body').on('mousemove touchmove', null, {i:sliderIndex,ev:e,that:this}, this.selectorMove); // in selectorMove function, `this` becomes the $('body'); passing the current `this` (the view) as part of the new e.data
        $('body').on('mouseup touchend', null, {i:sliderIndex,ev:e,that:this}, this.selectorStop);
        
    },
    selectorMove: function(e){
    
        e.preventDefault();
        xCurrentOffset = e.data.that.getXOffset(e);
        xDistance = xCurrentOffset - e.data.ev.xStartOffset;
        newPosition = e.data.ev.startPosition.left + xDistance;
        e.data.that.limitPosition();
        sliderSelector = $('.slider .slider-selector').eq(e.data.i);
        sliderSelector.css('left', newPosition);
        e.data.notch = (newPosition + 8) / 13.6666 - 3;
        console.log(e.data.notch);  
        e.data.transition = 0;
    
        Backbone.pubSub.trigger('userInput', e);
    },
    
    limitPosition: function(){
         if (newPosition < -8){
            newPosition = -8;
        } else if (newPosition > 76){
            newPosition = 76;
        }  
    },
    selectorStop: function(e){


        
       if (e === 'resetWeight'){

           window.setTimeout(function(){ 

                Backbone.pubSub.trigger('userInput', e); 
            }, 400);
           return;
       }
        delay = e.data.ev.currentTarget.className === 'slider' ? 500 : 0;
        window.setTimeout(function(){
            $('.slider .slider-selector').removeClass('active-selector jump-selector');
        }, delay);
        roundedPosition = Math.round((newPosition + 8) / 13.6666) * 13.6666;


        e.data.notch = Math.round((newPosition + 8) / 13.6666) - 3;
console.log(e.data.notch);
        var eTarget = e.data.ev.currentTarget;

        if (e.data.notch !== 0){
            eParent = $(eTarget).parents('.weight-toggle');

            $(eParent).addClass('weighted');
            $('.reset-weight').css('display','inline');
            window.setTimeout(function(){
                $('#cdi-mainNav').addClass('weighted-component');
            },400);
        } else {
            eParent = $(eTarget).parents('.weight-toggle');
            $(eParent).removeClass('weighted');
            $('.reset-weight').css('display','inline');
    
        }
        e.data.transition = 1;
        if (e.type !== 'keyup') {
            roundedPosition = roundedPosition < 0 ? 0 : roundedPosition;
            sliderSelector.css('left', roundedPosition - 8);
            $('body').off('mouseup touchend', e.data.that.selectorStop);
            $('body').off('mousemove touchmove', e.data.that.selectorMove);
        }
        window.setTimeout(function(){ // setTimeout to allow transitions to complete before redrawing the graph
            Backbone.pubSub.trigger('userInput', e); //publish event to global mechanism
        }, 400);
        
    },
    resetWeight: function(){

        $('.slider .slider-selector').addClass('jump-selector');
         $('.slider .slider-selector').css('left','33px');
        $('.weight-toggle').removeClass('weighted');
        $('#cdi-mainNav').removeClass('weighted-component');
        window.setTimeout(function()
            {$('.slider .slider-selector').removeClass('jump-selector');
        }, 400);

        $('.reset-weight').attr('aria-hidden', true);
       e = 'resetWeight';
       this.selectorStop(e);
    },
    getXOffset: function(e){
         if(e.type === 'touchstart' || e.type === 'touchmove'){
               var touch = e.originalEvent.touches[0];
               return touch.pageX;
           } else if (e.type === 'mousedown' || e.type === 'mousemove' || e.type === 'click'){
               return e.pageX;
           }
        
    },
    events: {
        'click a.selectable': 'menuItemClicked',
        'click .reset-weight a': 'resetWeight',
        'click #close-mainNav': 'closeMainNav'
      
        
    },
    
    closeMainNav: function(){
        var closeMainNavText = $('#cdi-mainNav').hasClass('closed') ? '(X) Close' : 'Open menu';
        $('#cdi-mainNav').toggleClass('closed');        
        $('#close-mainNav').text(closeMainNavText);
    
    },
    menuItemClickedContinued: function(event, activeIndicator){
        
        that = this;
        
        var $target = $(event.target);
        var country = null
    ;

       
        if ($target.hasClass('next-button')){
       
            $target = $('div.' + $target.attr('data-indicator') + '-bg a.selectable');
        }
        if ($target.hasClass('bar-segment')){
            country = $target.parent().parent().parent().attr('data-c');
            $target = $('div.' + $target[0].className.match(/CDI_\w{3}/) + '-bg a.selectable');
            activeIndicator = 'CDI';
            console.log($target);
            
        }
        if ($target.hasClass('return-to-main')){
            country = $target.attr('data-c');
            returnMain = true;
            $target = $('div.CDI-bg a.selectable'); // nned to pass indicator somehow
        }
        console.log(country);
        $target.parent().parent().addClass('active');

        
        this.toggleSliders($target.attr('data-indicator'));
        if ($target.attr('data-indicator') === 'CDI'){

            $('#indicator-description-wrapper').removeClass('idw-processed');
            setTimeout(function(){
                $('.indicator-description, .indicator-explanation').empty();
                cgdCdi.hideIndicator(activeIndicator);
                cgdCdi.reload($target.attr('data-indicator'), country);

                $('.next-button').text('Next up: ' + cgdCdi.indicators[cgdCdi.indicatorsOrder[0]]).attr('data-indicator','CDI_AID');
                 $('#indicator-description-wrapper').addClass('idw-processed home');
                
            }, 500);
        } else {
          
            cgdCdi.hideIndicator(activeIndicator)
           $('#indicator-description-wrapper').removeClass('home');
            cgdCdi.reload($target.attr('data-indicator'), country);
        
            var labelIndex = cgdCdi.indicatorsOrder.indexOf($target.attr('data-indicator'));

            $('.next-button').css('opacity',0);
            if (labelIndex < cgdCdi.indicatorsOrder.length - 1){
                var nextI = labelIndex + 1;
                var nextLabel = cgdCdi.indicators[cgdCdi.indicatorsOrder[nextI]];
                setTimeout(function(){
                    $('.next-button').text('Next up: ' + nextLabel).attr('data-indicator',cgdCdi.indicatorsOrder[nextI]);
                    $('.next-button').css('opacity',1);
                },500);
            } else {
                setTimeout(function(){
                $('.next-button').text('Next up: Overall scores').attr('data-indicator','CDI');
                $('.next-button').css('opacity',1);
                },500);
            }
            
          
            
        }

        var extra = $('body').width() > 720 ? 50 : 70;
        var scrollPoint = $('#section-header').height() + $('.cdi-header-wrapper').height() + extra;
        
        if ($('#cdi-mainNav').hasClass('stick-to-top') && country == null) $('body').animate({scrollTop: scrollPoint}, 200);
   
    },
    menuItemClicked: function(event) {
        event.preventDefault();
        if ($(event.currentTarget).parent().parent().hasClass('active'))
            return;
        $('.show-return').removeClass('show-return'); // removes show-return class after user changes views
        var $activeItem = this.$el.find('div.active');
        $activeItem.removeClass('active');
        var activeIndicator = $activeItem.data('indicator');
        console.log(this.menuItemClickedContinued);  
        if (activeIndicator === 'CDI'){
            

            $('#indicator-description-wrapper').removeClass('idw-processed');
            $('#home-cdi').removeClass('home-processed');
            that = this;
            if (event.type === 'mouseup') {
               console.log('bar-segment');
                setTimeout(function(){
                     Backbone.pubSub.trigger('barSegClickContinued', event);
                }, 500);
               return;
            }
            setTimeout(function(){
                that.menuItemClickedContinued(event, activeIndicator);
            }, 500);
        } else {

            this.menuItemClickedContinued(event, activeIndicator);
        }
    },
    
    toggleSliders: function(indicator){
        if (indicator !== 'CDI'){
            $('.slider').addClass('hide-slider');
            window.setTimeout(function(){
                $('.slider').css('display', 'none');
            }, 500);
        }
        else if (!$('.unstack-slider').hasClass('off')){
                $('.slider').css('display', 'block');
                window.setTimeout(function(){
                    $('.slider').removeClass('hide-slider');
                }, 100);
            }
            
        }
    
});

/**
 * Info view.
 */
cdiApp.collapsibleView = Backbone.View.extend({
    loaded: false,
    toggle: function(barSegment) {
       this.$el.fadeToggle(0);
        var bs = barSegment ? true : false;
        this.render(bs);
    },
    hide: function() {
        this.$el.hide();
    },
    show: function() {
        if (!this.loaded) {
            this.render();
        }
        this.$el.show();
    }
});
cdiApp.infoView = cdiApp.collapsibleView.extend({
    initialize: function(args) {
        
        this.countryCode = args.countryCode;
    },
    render: function() {
        that = this;
        console.log(that);
        var addHeight = window.innerWidth <= 410 ? 42 : 81;
        if (!this.loaded) {
            
            this.loaded = true;
            
        
                var content = '<td colspan="7" class="info-td"><div class="info-wrapper"><div class="field field-name-field-overall field-type-text-long field-label-above"><div class="field-label">Overall:&nbsp;</div><div class="field-items"><div class="field-item even">' + cgdCdi.data.indicators.CDI.summaries[that.countryCode] + '</div></div></div><div class="year-results"><a href="/cdi-2016/country/SWE" target="_blank">Country report</a></div><a data-c="' + that.countryCode + '" data-v="info" class="close-info active" href="#">(X) Close</a></div></td>';
 
 
                that.$el.append(content);
                
                cHeight = $('#' + that.countryCode + '-info .field-name-field-overall').height() + $('#' + that.countryCode + '-info .year-results').height() + addHeight;
                $('#' + that.countryCode + '-info .year-results').before('<a class="load-trends" data-v="trend" data-c="' + that.countryCode + '" href="#">Show trends</a>');
                $('#' + that.countryCode + '-info .info-wrapper').css('height', cHeight);
                 //REWRITE HERE AND BELOW TO AVOID REPETITION
                $('#' + that.countryCode + '-info .year-results a').text('Country report').attr('target', '_blank');
                
                
         
        } else {
            cHeight = $('#' + that.countryCode + '-info .field-name-field-overall').height() + $('#' + that.countryCode + '-info .year-results').height() + addHeight;
             $('#' + that.countryCode + '-info .info-wrapper').css('height', cHeight);
            
        }
    }
});
cdiApp.trendView = cdiApp.collapsibleView.extend({
    initialize: function(args) {
        this.countryCode = args.countryCode;
        this.app = args.app;
    },
    render: function() {
         if (!this.loaded) {

            this.loaded = true;
            var $content = $('<div class="trends-inner-wrapper"></div>');
            var $contentWrapper = $('<div class="trends-wrapper"></div>');
            var $contentTd = $('<td colspan="7"></td>');
            var that = this;
            
            $contentWrapper.append($content);
            $contentTd.append($contentWrapper);
            this.$el.append($contentTd);
            var allIndicators = ['CDI'].concat(this.app.indicatorsOrder);
            that.app.indicators['CDI'] = 'Overall';

            allIndicators.forEach(function(indicator){
                var data = [];
                var $canvas = $('<canvas></canvas>');
                var $canvasWrapper = $('<div class="line-chart-wrapper ' + indicator + '"></div>');
                var label = that.app.indicators[indicator];
                var value = that.app.flatIndicators[indicator].values[that.countryCode];
                $canvasWrapper.append('<div class="line-chart-header ' + indicator + '">' +
                    '<span class="indicator-label">' + label + '</span> ' +
                    '<span class="indicator-value">' + value.toFixed(1) + '</span>' +
                    '</div>');

                $canvasWrapper.append($canvas);
                $content.append($canvasWrapper);
                for (var year in that.app.flatIndicators[indicator].trends[that.countryCode]) {
                    data.push({
                        year: year,
                        data: that.app.flatIndicators[indicator].trends[that.countryCode][year]
                    });
                }
                var lineChartModel = new cdiApp.LineChart.Model({
                    data: data,
                    indicator: indicator
                });
                var lineChartView = new cdiApp.LineChart.View({
                    model: lineChartModel,
                    el: $canvas
                });
               
            });
             var $buttonWrapper = $('<div style="clear:left">');
             $buttonWrapper.append('<div class="year-results hello"><a target="_blank" href="/cdi-2016/country/' + this.countryCode + '">Country report</a></div>');
            $content.append($buttonWrapper);
            $content.append('<a data-c="' + this.countryCode + '" data-v="info" class="close-info close-bottom-trends active" href="#">(X) Close</a>')
            var tHeight = $('#' + this.countryCode + '-trend .trends-inner-wrapper').height() + 80;
            $('#' + this.countryCode + '-trend .trends-wrapper').css('height', tHeight);
            
        } else {
           
            var tHeight = $('#' + this.countryCode + '-trend .trends-inner-wrapper').height() + 50; //CAN REWRITE HERE TO AVOID REPETITION
            $('#' + this.countryCode + '-trend .trends-wrapper').css('height', tHeight);
        }   
    }
});


/*
 *
 * LINE-CHART.JS
 */

 cdiApp.LineChart = {};
cdiApp.LineChart.Model = Backbone.Model.extend({
    initialize: function(args) {
    var item = cgdCdi.indicatorColors[args.indicator];
    var border_color = item.border;
    var background_color = item.background;
    var scaleLineColor = "rgba(0,0,0,.1)";
    var scaleFontColor = "#666";
/*  if(border_color=="#FFFFFF"){
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

/**
 * Model and View for the Overall tab on the homepage. was home.cdi_indicators.js
 */
cdiApp.CDI_Indicator = {};
cdiApp.CDI_Indicator.Model = Backbone.Model.extend({
    initialize: function(args) {
        this.app = args.app;
        this.data = args.data;
        this.indicator = args.indicator;
        this.indicators = this.app.flatIndicators[this.indicator].children;
    this.groupedValues = [];
        var rank = 1; 
        for (var i in this.data.values) {
            if (this.data.values.hasOwnProperty(i)) {
                this.groupedValues.push({
                        rank    : rank, 
                        country : this.app.countries[i],
                        value   : this.data.values[i],
            value_label : this.data.user_friendly_values[i],
                        id      : i,
            min : this.data.min,
            min_label: this.data.user_friendly_min,
            max : this.data.max,
            max_label : this.data.user_friendly_max,
                });
                rank++;
            }
        }
    }
});

cdiApp.CDI_Indicator.View = Backbone.View.extend({
    initialize: function() {
        this.data = this.model.data;
        this.indicator = this.model.indicator;
        this.app = this.model.app;
        this.indicators = this.model.indicators;
    this.groupedValues = this.model.groupedValues;
    },
    render: function() {
        var that = this;
        var indicators = this.indicators;
       
        this.$el.find('tbody').empty();
        this.el.className = this.indicator;
        this.collapsibleViews = {};
        $('#indicator-description-wrapper').removeClass('idw-processed');
      
    
        
        var rank = 0;
            for (var index in this.groupedValues) {
                if (this.groupedValues.hasOwnProperty(index)) {
            var item = this.groupedValues[index];
            var i = item.id;

                    // Add components row.
                    var componentsModel = new cdiApp.Components.Model({
                        countryCode: i,
                        indicators: indicators,
                        app: this.app
                    });
                    var componentsView = new cdiApp.Components.View({
                        tagName: 'tr',
                        className: 'components ' + i + '-components',
                        model: componentsModel
                    });

                    this.collapsibleViews[i] = {
                        'components': componentsView,
                    };

                    var $chartHolder = $('<div class="chart-holder"></div>');
                    var $row = $('<tr class="' + i + '-master master-row" data-c="' + i + '"></tr>');
                    $row.html('<td>' + item.rank + '</td>' +
                        '<td><a href="#"><span class="country-label">' + item.country + '</a></span></td>' +
                        '<td>' + item.value_label + '</td>' +
                        '<td><div class="chart-holder"></div></td><td class="spacer"></td><td class="facebook-td"><a data-country="' + item.country + '" data-rank="' + item.rank + '" data-component="' + this.app.indicators[this.indicator] + '" href="#"></a></td><td class="twitter-td"><a href="#" data-country="' + item.country + '" data-rank="' + item.rank + '" data-component="' + this.app.indicators[this.indicator] + '"></a></td>');
                    

                    this.$el.find('tbody').append($row);
                    this.app.createBarChart(2016, i, [this.indicator], $row.find('.chart-holder'), false, item.min, item.max, item.min_label, item.max_label, 2);

                    //$('#new_cdi table tbody').append('<tr id="' + data[i].c + '-info" class="info"><td></td><td colspan="5">Info</td></tr>');
                   
                    this.$el.find('tbody').append(componentsView.$el);
                    
                    setTimeout(function(){
                        $('#indicator-description').empty();
                        $('#indicator-description').append('<div class="indicator-description">' + that.model.data.description + '</div>');
                        $('#indicator-explanation').empty();
                        $('#indicator-explanation').append('<div class="indicator-description">' + that.model.data.explanation + '</div>');
                        $('#indicator-description-wrapper').addClass('idw-processed');
                    }, 500);
                }
            }
        
    },
    events: {
        'click tr.master-row, .close-components': 'showComponents',
        'click a.sorting':'sortColumn',
        'click .facebook-td a': 'facebookShare',
        'click .twitter-td a': 'twitterShare',
        'click .return-to-main': 'returnToMain'
    },
    returnToMain: function(e){
        e.preventDefault();
        console.log('reutr to main');
        Backbone.pubSub.trigger('triggerNext', e); // triggers menuItemClicked in home.cdi.js
    },
    twitterShare: function(e){
        console.log(e);
        var urlString = 'https://twitter.com/intent/tweet?original_referer=' + encodeURIComponent(location.href) + '&amp;text=' + e.currentTarget.dataset.country.replace(' ','%20') + '%20ranks%20' + e.currentTarget.dataset.rank + '%20of%2027%20on%20the%20' + e.currentTarget.dataset.component.toLowerCase() +  '%20component%20of%20the%202016%20Commitment%20to%20Development%20Index&amp;url=' + encodeURIComponent(location.href) + '&amp;via=CGDev';
        window.open(urlString, null,
'left=20,top=20,width=700,height=400,toolbar=0,resizable=1');
        e.preventDefault();
        e.stopImmediatePropagation();
        $(e.currentTarget).blur(); //remove focus after click   
    },
    facebookShare: function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
       
        FB.ui(
         {
            method: 'feed',
            name: e.currentTarget.dataset.country + ' ranks ' + e.currentTarget.dataset.rank + ' out of 27 on the ' +  e.currentTarget.dataset.component.toLowerCase() + ' component of the 2016 Commitment to Development Index',
            caption: 'The Commitment to Development Index: Ranking the Rich',
            description: 'The Commitment to Development Index ranks 27 of the world\'s richest countries on their dedication to policies that benefit the 5.5 billion people living in poorer nations.',
            link: 'http://www.cgdev.org' + location.pathname,
            picture: 'http://www.cgdev.org/sites/default/files/CDI2015/cdi-2015-fb-crop.jpg'
        }); 
        $(e.currentTarget).blur(); //remove focus after click   
    },
    showComponents: function(event) {
        console.log(event);
        $target = $(event.currentTarget);
        console.log($target);
        var bottom = $target.hasClass('close-bottom') ? true : false;
        var countryCode = $target.attr('data-c');
        var view = this.collapsibleViews[countryCode]['components'];
        $target = $target.hasClass('close-components') ? $('.' + countryCode + '-master') : $target;
    //    var $countryRow = this.$el.find('tr.' + countryCode + '-master');
        delay = 0;
        if ($target.hasClass('active')){
            $('.' + countryCode + '-components .components-wrapper').height(0);
            if (bottom){
                console.log('bottom');
                this.scrollToTarget($target);
            }
            delay = 500;
            }
        setTimeout(function(){
            $target.toggleClass('active');
            view.toggle(event.barSegment); //passes true if clicking on the bar segment was the trigger            
        }, delay);
    //    $target.toggleClass('active');
        if (event.barSegment) {
            console.log('calling scrool to target');
            this.scrollToTarget($target, 10);
        } else {
        event.preventDefault();
        }
    },
    scrollToTarget: function($target, ex){
        var extra = ex != null ? ex : 0;
      $('html, body').animate({
                    scrollTop: $target.offset().top - $('#main-menu').height() - $('#cdi-mainNav').height() - extra
                }, 500);  
    },

    
    show: function(country) {
        this.$el.show();
        console.log(country);
        if (country != null) {
                var event = {};
            event.currentTarget = $('tr.' + country + '-master.master-row');
            event.barSegment = true;
            this.showComponents(event);
            
        }
    },
    hide: function() {
        this.$el.hide();
    },
    sortColumn: function(event){
        event.preventDefault();
        var $target = $(event.target);
        var asc = $target.hasClass('asc');
        var field = $target.data('field');

        if(asc){
           $target.removeClass('asc');
        } else {
           $target.addClass('asc');
        }
        asc = !asc;

        this.sortByField(field, asc);
    },
    sortByField: function(field, asc){
        this.groupedValues.sort(this.sortArray(field, asc));
        this.render();
    },
    sortArray: function(key,asc) {
        return function(a,b){
          if(a[key]<b[key])
                return asc ? -1 : 1;
          if(a[key]>b[key])
                return asc ? 1 : -1;
          
          return 0;
        }
    }
});

/**
 * Components expanded Model and View. was home.cdi_indicators.js
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
    render: function(bs) {
        if (!this.loaded) {
            $('.show-return').removeClass('show-return'); // removes show return class from expanded components after another is opened
            this.loaded = true;
            var $contentTd = $('<td colspan="7"></td>');
            var $contentWrapper = $('<div class="components-wrapper"></div>');
            if (bs) $contentWrapper.addClass('show-return');
            var $content = $('<div class="components-inner-wrapper"></div>');
            $contentWrapper.append($content);
            $contentTd.append($contentWrapper);
            this.$el.append($contentTd);
             $content.append('<div class="year-results"><a target="_blank" href="/cdi-2016/country/' + this.countryCode + '">Country report</a></div>','<a data-c="' + this.countryCode + '" data-v="components" class="close-components active" href="#">(X) Close</a>','<a data-c="' + this.countryCode + '" data-v="components" class="return-to-main active" href="#">(←) Go back</a>');
            //$content.append('<a data-c="' + this.countryCode + '" data-v="components" class="close-components active" href="#">(X) Close</a>');
            //$content.append('<a data-c="' + this.countryCode + '" data-v="components" class="return-to-main active" href="#">(←) Go back</a>');
            
            
          
            for(var i in this.data) {
                var $label, $chart;
                var indicators = [];
        var parent = this.app.flatIndicators[i];

                if (this.app.flatIndicators[i].children) {
                    $label = $('<div class="indicator-label category ' + this.app.flatIndicators[i].parent + '">' + this.data[i] + '</div>');
                    $content.append($label);
                    for (var j in this.app.flatIndicators[i].children) {
                        $label = $('<div class="indicator-label">' + this.app.flatIndicators[this.app.flatIndicators[i].children[j]].label + ' <a href="#info" class="indicator-info" data-indicator="' + this.app.flatIndicators[i].children[j] + '">i</a></div>');
                        $chart = $('<div class="chart-holder"></div>');
                        $content.append($label);
                        $content.append($chart);
                        indicators = [this.app.flatIndicators[i].children[j]];
            parent = this.app.flatIndicators[this.app.flatIndicators[i].children[j]];

            this.app.createBarChart(2016, this.countryCode, indicators, $chart, true, parent.min, parent.max, parent.user_friendly_min, parent.user_friendly_max, 4);
                    }
                } else {
                    var $label = $('<div class="indicator-label">' + this.data[i] + ' <a href="#info" class="indicator-info" data-indicator="' + i + '">i</a></div>');
                    var $chart = $('<div class="chart-holder"></div>');
                    indicators = [i];
                    $content.append($label);
                    $content.append($chart);
                    this.app.createBarChart(2016, this.countryCode, indicators, $chart, true, parent.min, parent.max, parent.user_friendly_min, parent.user_friendly_max, 3);
                }
            }
            $content.append('<div class="year-results"><a class="components-report-bottom" target="_blank" href="/cdi-2016/country/' + this.countryCode + '">Country report</a></div>', '<a data-c="' + this.countryCode + '" data-v="components" class="close-components close-bottom active" href="#">(X) Close</a>', '<a data-c="' + this.countryCode + '" data-v="components" class="return-to-main close-bottom active" href="#">(←) Go back</a>');
            //$content.append('<a data-c="' + this.countryCode + '" data-v="components" class="close-components close-bottom active" href="#">(X) Close</a>')
        }
        var cHeight = $('.' + this.countryCode + '-components .components-inner-wrapper').height() + 50;
        $('.' + this.countryCode + '-components .components-wrapper').height(cHeight);
    },
    events: {
        'click a.indicator-info': 'showIndicatorInfo',
        
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

/*
*
* was line_chart.js
*/

cdiApp.LineChart = {};
cdiApp.LineChart.Model = Backbone.Model.extend({
    initialize: function(args) {
    var item = cgdCdi.indicatorColors[args.indicator];
    var border_color = item.border;
    var background_color = item.background;
    var scaleLineColor = "rgba(0,0,0,.1)";
    var scaleFontColor = "#666";
/*  if(border_color=="#FFFFFF"){
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
