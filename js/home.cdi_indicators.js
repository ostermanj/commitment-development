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
        'click tr.master-row, .close-components': 'showComponents',
        'click a.compare': 'compare',
        'click input.compare-input': 'countrySelected',
	    'click a.sorting':'sortColumn',
        'click .facebook-td a': 'facebookShare',
        'click .twitter-td a': 'twitterShare'
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
            view.toggle();            
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
