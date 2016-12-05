/**
 * Model and View for the Overall tab on the homepage.
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

                this.app.createBarChart(2015, item.index, indicators, $row.find('.chart-holder'), false, this.indicator.min, this.indicator.max, "0", this.indicator.user_friendly_max, 1);
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
        'click a.compare': 'compare',
        'click input.compare-input': 'countrySelected',
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
        var addHeight = window.innerWidth <= 410 ? 42 : 81;
        if (!this.loaded) {
            
            this.loaded = true;
            
            $.get('/cdi-2015/overall/' + this.countryCode, function(data,status) {
                var content = '<td colspan="7" class="info-td"><div class="info-wrapper">' + data + '<a data-c="' + that.countryCode + '" data-v="info" class="close-info active" href="#">(X) Close</a></div></td>';
               
                that.$el.append(content);
                
                cHeight = $('#' + that.countryCode + '-info .field-name-field-overall').height() + $('#' + that.countryCode + '-info .year-results').height() + addHeight;
                $('#' + that.countryCode + '-info .year-results').before('<a class="load-trends" data-v="trend" data-c="' + that.countryCode + '" href="#">Show trends</a>');
                $('#' + that.countryCode + '-info .info-wrapper').css('height', cHeight);
                 //REWRITE HERE AND BELOW TO AVOID REPETITION
                $('#' + that.countryCode + '-info .year-results a').text('Country report').attr('target', '_blank');
                
                
            }, 'html').error(function() {
                that.$el.append('<td colspan="7" class="info-td"><div class="info-wrapper">Data not available: ' + status + '</div></td>');
            });
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
             $buttonWrapper.append('<div class="year-results hello"><a target="_blank" href="/cdi-2015/country/' + this.countryCode + '">Country report</a></div>');
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
