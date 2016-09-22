/**
 * Model and View for the Overall tab on the homepage.
 */
cdiApp.CDI = {};
cdiApp.CDI.Model = Backbone.Model.extend({
    initialize: function(args) {
        
        Backbone.pubSub.on('rankCountries', function(params){this.rankCountries(params);}, this); //subscribe to rankCountries trigger published in cdi_app.js
       
        this.indicator = args.indicator;
        this.countries = args.countries;
        this.app = args.app;
        this.rankCountries([]);
    },
    rankCountries: function(params){
        console.log(params)
    if (params[1]){
     this.isWeighted = params[1];
    } else {
        this.isWeighted = 0;
    }
        console.log(this.isWeighted);
    if (params[3] === 'mousemove' || params[3] === 'touchmovemove'){
        Backbone.pubSub.trigger('adjustCDI', [params[1], params[2], this.ranksObj, this.originalRanksObj, params[3]]);
        return;
    }
    //RANKING BEGINS       
	this.groupedValues = [];
       
	var rank = 1, correlative = 1, prev_value=0, tie_word = false, previous_rank=0, previous_object;

/*
*  pushing values from object to an array so that the order can be sorted by value
  the tool previously relied on the order of key-value pairs in an object, which cannot be
  guaranteed. the order of an array can be guaranteed
*/
    var sortable = []; 
    for (var country in this.indicator.values){
        var obj = {};
        obj.country = country;
        obj.value = this.indicator.values[country];
        sortable.push(obj);
    }
        sortable.sort(function(a,b){ 
        return b.value - a.value;
    });

//        for (var i in this.indicator.values) { REPLACE WITH ORDER OF COUNTRIES FROM SORTABLE ARRAY
        for (j = 0; j < sortable.length; j++){    
        i = sortable[j].country;

/*
NEW line below sets user_friendly_values to be rounded to one decimal. previously the 
rounding was happening in the import from the XML file, which was influencing later 
calculations on the overall scores
*/	

	this.indicator.user_friendly_values[i] = this.indicator.values[i].toFixed(1); 
	

	
            if (this.indicator.values.hasOwnProperty(i)) {
/* 
NEW line below compares each countries trimmed value to determine ties since those values
are now brought in untrimmed form the XML
*/            currentTrimmed = parseFloat(this.indicator.values[i].toFixed(1)); 
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
            console.log(params);
            console.log('triggering adjustCDI');
            Backbone.pubSub.trigger('adjustCDI', [params[1], params[2], this.ranksObj, this.originalRanksObj, params[3]]);
        } else {
           this.originalRanksObj = $.extend(true,{}, this.ranksObj);

        }
//        return this.groupedValues;
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
        
    },
    sortArray: function(sortAsc,field){ //this successfully reordered the array but it's in the wrong place: after the ranking's been done
       if (sortAsc == null) {
           console.log('null');
           sortAsc = true;
       } 
        console.log(this.sortAsc);
        console.log(sortAsc);
        console.log(field);
        var key = field === 'country' ? 'country' : 'value';
       console.log(key);
        return function(a,b){
            if(a[key]<b[key])
                 return sortAsc ? 1 : -1;
            if(a[key]>b[key])
                return sortAsc ? -1 : 1;
          return 0;
        };
           
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
/*NEW CODE*/   /* var oldScoreStr = '';
                var newScoreClass = '';
                var originalValueStr = '';
                if (this.model.indicator.values[item.index].toFixed(1) > this.model.indicator.previous.values[item.index].toFixed(1)){
                 // $row.addClass('better-than-previous');
                  oldScoreStr = '<span class="os os-worse">' + this.model.indicator.previous.values[item.index].toFixed(1) + '</span>';
                    newScoreClass = 'ns ns-better';
                }
                else if (this.model.indicator.values[item.index].toFixed(1) < this.model.indicator.previous.values[item.index].toFixed(1)){
                //  $row.addClass('worse-than-previous');
                    oldScoreStr = '<span class="os os-better">' + this.model.indicator.previous.values[item.index].toFixed(1) + '</span>';
                    newScoreClass = 'ns ns-worse';
                    }
                if (this.model.indicator.values[item.index].toFixed(1) > this.model.indicator.original.values[item.index].toFixed(1)){
                  $row.addClass('better');
                }
                else if (this.model.indicator.values[item.index].toFixed(1) < this.model.indicator.original.values[item.index].toFixed(1)){
                  $row.addClass('worse');
                    }
              
            
               
                if (parseInt(item.rank_label) < parseInt(originalRanks[item.country])){
                  $row.addClass('change-rank better-rank');                   
                }
                else if (parseInt(item.rank_label) > parseInt(originalRanks[item.country])){
                  $row.addClass('change-rank worse-rank');                   
                }
                
                
                if (isWeighted > 0){
                    if (parseInt(item.rank_label) !== parseInt(originalRanks[item.country])){ // if new rank is diff from original rank
                        
                        item.rank_label = item.rank_label + ' <span class="original-value original-rank">(' + parseInt(originalRanks[item.country]) + ')</span>';
                    }
                    if (parseFloat(item.value_label) !== parseFloat(this.model.indicator.original.values[item.index].toFixed(1))){ //if new score is diff from original score
                      //  item.value_label = item.value_label + ' <span class="original-value original-score">(' + this.model.indicator.original.values[item.index].toFixed(1) + ')</span>';
                    //    $diffIndicator.text('(' + this.model.indicator.original.values[item.index].toFixed(1) + ')')
                      //  $diffIndicator.addClass('original-value original-score');
                        originalValueStr = '<span class="original-value original-score">(' + this.model.indicator.original.values[item.index].toFixed(1) + ')</span>'
                    }
                }
                
             
/* END */               
                $row.html('<td><span class="new-value new-rank"></span> <span class="original-value original-rank">' + item.rank_label + '</span></td>' +
                    '<td><a class="expand-row" href="#" title="Expand row"><span class="country-label">' + item.country + '</span></a></td>' +
                    '<td><div><span class="new-value new-score">' + item.value_label + '</span> <span class="original-value original-score"></span></td>' +
                    '<td><div class="chart-holder"></div></td><td class="facebook-td"><a href="#"></a></td><td class="twitter-td"><a href="#"></a></td>');
 
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
        
      
      
/*        $('.master-row.better').addClass('better-processed');
        $('.master-row.worse').addClass('worse-processed');
      //  $('.master-row.better-than-previous').addClass('better-than-previous-processed');
    //    $('.master-row.worse-than-previous').addClass('worse-than-previous-processed');
        $('.master-row.worse-rank').addClass('worse-rank-processed');
        $('.master-row.better-rank').addClass('better-rank-processed');
        $('.original-value').addClass('original-value-processed');
        $('.os-worse').addClass('os-worse-processed');
        $('.os-better').addClass('os-better-processed');
        $('.ns').addClass('ns-processed');
        
        window.setTimeout(function(){
            $('.master-row').removeClass('better-than-previous-processed worse-than-previous-processed');
        }, 500);
       if (u === true){
           $(window).scrollTop(s);
       }*/
        if (this.model.isWeighted){
            Backbone.pubSub.trigger('adjustCDI', [1, 0, this.model.ranksObj, this.model.originalRanksObj, 'resorted']);
        }
        $('#home-cdi').addClass('home-processed');
        console.log('hello');
    },
    events: {
        'click tr.master-row, .load-trends, .close-info': 'showCollapsed',
        'click a.compare': 'compare',
        'click input.compare-input': 'countrySelected',
	'click a.sorting':'sortColumn'
    },
    showCollapsed: function(event) {
        event.preventDefault();
        
        var $target = $(event.currentTarget);
       
        
        var countryCode = $target.attr('data-c');
        var viewType = $target.attr('data-v');
        $target = $target.hasClass('close-info') ? $('#' + countryCode + '-master') : $target.hasClass('close-component') ? $('#home-cdi-indicator .' + countryCode + '-master') : $target;
        
        
        var view = this.collapsibleViews[countryCode][viewType];
        console.log($target);
        console.log(countryCode);
        console.log(viewType);
        console.log(view);
        

    
        var delay = 0;
      if ($target.hasClass('active')){
          console.log('already active');
          if (viewType === 'info'){
              var trendButton = $('#' + countryCode + '-info a.load-trends');
              if (trendButton.hasClass('active-trend')){
                  console.log('trends is open');
                  $targetInfo = $target;
                  $target = trendButton;
                  viewInfo = view;
                  view = this.collapsibleViews[countryCode]['trend'];
                  console.log(view);
                  $('#' + countryCode + '-trend .trends-wrapper').addClass('faster-collapse');
                  delay = 500;
                  this.collapseTrends($target,view,delay,countryCode);
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
    collapseTrends: function($target,view,delay,countryCode){
        $('#' + countryCode + '-trend .trends-wrapper').css('height', 0);
        this.showCollapsedHelper($target,view,delay,countryCode);
        
    },
    showCollapsedHelper: function($target,view,delay,countryCode){
         window.setTimeout(function(){
            
                $target.toggleClass('active').toggleClass('active-trend');
             
             console.log(view);
             console.log($target);
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

	if(this.sortAsc){
	   $target.removeClass('asc');
	} else {
	   $target.addClass('asc');
	}
	this.sortAsc = !this.sortAsc;

	//this.sortByField(field, asc);
        this.render(this.sortAsc, field);
        
    }
/*   ,
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
    } */
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
                sliderSelector = document.createElement('div');
                sliderSelector.className = 'slider-selector';
                sliderDiv.appendChild(sliderSelector);
                that.attachSelectorEvents(sliderSelector, j);
                
                weightToggle.appendChild(sliderDiv);
            } else {
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
        
        $(window).scroll(function(){
            el = document.getElementById('cdi-mainNav');
            var extra = $('body').width() > 720 ? 31 : 80;
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
    
   attachSliderEvents: function(el, j){
        var that = this;
        var i = j - 1;
        $(el).click(function(e){
            sliderSelector =  $('.slider-selector').eq(i);
            sliderSelector.addClass('active-selector jump-selector');
            sliderPosition = $(this).offset(); //page position object of the slider
            position = that.getXOffset(e); // page position x off the click / touch event in the slider
            newPosition = position - sliderPosition.left - 9;
            that.limitPosition();
            e.data = {};
            e.data.that = that;
            e.data.ev = e;
            e.data.i = i;
           console.log(e);
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
        sliderSelector = $('.slider-selector').eq(e.data.i);
        sliderSelector.css('left', newPosition);
        e.data.notch = newPosition / 13.6666 - 3;
        e.data.transition = 0;
    
        Backbone.pubSub.trigger('userInput', e);
    },
    
    limitPosition: function(){
         if (newPosition < 0){
            newPosition = 0;
        } else if (newPosition > 82){
            newPosition = 82;
        }  
    },
    selectorStop: function(e){
       if (e === 'resetWeight'){
           console.log(e);
           window.setTimeout(function(){ 
               console.log('triggering userInput');
                Backbone.pubSub.trigger('userInput', e); 
            }, 400);
           return;
       }
        delay = e.data.ev.currentTarget.className === 'slider' ? 500 : 0;
        window.setTimeout(function(){
            $('.slider-selector').removeClass('active-selector jump-selector');
        }, delay);
        roundedPosition = Math.round(newPosition / 13.6666) * 13.6666;
        console.log(roundedPosition);
        e.data.notch = Math.round(newPosition / 13.6666) - 3;
        var eTarget = e.data.ev.currentTarget;
        console.log(eTarget);
        if (e.data.notch !== 0){
            eParent = $(eTarget).parents('.weight-toggle');
            console.log(eParent);
            $(eParent).addClass('weighted');
            $('.reset-weight').css('display','inline');
            window.setTimeout(function(){
                $('#cdi-mainNav').addClass('weighted-component');
            },400);
        } else {
            eParent = $(eTarget).parents('.weight-toggle');
            $(eParent).removeClass('weighted');
            $('.reset-weight').css('display','inline');
            window.setTimeout(function(){
                $('#cdi-mainNav').removeClass('weighted-component');
            },400);
        }
        e.data.transition = 1;

        sliderSelector.css('left', roundedPosition);
        $('body').off('mouseup touchend', e.data.that.selectorStop);
        $('body').off('mousemove touchmove', e.data.that.selectorMove);
        window.setTimeout(function(){ // setTimeout to allow transitions to complete before redrawing the graph
            Backbone.pubSub.trigger('userInput', e); //publish event to global mechanism
        }, 400);
        
    },
    resetWeight: function(){
      console.log('resetWeight');
        $('.slider-selector').addClass('jump-selector');
         $('.slider-selector').css('left','41px');
        $('.weight-toggle').removeClass('weighted');
        $('#cdi-mainNav').removeClass('weighted-component');
        window.setTimeout(function()
            {$('.slider-selector').removeClass('jump-selector');
        }, 400);
        console.log(this);
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
        'click .reset-weight a': 'resetWeight' 
    },
    menuItemClicked: function(event) {
        event.preventDefault();
        var $activeItem = this.$el.find('div.active');
        $activeItem.removeClass('active');
        var activeIndicator = $activeItem.data('indicator');
        if (activeIndicator === 'CDI'){
            console.log('CDI');
            $('#indicator-description-wrapper').removeClass('idw-processed');
            $('#home-cdi').removeClass('home-processed');
            that = this;
            setTimeout(function(){
                that.menuItemClickedContinued(event, activeIndicator);
            }, 500);
        } else {
            console.log('Not CDI');
            this.menuItemClickedContinued(event, activeIndicator);
        }
    },
    menuItemClickedContinued: function(event, activeIndicator){
        that = this;
        
        var $target = $(event.target);
        console.log('original target');
        console.log($target)
        var nexted = false;
        if ($target.hasClass('next-button')){
            nexted = true;
            $target = $('div.' + $target.attr('data-indicator') + '-bg a.selectable');
        }
        $target.parent().parent().addClass('active');
        console.log($target.attr('data-indicator'));
        
        this.toggleSliders($target.attr('data-indicator'));
        if ($target.attr('data-indicator') === 'CDI'){
            console.log('Overall');
            $('#indicator-description-wrapper').removeClass('idw-processed');
            setTimeout(function(){
                $('.indicator-description, .indicator-explanation').empty();
                cgdCdi.hideIndicator(activeIndicator);
                cgdCdi.reload($target.attr('data-indicator'));
                console.log(cgdCdi.indicators);
                $('.next-button').text('Next up: ' + cgdCdi.indicators[cgdCdi.indicatorsOrder[0]]).attr('data-indicator','CDI_AID');
                 $('#indicator-description-wrapper').addClass('idw-processed home');
                
            }, 500);
        } else {
            var yPos = $(window).scrollTop();
          
            
            console.log(yPos);
          cgdCdi.hideIndicator(activeIndicator)
           $('#indicator-description-wrapper').removeClass('home');
            cgdCdi.reload($target.attr('data-indicator'));
        
            $(window).scrollTop(yPos);
            var labelIndex = cgdCdi.indicatorsOrder.indexOf($target.attr('data-indicator'));
            console.log($('.next-button'));
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

        var extra = $('body').width() > 720 ? 31 : 80;
        var scrollPoint = $('#section-header').height() + $('.cdi-header-wrapper').height() + extra;
        if (nexted) $('body').animate({scrollTop: scrollPoint}, 200);
    
    },
    toggleSliders: function(indicator){
        if (indicator !== 'CDI'){
            $('.slider').addClass('hide-slider');
            window.setTimeout(function(){
                $('.slider').css('display', 'none');
            }, 500);
        }
        else {
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
    toggle: function() {
       this.$el.fadeToggle(0);
    //    if (!this.loaded) {
            this.render();
    //   }
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
        if (!this.loaded) {
            
            this.loaded = true;
            
            $.get('/cdi-2015/overall/' + this.countryCode).done(function(data) {
                var content = '<td colspan="6" class="info-td"><div class="info-wrapper">' + data + '<a data-c="' + that.countryCode + '" data-v="info" class="close-info active" href="#">(X) Close</a></div></td>';
               
                that.$el.append(content);
                
                cHeight = $('#' + that.countryCode + '-info .field-name-field-overall').height() + $('#' + that.countryCode + '-info .year-results').height();
                $('#' + that.countryCode + '-info .year-results').before('<a class="load-trends" data-v="trend" data-c="' + that.countryCode + '" href="#">Show trends</a>');
                $('#' + that.countryCode + '-info .info-wrapper').css('height', cHeight);
                 //REWRITE HERE AND BELOW TO AVOID REPETITION
                $('#' + that.countryCode + '-info .year-results a').text('Go to country report').attr('target', '_blank');
                
                
            }).error(function() {
                that.$el.append('<td colspan="6" class="info-td"><div class="info-wrapper">Data not available.</div></td>');
            });
        } else {
            cHeight = $('#' + that.countryCode + '-info .field-name-field-overall').height() + $('#' + that.countryCode + '-info .year-results').height();
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
            console.log('first load');
             this.loaded = true;
            
             
            var $content = $('<div class="trends-inner-wrapper"></div>');
            var $contentWrapper = $('<div class="trends-wrapper"></div>');
             
           
            var $contentTd = $('<td colspan="6"></td>');
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
                //$content.append(lineChartView.$el);
            });
             var $buttonWrapper = $('<div style="clear:left">');
             $buttonWrapper.append('<div class="year-results"><a target="_blank" href="/cdi-2015/country/' + this.countryCode + '">Go to country report</a></div>');
            $content.append($buttonWrapper);
            var tHeight = $('#' + this.countryCode + '-trend .trends-inner-wrapper').height();
            $('#' + this.countryCode + '-trend .trends-wrapper').css('height', tHeight);
            
        } else {
           
            var tHeight = $('#' + this.countryCode + '-trend .trends-inner-wrapper').height(); //CAN REWRITE HERE TO AVOID REPETITION
            $('#' + this.countryCode + '-trend .trends-wrapper').css('height', tHeight);
            
           
           
                        
        }
        
       // $('#' + this.countryCode + '-info .load-trends').text('Hide trends');
    }
});
