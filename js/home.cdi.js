/**
 * Model and View for the Overall tab on the homepage.
 */
cdiApp.CDI = {};
cdiApp.CDI.Model = Backbone.Model.extend({
    initialize: function(args) {
        this.indicator = args.indicator;
        this.countries = args.countries;
        this.app = args.app;
	this.groupedValues = [];
	var rank = 1, correlative = 1, prev_value=0, tie_word = false, previous_rank=0, previous_object;
	for (var i in this.indicator.values) {
            if (this.indicator.values.hasOwnProperty(i)) {
		if( this.indicator.values[i] != prev_value){
                   rank = correlative;
		   prev_value = this.indicator.values[i];
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
    }
});

cdiApp.CDI.View = Backbone.View.extend({
    initialize: function() {
        this.indicator = this.model.indicator;
        this.countries = this.model.countries;
        this.app = this.model.app;
	this.groupedValues = this.model.groupedValues;
	this.propName = "";
	this.sortAsc = false;
    },
    render: function() {
        var that = this;
        this.collapsibleViews = {};
        var rank = 0;
	this.$el.find('tbody').html('');

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
                var $row = $('<tr id="' + item.index + '-master" class="master-row"></tr>');
                $row.html('<td>' + item.rank_label + '</td>' +
                    '<td><a href="cdi-2015/country/' + item.index + '"><span class="country-label">' + item.country + '</span></a></td>' +
                    '<td>' + item.value_label + '</td>' +
                    '<td><div class="chart-holder"></div></td>' +
		    '<td><a href="#" class="show-info" data-c="' + item.index + '">Info</a></td>' +
                    '<td><a href="#" class="show-trend" data-c="' + item.index + '">Trends</a></td>'+	
		    '<td><input type="checkbox" value="' + item.index + '" class="compare-input"/><a href="#" class="compare">Compare</a></td>');
 
                this.$el.find('tbody').append($row);
                var indicators = this.indicator.children;

                this.app.createBarChart(2015, item.index, indicators, $row.find('.chart-holder'), false, this.indicator.min, this.indicator.max, "0", this.indicator.user_friendly_max, 1);

                //$('#new_cdi table tbody').append('<tr id="' + data[i].c + '-info" class="info"><td></td><td colspan="5">Info</td></tr>');
                this.$el.find('tbody').append(infoView.$el);
                // Add charts row.
                //$('#new_cdi table tbody').append('<tr id="' + data[i].c + '-trend" class="trend"><td></td><td colspan="5">Trends</tf></tr>');
                this.$el.find('tbody').append(trendView.$el);
            }
        }
    },
    events: {
        'click a.show-info, a.show-trend': 'showCollapsed',
        'click a.compare': 'compare',
        'click input.compare-input': 'countrySelected',
	'click a.sorting':'sortColumn'
    },
    showCollapsed: function(event) {
        var $target = $(event.target);
        var countryCode = $target.data('c');
        var viewType = $target.hasClass('show-info') ? 'info' : 'trend';
        var view = this.collapsibleViews[countryCode][viewType];
        
	if($('.active-trend').length){
	   previousTrend = $('.active-trend');
	   if(countryCode != previousTrend.data('c')){
		var p_countryCode = previousTrend.data('c');
        	var p_viewType = previousTrend.hasClass('show-info') ? 'info' : 'trend';
       	 	var p_view = this.collapsibleViews[p_countryCode][p_viewType];
		previousTrend.toggleClass('active').toggleClass('active-trend');
		p_view.toggle();
	   }
	}
	
	$target.toggleClass('active').toggleClass('active-trend');
        view.toggle();
        event.preventDefault();
    },
    countrySelected: function(event) {
        var $target = $(event.target);
        var $selected = this.$el.find('input.compare-input:checked');

	if (!$target.is(':checked')) {
            $target.find('+ a.compare').hide();
        }

	if($selected.length==2){
           this.$el.find('input.compare-input').not('input.compare-input:checked').attr('disabled','true');
        } else {
           this.$el.find('input.compare-input').not('input.compare-input:checked').removeAttr('disabled');
        }
	
        if ($selected.length > 1 && $selected.length < 3) {
            this.$el.find('input.compare-input:checked + a.compare').show();
        } else {
            this.$el.find('input.compare-input + a.compare').hide();
        }
    },
    compare: function(event) {
        var $selected = this.$el.find('input.compare-input:checked');
        var selected = [];
        event.preventDefault();

        $selected.each(function(index, element) {
            selected.push($(element).val());
        });
        var url = '/cdi-2015/compare/' + selected.join('/');
        window.location = url;
    },
    show: function() {
        this.$el.show();
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
        this.items.unshift({
            code: 'CDI',
            label: 'Overall',
            active: true
        });
    }
});
cdiApp.mainNav.View = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        var items = this.model.items;
        var that = this;
        items.forEach(function(item) {
            that.$el.append('<li><a href="#' + item.code + '" data-indicator="' + item.code + '" class="' + item.code + '-bg ' + (item.active ? 'active' : '') + '">' + item.label + '</a></li>');
        });
    },
    events: {
        'click a': 'menuItemClicked'
    },
    menuItemClicked: function(event) {
        event.preventDefault();
	var st = jQuery(document).scrollTop();
        var $activeItem = this.$el.find('a.active');
        var activeIndicator = $activeItem.data('indicator');
        $activeItem.removeClass('active');
        var $target = $(event.target);
        $target.addClass('active');
        cgdCdi.hideIndicator(activeIndicator);
        cgdCdi.reload($target.data('indicator'));
	jQuery(document).scrollTop(st);
    }
});

/**
 * Info view.
 */
cdiApp.collapsibleView = Backbone.View.extend({
    loaded: false,
    toggle: function() {
        this.$el.fadeToggle();
        if (!this.loaded) {
            this.render();
        }
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
        if (!this.loaded) {
            that = this;
            this.loaded = true;
            $.get('/cdi-2015/overall/' + this.countryCode).done(function(data) {
                var content = '<td></td><td colspan="6">' + data + '</td>';
                that.$el.append(content);
            }).error(function() {
                that.$el.append('<td></td><td colspan="6">Data not available.</td>');
            });
        }
    }
});
cdiApp.trendView = cdiApp.collapsibleView.extend({
    initialize: function(args) {
        this.countryCode = args.countryCode;
        this.app = args.app;
    },
    render: function() {
        var $content = $('<td colspan="6"></td>');
        var that = this;
        this.loaded = true;
        this.$el.append($content);
        $content.before('<td></td>');
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
            //$content.append(lineChartView.$el);
        });
        $content.append('<div class="year-results"><a href="/cdi-2015/country/' + this.countryCode + '">This year\'s result</a></div>');
    }
});
