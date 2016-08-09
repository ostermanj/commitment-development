/**
 * The main APP for the new CDI section.
 */

/* NEW CODE
implicitWeight is product of the one-over-standard-deviation for the indicator and a constant that 
was used to calculate overall country scores. used here to recalculate country scores when 
the user adjusts weights
 */

 var userWeights = {
	   CDI_AID: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 1.053251156178860
	   },
	   CDI_INV: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 1.705258345246140
	   },
	   CDI_TEC: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 0.798422233412404
	   },
	   CDI_ENV: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 0.894036763570826
	   },
	   CDI_TRA: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 1.1855207237
	   },
	   CDI_SEC: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 0.701892181000000
	   },
	   CDI_MIG: {
		  value: 1,
		  unlocked: true,
		  implicitWeight: 0.661618574916134
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
	    background: '#FFFFFF',
	    border: '#FFFFFF'
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
        var that = this;
        $('#html5_wrapper').css('display','block');

        // Get the data file.

        $.get(options.url).done(function(data){
            that.data = data;
            var countryCodes = that.getCountryCodes();
            that.getCountryNames(countryCodes);
            that.getMainIndicators();
            that.flattenData();

            if (options.onLoad && typeof that[options.onLoad] === 'function') {
                that[options.onLoad](options.args);
            }
        });
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
        if (countryCodes.length && false) {
            $.ajax({
                type: 'GET',
                url: '/cdi-2015/country-codes',
                data: {
                    countryCodes: countryCodes
                },
                context: this
            }).done(function(data) {
                this.countries = data;
            });
        }
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

    reload: function(indicator) {

        var viewName = indicator.toLowerCase() + 'View';
        if (indicator === 'CDI') { //this[viewName]) {

            this[viewName].show();
        }
        else {

            this.loadIndicator(indicator);
        }
    },

    hideIndicator: function(indicator) {
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
events: {
        'mousedown div.chart-holder div' : 'increaseWeight'
       
    },
    changeIncrement: 0.6, //0.6 so that other six weights changed by 0.1 to keep total weighting constant
    increaseWeight:function(e){
      this.selectWeight(e); // finds which indicator has been changed
      if (e.which === 1){  // if left click
           for (var ind in userWeights){
              if (ind == changedIndicator){
                 userWeights[ind].value += this.changeIncrement;  // increase changed indicator weight by 0.6
              } else {
                 userWeights[ind].value -= this.changeIncrement / 6; // decrease all others by 0.6
                 }
           } 
         }
      else if (e.which === 3){ // right click
       
           for (var ind in userWeights){
              if (ind == changedIndicator){    // inverse of above
                 userWeights[ind].value -= this.changeIncrement;
              } else {
                 userWeights[ind].value += this.changeIncrement / 6;
                 }
           } 
         
 
      }
 
      this.changeWeight(e);
    },
    selectWeight: function(e){
       regex = /(^.+)-bg/
       changedIndicator = e.currentTarget.className.match(regex)[1];


    },
    totalWeightsFn: function(){
      var totalWeights = 0;
      for (var weight in userWeights){
          totalWeights += userWeights[weight].value;
      }
      return totalWeights;
    },
    changeWeight: function(e){
       


     
     for (var ind in this.flatIndicators){

        if (ind.indexOf('CDI_') != -1){
         for (var c in this.flatIndicators[ind].weighted){
/*           if (ind == 'CDI_AID' && c == 'DNK'){
             console.log('original display value: ' + this.flatIndicators[ind].values[c]);
             console.log('implicit weight: ' + userWeights[ind].implicitWeight);
             console.log('user weight: ' + userWeights[ind].value);
           }*/
          
           this.flatIndicators[ind].weighted[c] = this.flatIndicators[ind].original.weighted[c] * userWeights[ind].value;  // changes weighted 
           this.flatIndicators[ind].values[c] = this.flatIndicators[ind].original.values[c] * userWeights[ind].value;
           // user_friendly_values governs what shows in the tooltip on the main graph
           this.flatIndicators[ind].user_friendly_values[c] = this.flatIndicators[ind].original.user_friendly_values[c] * userWeights[ind].value;
           // below: create object to make implicit weighted values that make up overall country scores explicit
           this.flatIndicators[ind].weighted_values_for_avg = this.flatIndicators[ind].weighted_values_for_avg ? this.flatIndicators[ind].weighted_values_for_avg : {};
           this.flatIndicators[ind].weighted_values_for_avg[c] = this.flatIndicators[ind].weighted_values_for_avg[c] ? this.flatIndicators[ind].weighted_values_for_avg[c] : {};
           this.flatIndicators[ind].weighted_values_for_avg[c] = this.flatIndicators[ind].original.values[c] * userWeights[ind].value * userWeights[ind].implicitWeight;
   /*        
            if (ind == 'CDI_AID' && c == 'DNK'){
             console.log('new display value: ' + this.flatIndicators[ind].values[c]);
             console.log('new weighted value: ' + this.flatIndicators[ind].weighted_values_for_avg[c]);
             
           }
     */      
         }
        }
        
     }
 
    this.changeOverallScores(e); 
    },
    changeOverallScores: function(e){
    
console.log(this.flatIndicators);    



    for (var c in this.flatIndicators.CDI.values){
 
       var runningTotal = 0;
       for (var ind in this.flatIndicators){
          if (ind.indexOf('CDI_') != -1){
             runningTotal += this.flatIndicators[ind].weighted_values_for_avg[c]
          }
       }
       this.flatIndicators.CDI.values[c] = runningTotal / 7;
       console.log('Country: ' + c +'; New average: ' + this.flatIndicators.CDI.values[c]);
       newScore = this.flatIndicators.CDI.values[c];
       oldScore = this.flatIndicators.CDI.original.values[c];
       if (newScore.toFixed(1) > oldScore.toFixed(1)){
          console.log('Better');          
       } else if (newScore.toFixed(1) < oldScore.toFixed(1)){
          console.log('Worse');
       } else {console.log('Same');}
    }
/**
     * load CDI results is accurate country averages but the order of the countries is not changing
     rank function works properly except that the countries are in the wrong order.
     */
     this.startApp(true);
    },
    /**
     * Create main nav and load the Overall tab.
     */
    startApp: function(weighted) {
        // Create main nav.
        var mainNavModel = new cdiApp.mainNav.Model({
            items: this.indicators,
        });
        mainNavModel.addOverallItem();
        this.mainNavView = new cdiApp.mainNav.View({
            model: mainNavModel,
            className: 'mainNav',
            tagName: 'ul'
        });
        $('#new_cdi .mainNav').remove();  // NEW code to keep from duplicating main CDI navbar
        $('#new_cdi').prepend(this.mainNavView.$el);
        this.loadCDI(weighted);
    },

    /**
     * Load the Overall tab.
     */
    loadCDI: function(userWeighted) {



    if (userWeighted == true){
console.log('user weighted');
    };
        var cdiModel = new cdiApp.CDI.Model({
            indicator: this.flatIndicators['CDI'],
            countries: this.countries,
            app: this
        });
    
        this.cdiView = new cdiApp.CDI.View({
            model: cdiModel,
            el: '#home-cdi'
        });
        this.cdiView.render();
    },
    loadIndicator: function(indicator) {
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
        this.indicatorView.show();
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
                            $label = $('<div class="indicator-label"><a href="#info" class="indicator-info" data-indicator="' + child.children[k] + '">i</a>' + that.flatIndicators[child.children[k]].label + '</div>');
                            $chart = $('<div class="chart-holder"></div>');
                            $content.append($label);
                            $content.append($chart);
                            indicators = [child.children[k]];
			    all_data = that.flatIndicators[child.children[k]];
			
                            that.createBarChart(2015, countryCode, indicators, $chart, true, all_data.min, all_data.max, all_data.user_friendly_min, all_data.user_friendly_max, 4);
                        }
                    } else {
                        $label = $('<div class="indicator-label"><a href="#info" class="indicator-info" data-indicator="' + children[j] + '">i</a>' + child.label + '</div>');
                        $chart = $('<div class="chart-holder"></div>');
                        indicators = [children[j]];
                        $content.append($label);
                        $content.append($chart);
			all_data = that.flatIndicators[children[j]];
						
                        that.createBarChart(2015, countryCode, indicators, $chart, true, all_data.min, all_data.max, all_data.user_friendly_min, all_data.user_friendly_max, 3);
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
     * scale tables on window ready and resize
     *
     * 
     */

function scaleTables() {
	
	var cdiDiv = document.getElementById('new_cdi');
    var tbls = cdiDiv.querySelectorAll('table');
    w = window.innerWidth;
    if (w < 980) {
       ratio = w / 980;    
       mb0 = (1 - ratio) * 1321;     
       tbls[0].style.marginBottom = '-' + mb0 + 'px';
       tbls[0].style.msTransform = 'scale(' + ratio + ')';
	   tbls[0].style.Moztransform = 'scale(' + ratio + ')';
	   tbls[0].style.WebkitTransform = 'scale(' + ratio + ')';
	   tbls[0].style.OTransform = 'scale(' + ratio + ')';
	   tbls[0].style.transform = 'scale(' + ratio + ')';
	}
    if (w < 780) {
       ratio = w / 820; 
       mb1 = (1 - ratio) * 1722;
       tbls[1].style.marginBottom = '-' + mb1 + 'px';
	   tbls[1].style.msTransform = 'scale(' + ratio + ')';
	   tbls[1].style.Moztransform = 'scale(' + ratio + ')';
	   tbls[1].style.WebkitTransform = 'scale(' + ratio + ')';
	   tbls[1].style.OTransform = 'scale(' + ratio + ')';
	   tbls[1].style.transform = 'scale(' + ratio + ')';
    }
}

function windowResized() {
    var cdiDiv = document.getElementById('new_cdi');
    var tbls = cdiDiv.querySelectorAll('table');
    w = window.innerWidth;
	
    if (w >= 980) {
         tbls[0].style.marginBottom = 0;
          tbls[0].style.msTransform = 'scale(1)';
	   tbls[0].style.Moztransform = 'scale(1)';
	   tbls[0].style.WebkitTransform = 'scale(1)';
	   tbls[0].style.OTransform = 'scale(1)';
	   tbls[0].style.transform = 'scale(1)';
		 tbls[1].style.marginBottom = 0;
          tbls[1].style.msTransform = 'scale(1)';
	   tbls[1].style.Moztransform = 'scale(1)';
	   tbls[1].style.WebkitTransform = 'scale(1)';
	   tbls[1].style.OTransform = 'scale(1)';
	   tbls[1].style.transform = 'scale(1)';
	}
	else {
	   scaleTables();	
	}
}

jQuery(function($) {

    scaleTables();
	$(window).resize(function(){

	   windowResized();
    });
});


