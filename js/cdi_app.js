/**
 * The main APP for the new CDI section.
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
});*/

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
	    background: '#b5a38b',
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
            console.log('userInput with args = e = resetWeight');
            for (var ind in userWeights){ 
              userWeights[ind].value = 1;
            }
            console.log('userWeights');console.log(userWeights);
            var isWeighted = 0;
            for (var ind in userWeights){    
              userWeights[ind].totalWeight = userWeights[ind].value * userWeights[ind].invSTD; // creates a total weight obj for each
              
            }
            var that = this;
      //      window.setTimeout(function(){
                console.log('calling changeWeight() with 0,1,"click"')
                that.changeWeight(0,1,'click');
    //        }, 400);
            return;
        }
        eventType = args.type;
        transition = args.data.transition;
        whichInd = this.indicatorsOrder[args.data.i];
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

            this[viewName].show(indicator);
            
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
    
    changeFactor: 2, 
   

    totalWeightsFn: function(){
      var totalWeights = 0;
      for (var ind in userWeights){
          totalWeights += userWeights[ind].totalWeight;
      }
      return totalWeights;
    },
    changeWeight: function(a,transition, et){ //a = isWeighted 1 or 0 ie at least one component's weight has been changed (!0)
      console.log(a); 
    
     sumTotalWeights = this.totalWeightsFn();


     
     for (var ind in this.flatIndicators){

        if (ind.indexOf('CDI_') != -1){

           for (var c in this.flatIndicators[ind].weighted){
          
              this.flatIndicators[ind].weighted[c] = this.flatIndicators[ind].original.values[c] * userWeights[ind].totalWeight / sumTotalWeights;  // changes value that informs width of bar segment according to new weighting
            
           }
        }
     }
        console.log('calling changeOverallScores')
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



console.log('triggerign rankCountries with true, 0, 1, click');
        Backbone.pubSub.trigger('rankCountries', [true, a, transition, et]);
    
      //  this.adjustCDI(a, transition);
    },
    adjustCDI: function(params){ //params = [0, 1, Object, Object, "click"]
         /*
         * ADJUST BARS
    */
       console.log(params);
        if (params[4] === 'resorted'){
            console.log('resorted');
            this.adjustScores(params);
            return;
        }
        this.isUserWeighted = params[0];
        console.log(this.flatIndicators);
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
         console.log('calling adjustScores');
         this.adjustScores(params);
     }
        

    },
    
    adjustScores: function(params){
        /*
        * ADJUST RANKS AND SCORES
        */
    
        if (params[4] === 'resorted'){
            console.log(params);
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
        this.loadCDI();
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
/*
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
*/

