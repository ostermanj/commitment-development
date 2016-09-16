/**
 * Model and View for the Overall tab on the homepage.
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
                        id   	: i,
			min	: this.data.min,
			min_label: this.data.user_friendly_min,
			max	: this.data.max,
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
        $('#home-cdi').removeClass('home-processed');
	
        
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
                        '<td><div class="chart-holder"></div></td>');

                    this.$el.find('tbody').append($row);
                    this.app.createBarChart(2015, i, [this.indicator], $row.find('.chart-holder'), false, item.min, item.max, item.min_label, item.max_label, 2);

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
        'click tr.master-row': 'showComponents',
        'click a.compare': 'compare',
        'click input.compare-input': 'countrySelected',
	'click a.sorting':'sortColumn'
    },
    showComponents: function(event) {
        console.log(event);
        $target = $(event.currentTarget);
        $target.toggleClass('active');
        var countryCode = $target.attr('data-c');
        var view = this.collapsibleViews[countryCode]['components'];
    //    var $countryRow = this.$el.find('tr.' + countryCode + '-master');
        view.toggle();
        $target.toggleClass('active');
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
	console.log($selected.length);

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
