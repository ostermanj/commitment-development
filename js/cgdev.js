Array.prototype.sortOn = function (propertyNames, options ) {
   return this.sort(this.getSortFunc(propertyNames, options));
};

Array.prototype.getSortFunc = function(propertyNames, options) {
   var func;
   if(propertyNames instanceof Array) {
      func = function ( objectA, objectB ) {
         var propName, propNames = this.propertyNames;
         var valA, valB;
         for(var i = 0, l = propertyNames.length; i < l; ++i) {
            propName = propertyNames[i];
            valA = objectA[propName];
            valB = objectB[propName];
            if(valA === valB) {
               continue;
            }
            return valA < valB ? -1 : 1;
         }
         return 0;
      };
   } else {
      func = function ( objectA, objectB ) {
         var valA = objectA[propertyNames], valB = objectB[propertyNames];
         return valA === valB ? 0 : (valA < valB ? -1 : 1);
      };
   }
   return func;
};

function PointerEventsPolyFill ( ) {

   $(document).ready(init);

   _hiddenElements = [];
   _above = null;

   function init ( ) {
      if('ontouchstart' in window)
         $.fx.speeds = { _default: 0, fast: 0, slow: 0 };

      var isSupported = PointerEventsPolyFill.isSupported();
      if(!isSupported) {
         addListeners();
      }
   }

   function addListeners ( ) {
      var events = [ 'click', 'mousemove' ];
      for(var i = 0, l = events.length; i < l; ++i) {
         $(document).bind(events[i], onMouseEvent);
      }
   }

   function getTopInteractiveElement ( x, y ) {
      var element = document.elementFromPoint(x,y);
      if(!element || $(element).css('pointer-events') !== 'none') {
         return element;
      }
      $(element).css('visibility', 'hidden');
      _hiddenElements.push(element);
      return getTopInteractiveElement(x, y);
   }

   function showHiddenElements ( ) {
      for(var i = 0, l = _hiddenElements.length; i < l; ++i) {
         $(_hiddenElements[i]).css('visibility', 'visible');
      }
      _hiddenElements.length = 0;
   }

   function cloneEvent ( evt, type ) {
      if(type === undefined) {
         type = evt.type;
      }
      var clonedEvt = document.createEvent("MouseEvents");
      clonedEvt.initMouseEvent(type, evt.bubbles, evt.cancelable, evt.view, evt.detail, evt.screenX, evt.screenY, evt.clientX, evt.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, evt.button, evt.target);
      return clonedEvt;
   }

   function clearAbove ( evt ) {
      if(_above) {
         _above.dispatchEvent(cloneEvent(evt, 'mouseleave'));
         _above.dispatchEvent(cloneEvent(evt, 'mouseout'));
      }
      _above = null;
   }

   function onMouseEvent ( evt ) {
      if($(evt.target).css('pointer-events') !== 'none') {
         if(evt.target !== _above) {
            if(_above && !$.contains(_above, evt.target)) {
               clearAbove(evt);
            }
            $('body').css('cursor', 'auto');
         }
         return;
      }

      var element = getTopInteractiveElement(evt.clientX, evt.clientY);
      var isDifferent = _above !== element;
      if(evt.type === 'mousemove') {
         if(isDifferent && _above) {
            clearAbove(evt);
         }
         if(element) {
            if(isDifferent) {
               element.dispatchEvent(cloneEvent(evt, 'mouseenter'));
               element.dispatchEvent(cloneEvent(evt, 'mouseover'));
            }
            element.dispatchEvent(cloneEvent(evt));
         }
         _above = element;
         $('body').css('cursor', element && $(element).css('cursor') === 'pointer' ? 'pointer' : 'auto');
      } else {
         if(element) {
            element.dispatchEvent(cloneEvent(evt));
         }
      }

      showHiddenElements();
   }
}
PointerEventsPolyFill.isSupported = function ( ) {
   return (function(){var b=document.createElement("x"),c=document.documentElement,d=window.getComputedStyle,a;if(!("pointerEvents" in b.style)){return false;}b.style.pointerEvents="auto";b.style.pointerEvents="x";c.appendChild(b);a=d&&d(b,"").pointerEvents==="auto";c.removeChild(b);return !!a;})();
};

var polyFill = new PointerEventsPolyFill();

InvalidationManager = function ( ) {
   this._queue = [];
   this._byIndex = {};
   this._timeoutId = -1;

   var that = this;

   function clearQueue ( ) {
      var index, func;
      while(that._queue.length) {
         index = that._queue.shift();
         func = that._byIndex[index];
         func();
         delete that._byIndex[index];
      }
      that._timeoutId = -1;
   }

   InvalidationManager.prototype.invalidate = function (func, index ){
      if(index === undefined) {
         index = func;
      }
      if(this._byIndex[index] === undefined) {
         this._queue.push(index);
         this._byIndex[index] = func;
         if(this._timeoutId == -1) {
            this._timeoutId = setTimeout(clearQueue, 0);
         }
      }
   };
};



var invalidationManager = new InvalidationManager();
_.mixin(
   { 'once': function ( func, index ) {
         invalidationManager.invalidate(func, index);
      }
   }
);

function setLabelOf ( element ) {
   var label = element.data('label');
   var lang = window.App.state.get('language');
   var val = label ? label.getValue(lang) : '';
   var button = element.find('.info-button');
   element.html(val);
   element.append(button);
}

function registerLabel ( element, label ) {
   if(label) {
      element.data('label', label);
      element.attr('haslabel','');
   } else {
      element.removeData('label');
      element.removeAttr('haslabel');
   }
   setLabelOf(element);
}

function formatNumber ( value, decimalPlaces, force ) {
   if(isNaN(value)) {
      return '';
   }
   var mult = Math.pow(10, decimalPlaces);
   var val = Math.round(value * mult) / mult;
   var valStr = val.toString();
   var indexOfDot = valStr.indexOf('.');
   if(decimalPlaces && indexOfDot === -1) {
      valStr += '.';
      indexOfDot = valStr.length-1;
   }
   var trailingZerosToAdd = indexOfDot + decimalPlaces + 1 - valStr.length;
   while(trailingZerosToAdd > 0) {
      valStr += '0';
      trailingZerosToAdd--;
   }

   if(!force && valStr.substr(valStr.length - 2, 2) == ".0")
      valStr = valStr.substr(0, valStr.length - 2);
   return valStr;
}

var ColorUtil = {
   fromHexToRGB: function ( color ) {
      var r, g, b;
      r = parseInt((color >> 16) & 0xFF, 10);
      g = parseInt((color >> 8) & 0xFF, 10);
      b = parseInt(color & 0xFF, 10);
      return { r: r, g: g, b: b };
   },
   fromHexStringToHex: function ( color ) {
      if(color.indexOf('#') === 0) {
         color = color.substr(1);
      }
      return parseInt('0x' + color, 16);
   },
   fromRGBToHexString: function ( r, g, b ) {
      r = r.toString(16);
      g = g.toString(16);
      b = b.toString(16);
      return (r.length < 2 ? '0' + r : r) + (g.length < 2 ? '0' + g : g) + (b.length < 2 ? '0' + b : b);
   },
   fromRGBToHex: function ( r, g, b ) {
      var color = r << 16 | g << 8 | b;
      return color;
   },
   fromRGBToHSL: function ( r, g, b ) {
      // from http://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if(max == min){
         h = s = 0; // achromatic
      } else {
         var d = max - min;
         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
         switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
         }
         h /= 6;
      }
      return { h: h, s: s, l: l };
   },
   fromHSLToRGB: function ( h, s, l ) {
      // from http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
      var r, g, b;

      function hue2rgb(p, q, t) {
         if(t < 0) t += 1;
         if(t > 1) t -= 1;
         if(t < 1/6) return p + (q - p) * 6 * t;
         if(t < 1/2) return q;
         if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
         return p;
      }

      if(s === 0) {
         r = g = b = l; // achromatic
      } else {
         var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
         var p = 2 * l - q;
         r = hue2rgb(p, q, h + 1/3);
         g = hue2rgb(p, q, h);
         b = hue2rgb(p, q, h - 1/3);
      }

      r = Math.round(r * 255);
      g = Math.round(g * 255);
      b = Math.round(b * 255);
      return { r: r, g: g, b: b };
   }
};

var State = Backbone.Model.extend({
   defaults: {
      language: 'en',
      initialized: 'false'
   },
   _bindingsByStateID: {},
   bindChange: function ( stateID, listener ) {
      if(listener === undefined) {
         throw new Error('bindChange: listener cannot be null');
      }
      this._getListeners(stateID, 'change').push(listener);
   },
   unbindChange: function ( stateID, listener ) {
      var listeners = this._getListeners(stateID, 'change');
      var index = _.indexOf(listeners, listener);
      if(index != -1) {
         listeners.splice(index, 1);
      }
   },
   _getListeners: function ( stateID, event ) {
      var bindings = this._bindingsByStateID[stateID];
      if(!bindings) {
         bindings = this._bindingsByStateID[stateID] = {};
      }
      var listeners = bindings[event];
      if(!listeners) {
         listeners = bindings[event] = [];
      }
      return listeners;
   },
   set: function ( name, value ) {
      var oldValue = this.get(name);

      if(value === oldValue) {
         Backbone.Model.prototype.set.call(this, name, value);
         return;
      }

      var listeners = this._getListeners(name, 'change');
      var copy = listeners.concat(), listener;
      Backbone.Model.prototype.set.call(this, name, value);
      for(var i = 0, l = copy.length; i < l; ++i) {
         listener = copy[i];
         if(_.indexOf(listeners, listener) != -1) {
            listener(oldValue, value);
         }
      }
   }
});

function getState ( stateID ) {
   return window.App.state.get(stateID);
}

function setState ( stateID, value ) {
   window.App.state.set(stateID, value);
}

function bindState ( stateID, event, listener ) {
   if(event == 'change') {
      window.App.state.bindChange(stateID, listener);
   } else {
      window.App.state.on(stateID + ':' + event, listener);
   }
}

function unbindState ( stateID, event, listener ) {
   if(event == 'change') {
      window.App.state.unbindChange(stateID, listener);
   } else {
      window.App.state.off(stateID + ':' + event, listener);
   }
}

var CGDev = Backbone.Model.extend({
   initialize: function ( ) {
      $('.app').hide();
      this.state = new State();
      this.parser = new CGDevDataParser();
   },
   load: function ( url) {
      $.get(url, null, onLoadComplete, "xml");
      var that = this;
      function onLoadComplete ( data ) {
         that.parseData(data);
         that.buildUI();
         that.initApp();

         $('.app').show();
         $('.loading').remove();

         amplify.subscribe('mapready', function() {
            var cid = that.getParameterByName("country");
            if(cid != "")
            {
               var geoItem = window.App.get('countryList').getGeoItemByCode(cid);
               setState("data-geoitem", geoItem);
            }
         });

         var indic = that.getParameterByName("component");
         if(indic != "")
         {
            var indicator = window.App.get('indicatorFlatList').getIndicatorByCode(indic);
            setState('indicator', indicator);
            setState("data-indicator", indicator);
         }
      }

      function onLoadError ( ) {
         console.log('error');
      }
   },

   getParameterByName: function (name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
         return "";
      else
         return decodeURIComponent(results[1].replace(/\+/g, " "));
   },

   parseData: function ( data ) {
      var parser = this.parser;
      parser.parse(data);
      var that = this;
      this.set('languages', parser.getLanguages());
      this.set('labelList', parser.getLabelList());
      this.set('indicatorFlatList', parser.getIndicatorFlatList());
      this.set('indicatorHierarchy', parser.getIndicatorHierarchy());
      this.set('countryList', parser.getCountryList());
      this.set('regionList', parser.getRegionList());
      this.set('mapData', parser.getMapData());
   },
   buildUI: function ( ) {

   },
   initApp: function ( ) {
      var hierarchy = this.get('indicatorHierarchy');
      var topLevel = hierarchy[0];
      var overall = topLevel.at(0);
      var parser = this.parser;
      bindState('data-indicator', 'change', function ( oldIndicator, newIndicator ) {
         var level = parseFloat(newIndicator.get('level'));
         if(level == 1) {
            setState('view', 'map');
         }

         if(typeof(switchContent) === 'function') {
            if(newIndicator.get('code') != 'CDI')
            {
               if(newIndicator.get('code').substr(0, 3) == 'CDI')
                  switchContent("component/" + newIndicator.get('code'), newIndicator.label.getValue(getState('language')), getState('language'));
            }
            else if(oldIndicator) {
               var geoItem = getState('data-geoitem');
               if(geoItem)
                  switchContent("country/" + geoItem.get('code'), geoItem.label.getValue(getState('language')), getState('language'));
            }
         }
      });

      bindState('highlighted-country', 'change', function ( oldCountry, newCountry ){
         if(newCountry) {
            if('ontouchstart' in window && typeof(switchContent) === 'function') {
               switchContent("country/" + newCountry.get('code'), newCountry.label.getValue(getState('language')), getState('language'));
            }

            setState('data-geoitem', newCountry);
         } else {
            setState('data-geoitem', getState('selected-country'));
         }
      });

      bindState('selected-country', 'change', function ( oldCountry, newCountry ) {
         if(!getState('highlighted-country')) {
            setState('data-geoitem', newCountry);
         }

         if(!('ontouchstart' in window) && newCountry && typeof(switchContent) === 'function') {
            switchContent("country/" + newCountry.get('code'), newCountry.label.getValue(getState('language')), getState('language'));
         }
      });

      bindState('view', 'change', function ( oldView, newView ) {
         if(newView == 'map') {
            setState('data-indicator', getState('indicator'));
         }
      });

      setState('indicator', overall);
      setState('data-indicator', overall);
      setState('initialized', true);
      setState('geo-chart-sort', 'value');
      setState('show-trends', false);
      setState('view', 'map');
      setState('show-help', false);
      setState('show-eu', false);
      setState('isIpad', navigator.userAgent.match(/iPad/i) != null);

      var regionList = this.get('regionList');
      var region = regionList.at(0);
      setState('selected-region', region);

      var tabView = new TabView({ el: '.tab-view' });
      var showEUButton = new ShowEUButton( { el: '.show-eu-button'});
      var clearButton = new ClearIndicatorButton( { el: '.clear-indicator-button'});
      var showTrendsButton = new ShowTrendsButton( { el: '.show-trends-button' } );
      var langMenu = new LanguageMenu( { el: '.language-menu ' } );
      var regionMenu = new RegionMenu( { el: '.region-menu' } );

      //var mapView = new MapView( { el: '.map-view'} );
      var geoChartView = new GeoChartView( { el: '.geo-chart-view' } );
      var subjectHighlightView = new SubjectHighlightView( { el: '.subject-highlight-view' } );
      var subjectChartView = new SubjectChartView( { el: '.subject-chart-view' } );
      var detailView = new ComponentDetailView( { el: '.component-detail-view' });

      var helpButton = new HelpButton( { el: '.show-help-button' });
      var helpView = new HelpView( { el: '.help-view' });

      $('#sort-geochart-button').change(function ( ) {
         var isName = getState('geo-chart-sort') === 'name';
         setState('geo-chart-sort', isName ? 'value' : 'name');
      });
      $('.sort-geochart-button').click(function() { });

      var labelList = this.get('labelList');
      var labelElementList = $('[label-id]');
      var el, label;
      for(var i = 0, l = labelElementList.length; i < l; ++i) {
         el = labelElementList.eq(i);
         label = labelList.getLabelByCode(el.attr('label-id'));
         registerLabel(el, label);
      }

      var lang = window.App.state.get('language');
      var movieButton = new MovieButton( { el: '.play-movie-button' } );
      movieButton._url = labelList.getLabelByCode('help_link').getValue(lang);
      $('.show-help-button').prop('title', labelList.getLabelByCode('info_hover').getValue(lang));
      $('.play-movie-button-label').html(labelList.getLabelByCode('movie_hover').getValue(lang));

      this.applyLanguage();
      bindState('language', 'change', $.proxy(this.applyLanguage, this));

      $('.map-component').focus();

      this.replaceFormElements();
   },
   applyLanguage: function ( ) {
      var labelElementList = $('[haslabel]');
      var lang = getState('language');
      var el, label;
      for(var i = 0, l = labelElementList.length; i < l; ++i) {
         el = labelElementList.eq(i);
         setLabelOf(el);
      }
   },
   replaceFormElements: function ( ) {
   }
});

window.App = new CGDev();

function CGDevDataParser ( ) {

   var _xml;
   var _languages;
   var _labelList;
   var _indicatorFlatList;
   var _indicatorHierarchy;
   var _countryList;
   var _regionList;
   var _mapData;
   var _minYear = Number.MAX_VALUE;
   var _maxYear = -Number.MAX_VALUE;
   var that = this;
   var _json;

   this.parse = function ( data ) {
      _xml = $(data).children();
      _json = $.xml2json(data);
      var t = new Date().getTime();
      parseLanguages();
      parseLabels();
      parseIndicators();
      parseGeoItems();
   };

   this.getData = function() {
      return _json;
   };

   this.getLanguages = function ( ) {
      return _languages;
   };

   this.getLabelList = function ( ) {
      return _labelList;
   };

   this.getIndicatorFlatList = function ( ) {
      return _indicatorFlatList;
   };

   this.getIndicatorHierarchy = function ( ) {
      return _indicatorHierarchy;
   };

   this.getCountryList = function ( ) {
      return _countryList;
   };

   this.getRegionList = function ( ) {
      return _regionList;
   };

   this.getMapData = function ( ) {
      return _mapData;
   };

   this.parseIndicatorData = function ( indicator ) {
      var indCode = indicator.get('code');
      var valueNodes = _xml.children('vs[i="'+indCode+'"]');
      var allSeries = [], timeseries = [];
      var j, m, valNode, childNodes, node, score, value, weighted;
      var time, regionCode;
      var byRegion = {}, byCountry, valueObject;
      var minVal = Number.MAX_VALUE, maxVal = -Number.MAX_VALUE;
      for(var i = 0, l = valueNodes.length; i < l; ++i) {
         valNode = valueNodes.eq(i);
         childNodes = valNode.children();
         time = new Date(Number(valNode.attr('y')), 0, 1).getTime();
         regionCode = valNode.attr('r');
         if(!(byCountry = byRegion[regionCode])) {
            byCountry = byRegion[regionCode] = {};
         }
         for(j = 0, m = childNodes.length; j < m; ++j) {
            node = childNodes.eq(j);
            timeseries = byCountry[node.attr('c')];
            if(!timeseries) {
               timeseries = new Timeseries();
               timeseries.country = node.attr('c');
               timeseries.region = regionCode;
               byCountry[timeseries.country] = timeseries;
               allSeries.push(timeseries);
            }
            score = Number(node.attr('score'));
            value = node.attr('value');
            if(value === undefined || value === '') {
               value = NaN;
            } else {
               value = Number(value);
            }
            weighted = node.attr('weighted');
            if(weighted === undefined || weighted === '') {
               weighted = NaN;
            } else {
               weighted = Number(weighted);
            }
            valueObject = new ValueObject( { time: time, value: value, score: score, weighted: weighted, indicator: indCode });
            timeseries.add(valueObject);

            var y = new Date(time).getFullYear();
            _minYear = Math.min(y, _minYear);
            _maxYear = Math.max(y, _maxYear);
         }
      }
      for(i = 0, l = allSeries.length; i < l; ++i) {
         allSeries[i].invalidate();
         indicator.addTimeseries(allSeries[i]);
      }
      // range is always 0-10, even if it means cutoffs
      indicator.legend.set('min', 0);
      indicator.legend.set('max', 10);
      indicator.set('loaded', true);

      setState('min-year', _minYear);
      setState('max-year', _maxYear);
   };

   function parseLanguages ( ) {
      var langNodes = _xml.children('language');
      var languages = [];
      for(var i = 0, l = langNodes.length; i < l; ++i) {
         languages.push(langNodes.eq(i).text().toLowerCase());
      }
      _languages = languages;
   }

   function parseLabels ( ) {
      var labelNodes = _xml.children('label');
      var labelsByCode = {};
      var label, code, val, lang;
      var labelList = new LabelList();
      for(var i = 0, l = labelNodes.length; i < l; ++i) {
         node = labelNodes.eq(i);
         code = node.attr('code').toLowerCase();
         val = node.text();
         lang = node.attr('lang');
         label = labelList.getLabelByCode(code);
         if(!label) {
            label = new Label( { code: code } );
            labelList.add(label);
         }
         label.setValue(lang, val);
      }
      _labelList = labelList;
   }

   function parseIndicators ( ) {
      var nodes = _xml.children('hierarchy').children();
      var flatList = new IndicatorList();
      var hierarchy = [];
      var colors;
      hierarchy = parseHierarchy(nodes);
      function parseHierarchy ( nodes, parent ) {
         var node, indicator, hNode;
         var list = new IndicatorList();
         hierarchy.push(list);
         colors = [ "#cd8162", "#8b5742", "#cdc9a5", "#8b8970", "#9ac0cd", "#68838b", "#b4cdcd", "#7a8b8b", "#cdc1c5", "#8b8386" ];
         for(var i = 0, l = nodes.length; i < l; ++i) {
            node = nodes.eq(i);
            indicator = parseIndicator(node);
            if(indicator.get('level') == 3) {
               indicator.set('color', colors[i]);
            } else if(indicator.get('level') > 3) {
               indicator.set('color', parent.get('color'));
            }
            list.add(indicator);
            flatList.add(indicator);
            if(parent) {
               parent.childrenList.add(indicator);
            }
            hNode = node.children('hierarchy').children();
            if(hNode.length) {
               parseHierarchy(hNode, indicator);
            }
         }
         _indicatorFlatList = flatList;
         _indicatorHierarchy = hierarchy;
      }

      function parseIndicator ( node ) {
         var code = node.attr('code');
         var level = parseFloat(node.attr('level'));
         var color;
         if(level <= 2) {
            color = '#' + node.children('color').first().text();
         } else {
            color = '#333333';
         }
         var dec = node.children('decimalplaces').first().text();
         var sortorder = node.children('sortorder').first().text().toLowerCase() || 'default';
         var indicator = new Indicator( { code: code, level: level, decimalplaces: dec, color: color, sortorder: sortorder });
         indicator.label = parseLabel(node.children('label'));
         indicator.shortlabel = parseLabel(node.children('shortlabel'));
         if(!indicator.shortlabel.values['en'])
            indicator.shortlabel = indicator.label;
         indicator.desc = parseLabel(node.children('description'));
         indicator.explanation = parseLabel(node.children('explanation'));
         indicator.unit = parseLabel(node.children('unit'));
         indicator.legend.set('color', ColorUtil.fromHexStringToHex(color));
         indicator.parse = function ( ) {
            that.parseIndicatorData(indicator);
         };
         return indicator;
      }

      function parseLabel ( nodes ) {
         var code = nodes.attr('code');
         var label = new Label( { code: code });
         var vals = {};
         var node;
         for(var i = 0, l = nodes.length; i < l; ++i) {
            node = nodes.eq(i);
            label.setValue(node.attr('lang'), node.text());
         }
         return label;
      }
   }

   function parseGeoItems ( ) {
      var countryNodes = _xml.children('country');
      var node, code, geoItem;
      var countryList = new GeoItemList();
      for(var i = 0, l = countryNodes.length; i < l; ++i) {
         node = countryNodes.eq(i);
         code = node.attr('code');
         geoItem = countryList.getGeoItemByCode(code);
         if(!geoItem) {
            geoItem = new GeoItem( { code: code } );
            countryList.add(geoItem);
         }
         geoItem.label.setValue(node.attr('lang'), node.text());
      }
      _countryList = countryList;

      var regionList = new GeoItemList();
      var regionNodes = _xml.children('region');
      for(i = 0, l = regionNodes.length; i < l; ++i) {
         node = regionNodes.eq(i);
         code = node.attr('code');
         geoItem = regionList.getGeoItemByCode(code);
         if(!geoItem) {
            geoItem = new GeoItem( { code: code, type: GeoType.REGION });
            regionList.add(geoItem);
         }
         geoItem.label.setValue(node.attr('lang'), node.text());
      }
      _regionList = regionList;
   }

   function parseMapData ( ) {

   }

}

var Label = Backbone.Model.extend({
   initialize: function ( ) {
      this.values = {};
   },
   getValue: function ( lang ) {
      return this.values[lang.toLowerCase()];
   },
   setValue: function ( lang, value) {
      this.values[lang.toLowerCase()] = value;
   }
});

var LabelList = Backbone.Collection.extend( {
   model: Label,
   initialize: function ( ) {
      this._labelsByCode = {};
   },
   add: function ( label ) {
      this._labelsByCode[label.get('code')] = label;
      Backbone.Collection.prototype.add.call(this, label);
   },
   remove: function ( label ) {
      Backbone.Collection.prototype.remove.call(this, label);
      delete this._labelsByCode[label.get('code')];
   },
   getLabelByCode: function ( code ) {
      return this._labelsByCode[code.toLowerCase()];
   }
});

var LabelView = Backbone.View.extend( {
   render: function ( ) {
      this.$el.html(this.model.getValue(_lang));
   }
});

var Legend = Backbone.Model.extend( {
   defaults: {
   },
   initialize: function ( ) {
      this._minMult = 0.15;
      this._maxMult = 0.85;
   },
   getColor: function ( value ) {
      var min = this.get('min');
      var max = this.get('max');
      var p = (value-min)/(max-min);
      p = 1 - Math.min(1, Math.max(0, p));
      var lightness = (p * (this._maxMult - this._minMult) + this._minMult) * (1 - this._hsl.l) + this._hsl.l;
      return ColorUtil.fromHSLToRGB(this._hsl.h, this._hsl.s, lightness);
   },
   set: function ( key, value ) {
      Backbone.Model.prototype.set.apply(this, arguments);
      if(key == 'color') {
         this.cacheRGB();
      }
   },
   cacheRGB: function ( ) {
      var color = this.get('color');
      this._rgb = ColorUtil.fromHexToRGB(color);
      this._hsl = ColorUtil.fromRGBToHSL(this._rgb.r, this._rgb.g, this._rgb.b);
   }
});

var Indicator = Backbone.Model.extend({
   defaults: {
      code: null,
      level: Number.MAX_VALUE,
      unit: null,
      numberFormat: null,
      color: 0x000000,
      loaded: false
   },
   initialize: function ( ) {
      this._byRegion = {};
      this.childrenList = new IndicatorList();
      this.labelList = new LabelList();
      this.legend = new Legend();
      this.minVal = this.maxVal = NaN;
   },
   addTimeseries: function ( timeseries ) {
      byCountry = this._byRegion[timeseries.region];
      if(!byCountry) {
         byCountry = this._byRegion[timeseries.region] = {};
      }
      byCountry[timeseries.country] = timeseries;
   },
   getTimeseries: function ( region, country ) {
      if(!this.get('loaded')) {
         this.parse();
      }
      return this._byRegion[region] ? this._byRegion[region][country] : null;
   },
   getMinVal: function ( ) {
      if(!this.get('loaded')) {
         this.parse();
      }
      return this.minVal;
   },
   getMaxVal: function ( ) {
      if(!this.get('loaded')) {
         this.parse();
      }
      return this.maxVal;
   }
});

var IndicatorList = Backbone.Collection.extend({
   model: Indicator,
   initialize: function ( ) {
      this._indicatorsById = {};
      this._indicatorsByCode = {};
      this.label = new Label();
   },
   getIndicatorByID: function ( id ) {
      return this._indicatorsById[id];
   },
   getIndicatorByCode: function ( code ) {
      return this._indicatorsByCode[code];
   },
   add: function ( indicator ) {
      this._indicatorsByCode[indicator.get('code')] = indicator;
      this._indicatorsById[indicator.get('id')] = indicator;
      Backbone.Collection.prototype.add.call(this, indicator);
   },
   remove: function ( indicator ) {
      Backbone.Collection.prototype.remove.call(this, indicator);
      delete this._indicatorsByCode[indicator.get('code')];
      delete this._indicatorsById[indicator.get('id')];
   }
});

function ValueObject ( properties ) {
   this.time = NaN,
   this.value = NaN,
   this.label = '';
   this.uid = _.uniqueId('vo_');
   if(properties !== undefined) {
      for(var id in properties) {
         this[id] = properties[id];
      }
   }
}

ValueObject.prototype.toString = function ( ) {
   return this.uid;
};

function Timeseries ( ) {
   this.values = [];
   this.valuesByTime = {};
   this.minValue = this.maxValue = NaN;
   this.startDate = this.endDate = NaN;
}

Timeseries.prototype.add = function ( valueObject ) {
   this.values.push(valueObject);
   this.valuesByTime[valueObject.time] = valueObject;
};

Timeseries.prototype.clear = function ( valueObject ) {
   this.values.length = 0;
   this.valuesByTime = {};
   this.minValue = this.maxValue = NaN;
   this.startDate = this.endDate = NaN;
};

Timeseries.prototype.getValue = function ( time ) {
   return this.valuesByTime[time];
};

Timeseries.prototype.invalidate = function ( ) {
   this.values.sortOn('time', Array.NUMERIC);
   var minVal = Number.MAX_VALUE, maxVal = -Number.MAX_VALUE;
   var val;
   for(var i = 0, l = this.values.length; i < l; ++i) {
      val = this.values[i];
      if(!isNaN(val)) {
         minVal = Math.min(minVal, val);
         maxVal = Math.max(maxVal, val);
      }
   }
   this.minVal = minVal !== Number.MAX_VALUE ? minVal : NaN;
   this.maxVal = maxVal !== -Number.MAX_VALUE ? maxVal : NaN;
   if(this.values.length) {
      this.startDate = this.values[0].time;
      this.endDate = this.values[this.values.length-1].time;
   } else {
      this.startDate = this.endDate = NaN;
   }
};

var GeoType = { COUNTRY: 'country', REGION: 'region' };

var GeoItem = Backbone.Model.extend( {
   defaults: {
      code: null,
      type: GeoType.COUNTRY
   },
   initialize: function ( ) {
      this.label = new Label();
   }
});

var GeoItemList = Backbone.Collection.extend( {
   model: GeoItem,
   initialize: function ( ) {
      this._geoItemsByCode = {};
      this._geoItemsById = {};
   },
   getGeoItemByID: function ( id ) {
      return this._geoItemsById[id];
   },
   getGeoItemByCode: function ( code ) {
      return this._geoItemsByCode[code];
   },
   add: function ( geoItem ) {
      this._geoItemsById[geoItem.get('id')] = geoItem;
      this._geoItemsByCode[geoItem.get('code')] = geoItem;
      Backbone.Collection.prototype.add.call(this, geoItem);
   },
   remove: function ( geoItem ) {
      Backbone.Collection.prototype.remove.call(this, geoItem);
      delete this._geoItemsByCode[geoItem.get('code')];
      delete this._geoItemsById[geoItem.get('id')];
   }
});

var TabView = Backbone.View.extend({
   initialize: function ( ) {
      this.render();
      bindState('indicator', 'change', $.proxy(this.onIndicatorChange, this));
      this.applyIndicator();
   },
   onIndicatorChange: function ( oldIndicator, newIndicator ) {
      this.applyIndicator(oldIndicator, newIndicator);
   },
   render: function ( ) {
      var hierarchy = window.App.get('indicatorHierarchy');
      var topLevel = hierarchy[0].at(0);
      this.addTabButton(topLevel);
      var children = topLevel.childrenList.models;
      for(var i = 0, l = children.length; i < l; ++i) {
         this.addTabButton(children[i]);
      }
   },
   addTabButton: function ( indicator ) {
      var tabButton = $('<div class="tab-button tab-button-'+indicator.get('code')+'"></div>');
      tabButton.data('indicator', indicator);

      var swatch = $('<div class="tab-button-swatch"></div>');
      tabButton.append(swatch);

      var tabButtonID = '.tab-button-' + indicator.get('code');
      function addRule ( selector, params ) {
         try {
            if(document.styleSheets[0].addRule) {
               document.styleSheets[0].addRule(selector, params);
            } else {
               document.styleSheets[0].insertRule(selector + ' { ' + params + ' }', document.styleSheets[0].length);
            }
         } catch ( error ) {
            console.log(error);
         }
      }
      addRule(tabButtonID + '.tab-button-selected, ' + tabButtonID + ':hover', 'background-color: ' + indicator.get('color'));
      addRule(tabButtonID + ' > .tab-button-swatch', 'background-color: ' + indicator.get('color'));

      var label = $('<div class="tab-button-label"></div>');
      tabButton.append(label);
      registerLabel(label, indicator.label);

      var cutoff = $('<div class="tab-button-cutoff"></div>');
      tabButton.append(cutoff);

      this.$el.append(tabButton);
      tabButton.click(function ( ) {
         setState('view', 'map');
         setState('indicator', indicator);
         setState('data-indicator', indicator);
      });
   },
   applyIndicator: function ( oldIndicator, newIndicator ) {
      if(oldIndicator) {
         this.lowlightButton(this.$el.find('.tab-button-'+oldIndicator.get('code')));
      }
      if(newIndicator || (newIndicator = getState('indicator'))) {
         this.highlightButton(this.$el.find('.tab-button-'+newIndicator.get('code')));
      }
   },
   highlightButton: function ( button ) {
      button.addClass('tab-button-selected');
   },
   lowlightButton: function ( button ) {
      button.removeClass('tab-button-selected');
   }
});

var ClearIndicatorButton = Backbone.View.extend( {
   initialize: function ( ) {
      bindState('data-indicator', 'change', $.proxy(this.onDataIndicatorChange, this));
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      this.$el.click(function ( ) {
         setState('data-indicator', getState('indicator'));
      });
      this.setVisibility();
   },
   render: function ( ) {

   },
   setVisibility: function ( ) {
      var level = getState('data-indicator').get('level');
      var view = getState('view');
      var visibility = view == 'map' || level <= 2 ? 'hidden' : 'visible';
      this.$el.css('visibility', visibility);
   },
   onDataIndicatorChange: function ( ) {
      this.setVisibility();
   },
   onViewChange: function ( ) {
      this.setVisibility();
   }
});

var CheckboxButton = Backbone.View.extend( {
   initialize: function ( ) {
      this.$el.find('input').change($.proxy(this.onChange, this));
      bindState(this.stateId, 'change', $.proxy(this.onStateChange, this));
      this.setButtonState();

      // IPAD fake click event
      this.$el.click(function() {  })
   },
   render: function ( ) {

   },
   setButtonState: function ( ) {
      var isChecked = getState(this.stateId) === true;
      if(isChecked) {
         this.$el.find('input').attr('checked', 'checked');
      } else {
         this.$el.find('input').removeAttr('checked');
      }
   },
   onChange: function ( ) {
      var isChecked = this.$el.find('input').attr('checked') !== undefined;
      setState(this.stateId, isChecked);
   },
   onStateChange: function ( ) {
      this.setButtonState();
   }
});

var ShowTrendsButton = CheckboxButton.extend( {
   initialize: function ( ) {
      this.stateId = 'show-trends';
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      this.setVisibility();
      CheckboxButton.prototype.initialize.call(this);
   },
   render: function ( ) {
   },
   setVisibility: function ( ) {
      var isVisible = getState('view') === 'map';
      this.$el.css('display', isVisible ? 'block' : 'none');
   },
   onViewChange: function ( ) {
      this.setVisibility();
   }
});

var ShowEUButton = CheckboxButton.extend( {
   initialize: function ( ) {
      this.stateId = 'show-eu';
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      this.setVisibility();
      CheckboxButton.prototype.initialize.call(this);
   },
   setVisibility: function ( ) {
      var isVisible = (getState('view') === 'map' || getState('view') === 'component');
      this.$el.css('display', isVisible ? 'block' : 'none');
   },
   onViewChange: function ( ) {
      this.setVisibility();
   }
});

var LanguageMenu = Backbone.View.extend( {
   initialize: function ( ) {
      bindState('language', 'change', $.proxy(this.onLanguageChange, this));
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      this.render();
      this.setVisibility();
   },
   render: function ( ) {
      var languages = window.App.get('languages');
      var labelList = window.App.get('labelList');
      var lang, label, optionElement;
      var parent = this.$el.find('select');
      parent.change($.proxy(this.onOptionSelect, this));
      for(var i = 0, l = languages.length; i < l; ++i) {
         lang = languages[i];
         label = labelList.getLabelByCode(lang);
         optionElement = $('<option value="'+lang+'"></option>');
         registerLabel(optionElement, label);
         parent.append(optionElement);
      }
   },
   setVisibility: function ( ) {
      var visible = getState('view') == 'map';
      this.$el.css('display', visible ? 'block' : 'none');
   },
   onViewChange: function ( ) {
      this.setVisibility();
   },
   onOptionSelect: function ( ) {
      var select = this.$el.find('select');
      var val = select.val();
      setState('language', val);
   },
   onLanguageChange: function ( oldLanguage, newLanguage ) {
      var optionList = this.$el.find('option');
      if(oldLanguage) {
         optionList.filter('[value="'+oldLanguage+'"]').attr('selected', '');
      }
      if(newLanguage) {
         optionList.filter('[value="'+newLanguage+'"]').attr('selected', 'selected');
      }
   }
});

var RegionMenu = Backbone.View.extend( {
   initialize: function ( ) {
      bindState('selected-region', 'change', $.proxy(this.onRegionChange, this));
      this.$el.find('select').change($.proxy(this.onInputChange, this));
      this.render();
   },
   render: function ( ) {
      var regionList = window.App.get('regionList');
      var regions = [], region, option;
      var selected = getState('selected-region');
      var parent = this.$el.find('select');
      for(var i = 0, l = regionList.length; i < l; ++i) {
         region = regionList.at(i);
         option = this.getOption(region);
         parent.append(option);
         if(region === selected) {
            option.attr('selected', 'selected');
         }
      }
      this.sortOptions();
   },
   getOption: function ( region ) {
      var element = $('<option value="' + region.get('code') + '"></option>');
      registerLabel(element, region.label);
      return element;
   },
   sortOptions: function ( ) {
      var optionList = this.$el.find('option');
      var option;
      var order = [];
      for(var i = 0, l = optionList.length; i < l; ++i) {
         option = optionList.eq(i);
         order.push({ option: option, label: option.text() });
      }
      order.sortOn('label');
      var obj;
      var parent = this.$el.find('select');
      for(i = 0, l = order.length; i < l; ++i) {
         obj = order[i];
         option = obj.option;
         parent.append(option);
      }
   },
   onInputChange: function ( ) {
      var code = this.$el.find('select').val();
      var region = window.App.get('regionList').getGeoItemByCode(code);
      setState('selected-region', region);
   },
   onRegionChange: function ( oldRegion, newRegion ) {
      var optionList = this.$el.find('option');
      if(oldRegion) {
         optionList.filter('[value="'+oldRegion.get('code')+'"]').attr('selected', '');
      }
      if(newRegion) {
         optionList.filter('[value="'+newRegion.get('code')+'"]').attr('selected', 'selected');
      }
   }
});

var MapView = Backbone.View.extend( {
   initialize: function ( ) {
      this._highlighted = null;
      this.$el.append($('<div class="map-component"></div>'));
      this.$el.append($('<div class="map-average"><div id="low">Low</div><div id="gradient"></div><div id="high">High</div><div id="subtitle">5 = average</div></div>'));
      this.loadScripts($.proxy(this.initMapComponent, this));

      this.initToolTip();

      //if(!('ontouchstart' in window))
        // amplify.subscribe('maphover', $.proxy(this.onMapHover, this));

      this.render();
   },
   loadScripts: function ( onComplete ) {
      var scripts = [ 'amplify.min.js', 'jquery.mwmap.js', 'easel.ex.js', 'excanvas.js' ];
      var numToLoad = scripts.length;
      $.each(scripts.concat(), function ( index, element ) {
         $.ajax({
          //url: 'javascript/' + element,
		  url: html_app_path + '/javascript/' + element,
            dataType: 'script',
            cache: true,
            complete: function ( jqXHR, textStatus ) {
               numToLoad--;
               if(numToLoad === 0) {
                  _.defer(onComplete);
               }
            },
            async: false
         });
      });
   },
   initToolTip: function ( ) {
      this._toolTip = new ToolTip( { el: '.map-tooltip' });
      this._toolTip.setRegistration('bottomRight');
   },
   onMapHover: function ( data ) {
      // eu vars
      var geoCode = data ? data.geoitem : null;
      var showEu = getState('show-eu') === true;

      var euc = window.App.get('labelList').getLabelByCode('eu_countries');
      var countries = euc.getValue(getState('language'));
      if(!countries || countries == '')
         countries = euc.getValue('en');
      countries = countries.split(',');

      for (var country in countries) {
         countries[country] = $.trim(countries[country]);
      };
      if (showEu && countries.indexOf(geoCode) != -1) geoCode = "EU";
      var geoItem = window.App.get('countryList').getGeoItemByCode(geoCode);

      if(this._highlighted == geoCode) {
         return;
      }
      this._highlighted = geoCode;

      if (getState('isIpad') === true)
         return;

      if(!geoItem) {
         this._toolTip.hide();
      } else {
         var indicator = getState('indicator');
         var color = ColorUtil.fromHexStringToHex(indicator.get('color'));
         var rgb = ColorUtil.fromHexToRGB(color);
         var hsl = ColorUtil.fromRGBToHSL(rgb.r, rgb.g, rgb.b);
         rgb = ColorUtil.fromHSLToRGB(hsl.h, hsl.s, hsl.l * 0.65);
         color = ColorUtil.fromRGBToHexString(rgb.r, rgb.g, rgb.b);
         this._toolTip.setColor('#' + color);
         var ttEl = this._toolTip.$el;
         var timeseries = indicator.getTimeseries(getState('selected-region').get('code'), geoItem.get('code'));
         var valObj = timeseries ? timeseries.getValue(timeseries.endDate) : null;
         var score = valObj ? formatNumber(valObj.score, parseFloat(indicator.get('decimalplaces')), true) : '';
         ttEl.find('.map-tooltip-score').text(score);
         registerLabel(ttEl.find('.map-tooltip-country'), geoItem.label);
         this._toolTip.show();
      }
   },
   initMapComponent: function ( ) {
      this._mapComponent = new MapComponent( { el: '.map-component' } );
   },
   render: function ( ) {
   }
});

var MapComponent = Backbone.View.extend( {
   initialize: function ( ) {
      this._uid = _.uniqueId();
      this._calculatedColors = {};
      amplify.subscribe('mapready', $.proxy(this.onMapInit, this));
      this.$el.map({
         mapdata: 'data/map.xml',
		 //mapdata: html_app_path + '/data/map.xml',
         width: this.$el.width(),
         height: this.$el.height(),
         xoffset: 10,
         yoffset: 10,
         coordscale: 1.8,
         maphover: 'default'
      });

      if('ontouchstart' in window)
         amplify.subscribe('maphover', $.proxy(this.onMapSelect, this));
      else
      {
         amplify.subscribe('maphover', $.proxy(this.onMapHover, this));
         amplify.subscribe('mapselect', $.proxy(this.onMapSelect, this));
      }

      bindState('highlighted-country', 'change', $.proxy(this.onGeoItemHighlight, this));
      bindState('selected-country', 'change', $.proxy(this.onSelectedCountryChange, this));
      bindState('indicator', 'change', $.proxy(this.onIndicatorChange, this));
      bindState('selected-region', 'change', $.proxy(this.onRegionChange, this));
      this.render();
   },
   render: function ( ) {
   },
   onMapInit: function ( ) {
      _.once($.proxy(this.setData, this), this);
      this.setHighlight();
   },
   onMapHover: function ( data ) {
      // eu vars
      var geoCode = data ? data.geoitem : null;
      var showEu = getState('show-eu') === true;

      var euc = window.App.get('labelList').getLabelByCode('eu_countries');
      var countries = euc.getValue(getState('language'));
      if(!countries || countries == '')
         countries = euc.getValue('en');
      countries = countries.split(',');

      for (var country in countries) {
         countries[country] = $.trim(countries[country]);
      };
      if (showEu && countries.indexOf(geoCode) != -1) {
         geoCode = "EU";
      };

      var geoItemList = window.App.get('countryList');
      var geoItem = geoItemList.getGeoItemByCode(geoCode);

      setState('highlighted-country', geoItem);
   },
   onMapSelect: function ( data ) {
      var geoCode = data.geoitem ? data.geoitem : data;

      var showEu = getState('show-eu') === true;

      var euc = window.App.get('labelList').getLabelByCode('eu_countries');
      var countries = euc.getValue(getState('language'));
      if(!countries || countries == '')
         countries = euc.getValue('en');
      countries = countries.split(',');

      for (var country in countries) {
         countries[country] = $.trim(countries[country]);
      };
      if (showEu && countries.indexOf(geoCode) != -1) {
         geoCode = "EU";
      };

      var geoItemList = window.App.get('countryList');
      var geoItem = geoItemList.getGeoItemByCode(geoCode);

      if('ontouchstart' in window)
         setState('highlighted-country', geoItem);

      setState('selected-country', geoItem);
   },
   onGeoItemHighlight: function ( oldGeoItem, newGeoItem ) {
      this.applyColors();
      this.setHighlight();
   },
   onSelectedCountryChange: function ( oldCountry, newCountry ) {
      _.once($.proxy(this.setData, this), this);
   },
   onIndicatorChange: function ( oldInd, newInd ) {
      _.once($.proxy(this.setData, this), this);
   },
   onRegionChange: function ( oldRegion, newRegion ) {
      _.once($.proxy(this.setData, this), this);
   },
   setData: function ( ) {
      var list = window.App.get('countryList');
      var indicator = getState('indicator');
      var region = getState('selected-region');
      var regionCode = region ? region.get('code') : null;
      var country;
      var timeseries, val, vo, color;
      var legend = indicator.legend;

      for(var i = 0, l = list.length; i < l; ++i) {
         country = list.at(i);
         timeseries = indicator ? indicator.getTimeseries(regionCode, country.get('code')) : null;
         if(timeseries) {
            vo = timeseries.getValue(timeseries.endDate);
            val = vo ? vo.score : NaN;
         }
         color = legend.getColor(val);
         color = '#' + ColorUtil.fromRGBToHexString(color.r, color.g, color.b);
         this._calculatedColors[country.get('code')] = color;
      }
      this.applyColors();
   },
   applyColors: function ( ) {
      // eu vars
      var showEu = getState('show-eu') === true;

      var euc = window.App.get('labelList').getLabelByCode('eu_countries');
      var countries = euc.getValue(getState('language'));
      if(!countries || countries == '')
         countries = euc.getValue('en');
      countries = countries.split(',');

      for (var country in countries) {
         countries[country] = $.trim(countries[country]);
      };

      var map = this._calculatedColors;
      var highlighted = getState('highlighted-country');
      if(highlighted) {
         var code = highlighted.get('code');
         map = _.clone(this._calculatedColors);

         // check if country is in EU
         if (showEu && (countries.indexOf(code) != -1 || code == "EU")) {
            var i, l = countries.length;
            for (i = 0; i <l; i++) {
               map[countries[i]] = getState('indicator').get('color');
            };
         } else {
            map[code] = getState('indicator').get('color');
         }
      };

      this.$el.map('colorize', map);
   },
   setHighlight: function ( ) {
      var showEu = getState('show-eu') === true;
      var isHighlighted = Boolean(getState('highlighted-country'));
      if(isHighlighted) {
         this.$el.addClass('map-component-country-highlighted');
      } else {
         this.$el.removeClass('map-component-country-highlighted');
      }
   },
   getColor: function ( geoCode ) {
      return this._calculatedColors[geoCode];
   },
   toString: function ( ) {
      return this._uid;
   }
});

var BarChartItemView = Backbone.View.extend( {
   initialize: function ( ) {
      this._total = NaN;
      this._barsByValueObject = {};
      this._valueObjects = [];
      this._stack = true;
      this._minVal = 0;
      this._maxVal = 0;
      this._cachedElements = [];
      this._uid = _.uniqueId();
      this._animateFrom = 0;
      this._valueType = 'weighted';
      this._negativeSpace = 0;

      this.initUI();
      this.update();
   },
   initUI: function ( ) {
      var label = $('<div class="bar-chart-item-label"></div>');
      this.$el.append(label);

      var chartHolder = $('<div class="bar-chart-holder"></div>');
      this.$el.append(chartHolder);

      var chartHolderBg = $('<div class="bar-chart-holder-bg"></div>');
      chartHolder.append(chartHolderBg);

      this._holder = chartHolderBg;

      var score = $('<div class="bar-chart-item-score"></div>');
      this.$el.append(score);
   },
   update: function ( data ) {
      for(var id in data) {
         this.options[id] = data[id];
      }
      var label = this.options.label;
      var lblEl = this.$el.find('.bar-chart-item-label');
      registerLabel(lblEl, label);
   },
   setValue: function ( valueObject, color ) {
      this.clearValues();
      this.addValue(valueObject, color);
   },
   setRange: function ( min, max ) {
      this._minVal = min;
      this._maxVal = max;
      _.once($.proxy(this.animateElements, this), this);
   },
   addValue: function ( valueObject, color ) {
      this._valueObjects.push(valueObject);
      this._barsByValueObject[valueObject] = this.createValueElement(valueObject, color);
      _.once($.proxy(this.animateElements, this), this);
   },
   removeValue: function ( valueObject ) {
      var element = this._barsByValueObject[valueObject];
      this.cacheElement(element);
      element.detach();
      element.removeData('valueObject');
      delete this._barsByValueObject[valueObject];
      var index = _.indexOf(this._valueObjects, valueObject);
      if(index != -1) {
         this._valueObjects.splice(index, 1);
      }

   },
   clearValues: function ( ) {
      while(this._valueObjects.length) {
         this.removeValue(this._valueObjects[0]);
      }
   },
   getValues: function ( ) {

   },
   setTotal: function ( total, decimalPlaces ) {
      if(this._total != total) {
         this._total = total;
         if(decimalPlaces === undefined) {
            decimalPlaces = 1;
         }
         var label = formatNumber(total, parseFloat(decimalPlaces), true);
         this.$el.find('.bar-chart-item-score').text(label);
      }
   },
   getTotal: function ( ) {
      return this._total;
   },
   getWeightedValue: function ( valueObject ) {
      var val = valueObject[this._valueType];
      if(val === undefined || isNaN(val)) {
         val = valueObject.score;
      }
      return val;
   },
   getPositionFromValue: function ( value ) {
      return (value - this._minVal) / (this._maxVal - this._minVal) * this._holder.width();
   },
   createValueElement: function ( valueObject, color ) {
      var element = this.getCachedElement(valueObject, color);
      if(!element) {
         element = $('<div class="bar-chart-item-bar"></div>');
         element.click(this.onChildClick);
         element.mouseover(this.onChildMouseOver);
         element.mouseout(this.onChildMouseOut);
      }
      element.css('background-color', color);
      element.data('valueObject', valueObject);
      this._holder.append(element);
      return element;
   },
   animateElements: function ( ) {
      var vo, element;
      var val;
      var i, l, sumPos = 0, sumNeg = 0;

      var neg = [], pos = [], sorted = [];

      var stack = this._stack && this._valueObjects.length > 1;

      if(stack) {
         for(i = 0, l = this._valueObjects.length; i < l; ++i) {
            vo = this._valueObjects[i];
            element = this._barsByValueObject[vo];
            val = this.getWeightedValue(vo);
            if(!isNaN(val)) {
               if(val < 0) {
                  neg.push(vo);
                  sumNeg += Math.abs(val);
               } else {
                  pos.push(vo);
                  sumPos += val;
               }
            }
         }
         neg.reverse();
         sorted = neg.concat(pos);
      } else {
         sorted = this._valueObjects.concat();
      }


      var zero = this.getPositionFromValue(0);

      var totalWidth = (this.getPositionFromValue(Math.abs(this._total)) - zero) * (1 - this._negativeSpace);
      var marginLeft = this._negativeSpace ? (this._holder.width() * this._negativeSpace) - (sumNeg/sumPos) * totalWidth : zero;
      if(isNaN(marginLeft)) {
         marginLeft = 0;
      }

      function step ( now, fx ) {
         var el = $(fx.elem);
         var width = fx.pos * (fx.end-fx.start) + fx.start;
         var left = Math.min(zero, zero + width);
         width = Math.abs(width);
         el.css({ marginLeft: left + 'px', width: width + 'px'});
      }

      var reorder = false;
      for(i = 0, l = sorted.length; i < l; ++i) {
         vo = sorted[i];
         element = this._barsByValueObject[vo];
         if(i !== element.index()) {
            reorder = true;
            break;
         }
      }
      var d = 0;
      for(i = 0, l = sorted.length; i < l; ++i) {
         vo = sorted[i];
         element = this._barsByValueObject[vo];
         if(reorder) {
            this._holder.append(element);
         }
         val = this.getWeightedValue(vo);
         if(!isNaN(val)) {
            if(stack) {
               width = Math.abs(val) / sumPos * totalWidth;
            } else {
               width = this.getPositionFromValue(val) - zero;
            }
         } else {
            width = 0;
         }
         if(isNaN(width)) {
            width = 0;
         }
         element.stop();
         d = width - Math.floor(width);
         width = Math.floor(width);

         if(stack) {
            element.css({ marginLeft: i === 0 ? (marginLeft + 'px') : '0px', width: width });
         }  else {
            element.animate( { barWidth: width }, { duration: 'slow', step: step } );
         }
      }
      this._animateFrom = this._valueObjects.length;
   },
   cacheElement: function ( element ) {
      this._cachedElements.push(element);
   },
   getCachedElement: function ( valueObject, color ) {
      return this._cachedElements.pop();
   },
   onChildClick: function ( ) {
      var valueObject = $(this).data('valueObject');
      var indicator = window.App.get('indicatorFlatList').getIndicatorByCode(valueObject.indicator);
      setState('view', 'map');
      setState('indicator', indicator);
      setState('data-indicator', indicator);
   },
   onChildMouseOver: function ( ) {
      var valueObject = $(this).data('valueObject');
      $(this).trigger('valueHighlight', valueObject);
   },
   onChildMouseOut: function ( ) {
      var valueObject = $(this).data('valueObject');
      $(this).trigger('valueLowlight', valueObject);
   },
   setValueType: function ( valueType ) {
      this._valueType = valueType;
   },
   setNegativeSpace: function ( negativeSpace ) {
      this._negativeSpace = negativeSpace;
      _.once($.proxy(this.animateElements, this), this);
   },
   toString: function ( ) {
      return this._uid;
   }
});

var GeoChartItemView = BarChartItemView.extend( {
   initialize: function ( ) {
      BarChartItemView.prototype.initialize.apply(this, arguments);
   }
});

var GeoChartView = Backbone.View.extend( {
   initialize: function ( ) {
      this._viewsByCountryCode = {};
      this._uid = _.uniqueId();
      bindState('data-indicator', 'change', $.proxy(this.onIndicatorChange, this));
      bindState('selected-region', 'change', $.proxy(this.onRegionChange, this));
      bindState('highlighted-country', 'change', $.proxy(this.onGeoItemHighlight, this));
      bindState('selected-country', 'change', $.proxy(this.onSelectedCountryChange, this));
      bindState('geo-chart-sort', 'change', $.proxy(this.onSortChange, this));
      bindState('language', 'change', $.proxy(this.onLanguageChange, this));
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      bindState('show-eu', 'change', $.proxy(this.onShowEUChange, this));

      this._toolTip = new ToolTip( { el: '.geo-chart-tooltip' });

      this.render();
      this.setBarVisibility();
      _.once($.proxy(this.setData, this), this);
   },
   render: function ( ) {
      var countryList = window.App.get('countryList');
      var country;
      for(var i = 0, l = countryList.length; i < l; ++i) {
         country = countryList.at(i);
         this.addBarChart(country);
      }
   },
   addBarChart: function ( country ) {
      var element = $('<div class="bar-chart-item"></div>');
      element.data('geoitem', country);
      element.click(this.onBarClick);
      element.mouseenter(this.onBarOver);
      element.mouseleave(this.onBarOut);
      this.$el.append(element);
      var view = new GeoChartItemView( { el: element, label: country.label, geoitem: country });
      view.$el.bind('valueHighlight', $.proxy(this.onValueHighlight, this));
      view.$el.bind('valueLowlight', $.proxy(this.onValueLowlight, this));
      this._viewsByCountryCode[country.get('code')] = view;
   },
   createBarChart: function ( country, el, total ) {
      var element = $('<div class="bar-chart-item"></div>');
      element.data('geoitem', country);
      element.click(this.onBarClick);
      element.mouseenter(this.onBarOver);
      element.mouseleave(this.onBarOut);
      this.$el = $(el);
      this.$el.append(element);
      var view = new GeoChartItemView( { el: element, label: country.label, geoitem: country });
      view.setTotal(total, 2);
      console.log('position:' + total + ':: ' + view.getPositionFromValue(total));
      view.$el.bind('valueHighlight', $.proxy(this.onValueHighlight, this));
      view.$el.bind('valueLowlight', $.proxy(this.onValueLowlight, this));
      this._viewsByCountryCode[country.get('code')] = view;
   },
   onBarClick: function ( ) {
      var geoitem = $(this).data('geoitem');
      if(geoitem === getState('selected-country')) {
         setState('selected-country', null);
      } else {
         setState('selected-country', geoitem);
      };
   },
   onBarOver: function ( ) {
      var geoitem = $(this).data('geoitem');
      setState('highlighted-country', geoitem);
   },
   onBarOut: function ( ) {
      var geoitem = $(this).data('geoitem');
      setState('highlighted-country', null);
   },
   onIndicatorChange: function ( oldIndicator, newIndicator ) {
      _.once($.proxy(this.setData, this), this);
   },
   onRegionChange: function ( oldRegion, newRegion ) {
      _.once($.proxy(this.setData, this), this);
   },
   onGeoItemHighlight: function ( oldGeoItem, newGeoItem ) {
      var view;
      if(oldGeoItem) {
         view = this._viewsByCountryCode[oldGeoItem.get('code')];
         if(view) {
            view.$el.removeClass('bar-chart-item-highlight');
         }
      }
      if(newGeoItem) {
         view = this._viewsByCountryCode[newGeoItem.get('code')];
         if(view) {
            view.$el.siblings().removeClass('bar-chart-item-highlight');
            if('ontouchstart' in window)
               view.$el.siblings().removeClass('bar-chart-item-selected');
            view.$el.addClass('bar-chart-item-highlight');
         }
      }
   },
   onSelectedCountryChange: function ( oldCountry, newCountry ) {
      var view;
      if(oldCountry) {
         view = this._viewsByCountryCode[oldCountry.get('code')];
         if(view) {
            view.$el.removeClass('bar-chart-item-selected');
         }
      }
      if(newCountry) {
         view = this._viewsByCountryCode[newCountry.get('code')];
         if(view) {
            view.$el.siblings().removeClass('bar-chart-item-selected');
            view.$el.addClass('bar-chart-item-selected');
         }
      }
   },
   onSortChange: function ( ) {
      var indicator = getState('data-indicator');
      this.sort(indicator.get('sortorder') == 'reversed');
   },
   onLanguageChange: function ( ) {
      if(getState('geo-chart-sort') == 'name') {
         this.sort();
      }
   },
   onViewChange: function ( ) {
      _.once($.proxy(this.setData, this), this);
   },
   onShowEUChange: function ( ) {
      this.setBarVisibility();
   },
   setData: function ( ) {
      var countryList = window.App.get('countryList');
      var country, code, view;
      var neg_index = 0;
      var indicator = getState('data-indicator');
      var region = getState('selected-region').get('code');
      var color = indicator.get('color');
      var timeseries, valueObject;
      var minVal = 0, maxVal = -Number.MAX_VALUE;
      var order = [];
      var isAll = indicator.get('level') == (getState('view') == 'map' ? 1 : 2);
      var indicators = [];
      var i, l, j, m, reversed = false;
      var total;
      var primary = getState('indicator');

      var valueType = 'weighted';
      var totalType = 'score';
      switch(parseFloat(indicator.get('level'))) {
         case 1: case 2:
         valueType = 'weighted';
         totalType = 'score';
         break;

         case 3: case 4:
         valueType = 'value';
         totalType = 'value';
         break;
      }

      if(!isAll) {
         indicators = [ indicator ];
         reversed = indicator.get('sortorder') == 'reversed';
      } else {
         for(i = 0, l = indicator.childrenList.length; i < l; ++i) {
            indicators.push(indicator.childrenList.at(i));
         }
      }

      var ind;
      var that = this;
      function getValueObject ( country, region, ind ) {
         var timeseries = ind.getTimeseries(region, country.get('code'));
         var valueObject = timeseries ? timeseries.getValue(timeseries.endDate) : null;
         return valueObject;
      }

      var Wneg = {}, Wpos = {}, val, vo;
      var maxTotal = 0;

      for(i = 0, l = countryList.length; i < l; ++i) {
         country = countryList.at(i);
         code = country.get('code');

         view = this._viewsByCountryCode[code];
         view.clearValues();
         view.setValueType(valueType);

         Wpos[code] = 0, Wneg[code] = 0;
         for(j = 0, m = indicators.length; j < m; ++j) {
            ind = indicators[j];
            valueObject = getValueObject(country, region, ind);
            view.addValue(valueObject, ind.get('color'));

            val = view.getWeightedValue(valueObject);

            // sorting the array on the go
            if(!isNaN(val))
            {
               if(val < 0)
                  Wneg[code] += val;
               else
                  Wpos[code] += val;
            }
         }

         timeseries = indicator.getTimeseries(region, country.get('code'));
         valueObject = timeseries ? timeseries.getValue(timeseries.endDate) : null;
         total = valueObject[totalType];
         if(isNaN(total)) {
            total = valueObject.score;
         }
         if(!isNaN(total)) {
            minVal = Math.min(minVal, total);
            maxVal = Math.max(maxVal, total);
         }

         view.setTotal(total, indicator.get('decimalplaces'));
         maxTotal = Math.max(maxTotal, total);
      }

      var M1 = 0, M2 = 0, Ppos, Pratio;
      for(i = 0, l = countryList.length; i < l; ++i) {
         country = countryList.at(i);
         code = country.get('code');
         view = this._viewsByCountryCode[code];

         Ppos = view.getTotal() / maxTotal;
         Pratio = Math.abs(Wneg[code]) / Wpos[code];

         M1 = Math.max(M1, Pratio * Ppos);
         M2 = Math.max(M2, Ppos)
      }

      var maxNegSpace = M1 / (M1 + M2);

      for(i = 0, l = countryList.length; i < l; ++i) {
         country = countryList.at(i);
         view = this._viewsByCountryCode[country.get('code')];
         view.setRange(minVal, maxVal);
         view.setNegativeSpace(maxNegSpace);
      }
      this.sort(reversed);

      // score div
      this.$el.find('#score_component').remove();

      this.$el.append('<div id="score_component"></div>');
      registerLabel(this.$el.find('#score_component'), indicator.unit);

   },
   sort: function ( reversed ) {
      var order = [];
      var view;
      for(var countryCode in this._viewsByCountryCode) {
         view = this._viewsByCountryCode[countryCode];
         order.push( { view: view, name: view.options.geoitem.label.getValue(getState('language')), value: view.getTotal() } );
      }

      var sortBy = getState('geo-chart-sort');
      var props = [];
      switch(sortBy) {
         case 'value':
         props = [ 'value', 'name' ];
         reversed = !reversed;
         break;

         case 'name':
         props = [ 'name', 'value' ];
         break;
      }
      order.sortOn(props);
      if(reversed) {
         order.reverse();
      }

      var obj;
      var parent = this.$el;
      for(var i = 0, l = order.length; i < l; ++i){
         obj = order[i];
         view = obj.view;
         parent.append(view.$el);
      }
   },
   setBarVisibility: function ( ) {
      var showEu = getState('show-eu') === true;
      var hide = [];
      var i, l;
      if(!showEu) {
         hide.push('EU');
      } else {
         var label = window.App.get('labelList').getLabelByCode('eu_countries');
         var value = label.getValue('en');
         var countries = value.split(',');
         for(i = 0, l = countries.length; i < l; ++i) {
            hide.push($.trim(countries[i]));
         }
      }
      var view;
      for(var code in this._viewsByCountryCode) {
         view = this._viewsByCountryCode[code];
         view.$el.css('display', hide.indexOf(code) === -1 ? '' : 'none');
      }
   },
   onValueHighlight: function ( evt, valueObject ) {
      var showValue = getState('indicator').get('level') == 1 || (getState('view') == 'component' && getState('indicator') == getState('data-indicator'));
      if(!showValue) {
         return;
      }

      var element = $(evt.target);
      var code = valueObject.indicator;
      var indicator = window.App.get('indicatorFlatList').getIndicatorByCode(code);
      this._toolTip.$el.text(formatNumber(valueObject.score, parseFloat(indicator.get('decimalplaces')), true));
      var ttOffset = this._toolTip.$el.parent().offset();
      var elOffset = element.offset();
      var x = elOffset.left - ttOffset.left + element.width() / 2;
      var y = elOffset.top - ttOffset.top;
      this._toolTip.lockPosition(x, y);
      this._toolTip.show();
   },
   onValueLowlight: function ( evt, valueObject ) {
      this._toolTip.hide();
   },
   toString: function ( ) {
      return this._uid;
   }
});

var SubjectHighlightView = BarChartItemView.extend( {
   initialize: function ( ) {
      bindState('data-geoitem', 'change', $.proxy(this.onGeoItemChange, this));
      this.render();
      this.applyGeoItem();
   },
   render: function ( ) {
      var lblEl = $('<div class="subject-highlight-label"></div>');
      this.$el.append(lblEl);

   },
   onGeoItemChange: function ( oldGeoItem, newGeoItem ) {
      this.applyGeoItem();
   },
   onMapReady: function ( ) {
      this.applyGeoItem();
   },
   applyGeoItem: function ( ) {
      var geoItem = getState('data-geoitem');
      var lbl = geoItem ? geoItem.label : null;
      var lblEl = this.$el.find('.subject-highlight-label');
      registerLabel(lblEl, lbl);
      var mapComponent = $('.map-component');
      if(mapComponent.map) {
         var eu = this.$el.find('#eu-image');
         var canvas = this.$el.find('canvas');

         if(geoItem && geoItem.get('code') !== 'EU') {
            if (eu.length) eu.remove();
            if(!canvas.length) {
               canvas = $('<canvas class="subject-highlight-canvas"></canvas>');
               this.$el.append(canvas);
            }
            mapComponent.map('cloneCountryShape', canvas[0], geoItem.get('code'), '#4E4E4E', 'right');
         } else if (geoItem && geoItem.get('code') == 'EU') {
            if (canvas.length) canvas.remove();
            if (!eu.length) {
               eu = $("<div id='eu-image' class='subject-highlight-eu'></div>");
               this.$el.append(eu);
            };
         } else {
            if (canvas.length) canvas.remove();
            if (eu.length) eu.remove();
         };
      }
   }
});

var SubjectChartItemView = BarChartItemView.extend( {
   initialize: function ( ) {
      this._cachedElementsByTime = {};
      this.$el.append($('<div class="bar-chart-item-swatch"></div>'));
      BarChartItemView.prototype.initialize.apply(this, arguments);
      this._stack = false;
   },
   update: function ( ) {
      BarChartItemView.prototype.update.apply(this, arguments);
      var ind = this.options.indicator;
      if(ind) {
         this.$el.find('.bar-chart-item-swatch').css('background-color', ind.get('color'));
      }
   },
   render: function ( ) {
      BarChartItemView.prototype.render.apply(this, arguments);
   },
   animateElements: function ( ) {
      BarChartItemView.prototype.animateElements.apply(this, arguments);
      var availableHeight = this._holder.height();
      var minYear = getState('min-year');
      var maxYear = getState('max-year');

      var numbars = getState('show-trends') ? (maxYear - minYear + 1) : 1;
      var height = availableHeight / numbars;
      var offset = availableHeight - height * this._valueObjects.length;

      if(height === Number.POSITIVE_INFINITY) {
         height = 0;
      }
      var el;
      var opd = 0.1;
      var d = 0, h;
      for(var i = 0, l = this._valueObjects.length; i < l; ++i) {
         el = this._barsByValueObject[this._valueObjects[i]];
         h = height + d;
         d = h - Math.floor(h);
         el.css('top', offset + 'px');
         el.height(Math.floor(h));
         el.css('opacity', (1 - ((l-i-1)*opd)));
      }
   },
   getCachedElement: function ( valueObject, color ) {
      var element = this._cachedElementsByTime[valueObject.time];
      if(element) {
         delete this._cachedElementsByTime[valueObject.time];
      }
      return element;
   },
   cacheElement: function ( element ) {
      var time = element.data('valueObject').time;
      if(!this._cachedElementsByTime[time]) {
         this._cachedElementsByTime[time] = element;
      }
   }
});

var SubjectChartView = Backbone.View.extend( {
   initialize: function ( ) {
      this._viewsByIndicatorCode = {};
      this._uid = _.uniqueId();
      bindState('data-geoitem', 'change', $.proxy(this.onGeoItemChange, this));
      bindState('selected-region', 'change', $.proxy(this.onRegionChange, this));
      bindState('show-trends', 'change', $.proxy(this.onShowTrendsChange, this));

      this.initToolTip();

      this.render();
      _.once($.proxy(this.setData, this), this);
   },
   render: function ( ) {
      var hierarchy = window.App.get('indicatorHierarchy');
      var topLevel = hierarchy[0].at(0);
      var children = topLevel.childrenList;
      this.addBarChart(topLevel);
      for(var i = 0, l = children.length; i < l; ++i) {
         this.addBarChart(children.at(i));
      }
      var label = $('<div class="trends-label"><div class="trends-legend-label"></div><div class="trends-legend-year"></div></div>');
      this.$el.append(label);
   },
   addBarChart: function ( indicator ) {
      var element = $('<div class="bar-chart-item"></div>');
      element.bind('valueHighlight', $.proxy(this.onValueHighlight, this));
      element.bind('valueLowlight', $.proxy(this.onValueLowlight, this));
      element.data('indicator', indicator);
      this.$el.append(element);
      var view = new SubjectChartItemView( { el: element, label: indicator.label, indicator: indicator } );
      this._viewsByIndicatorCode[indicator.get('code')] = view;
   },
   onGeoItemChange: function ( oldGeoItem, newGeoItem ) {
      _.once($.proxy(this.setData, this), this);
   },
   onShowTrendsChange: function ( old, nw ) {
      _.once($.proxy(this.setData, this), this);
      this.$el.find('.trends-label').toggle();
   },
   onRegionChange: function ( oldRegion, newRegion ) {
      _.once($.proxy(this.setData, this), this);
   },
   initToolTip: function ( ) {
      this._toolTip = new ToolTip( { el: '.subject-chart-tooltip' } );
   },
   onValueHighlight: function ( evt, valueObject ) {
      var showValue = getState('show-trends');
      if(!showValue) {
         this._toolTip.hide();
         return;
      }

      var element = $(evt.target);
      var code = valueObject.indicator;
      var indicator = window.App.get('indicatorFlatList').getIndicatorByCode(code);
      this._toolTip.$el.text(formatNumber(valueObject.score, parseFloat(indicator.get('decimalplaces')), true) + ' (' + new Date(valueObject.time).getFullYear().toString() + ')');
      var ttOffset = this._toolTip.$el.parent().offset();
      var elOffset = element.offset();
      var x = elOffset.left - ttOffset.left + element.width() / 2;
      var y = elOffset.top - ttOffset.top;
      this._toolTip.lockPosition(NaN, y);
      this._toolTip.show();
   },
   onValueLowlight: function ( evt, valueObject ) {
      this._toolTip.hide();
   },
   setData: function ( ) {
      var indicatorList = window.App.get('indicatorFlatList');
      var indicator;
      var geoitemCode = getState('data-geoitem') ? getState('data-geoitem').get('code') : null;
      var regionCode = getState('selected-region') ? getState('selected-region').get('code') : null;
      var timeseries;

      var showTrends = getState('show-trends');
      var view;
      var color, i, l, valueObjects, vo;

      var minVal = 0, maxVal = -Number.MAX_VALUE;
      var minYear = Number.MAX_VALUE, maxYear = -Number.MAX_VALUE;

      for(var code in this._viewsByIndicatorCode)
      {
         view = this._viewsByIndicatorCode[code];
         view.clearValues();
         indicator = indicatorList.getIndicatorByCode(code);
         color = indicator.get('color');
         timeseries = indicator.getTimeseries(regionCode, geoitemCode);
         if(!timeseries) {
            if(showTrends) {
               view.$el.addClass('show-trends');
            } else {
               view.$el.removeClass('show-trends');
            }
            view.setTotal(NaN);
            continue;
         }

         if(showTrends)
         {
            valueObjects = timeseries.values;
            for(i = 0, l = valueObjects.length; i < l; ++i)
            {
               vo = valueObjects[i];
               if(vo && !isNaN(vo.score))
               {
                  minVal = Math.min(minVal, vo.score);
                  maxVal = Math.max(maxVal, vo.score);
               }
               view.addValue(vo, color);
            }

            minYear = Math.min(timeseries.startDate,  minYear);
            maxYear = Math.max(timeseries.endDate,  maxYear);

            view.setTotal(vo ? vo.score : NaN, indicator.get('decimalplaces'));
            view.$el.addClass('show-trends');
         }
         else
         {
            vo = timeseries.getValue(timeseries.endDate);
            if(vo && !isNaN(vo.score))
            {
               minVal = Math.min(minVal, vo.score);
               maxVal = Math.max(maxVal, vo.score);
            }
            view.addValue(vo, color);
            view.setTotal(vo ? vo.score : NaN, indicator.get('decimalplaces'));
            view.$el.removeClass('show-trends');
         }
      }

      for(code in this._viewsByIndicatorCode)
      {
         view = this._viewsByIndicatorCode[code];
         view.setRange(minVal, maxVal);
      }

      if(showTrends)
      {
         minYear = new Date(minYear).getFullYear();
         maxYear = new Date(maxYear).getFullYear();

         if(!isNaN(minYear))
         {
            var l = window.App.get('labelList').getLabelByCode('trends').getValue(getState('language'));
            this.$el.find('.trends-legend-label').text(minYear + '-' + maxYear + ' ' + l);
            this.$el.find('.trends-legend-year').text(maxYear);
         }
      }

   },
   toString: function ( ) {
      return this._uid;
   }
});

var ComponentDetailView = Backbone.View.extend( {
   initialize: function ( ) {
      this._isOpen = false;
      this._isVisible = true;
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      bindState('indicator', 'change', $.proxy(this.onIndicatorChange, this));
      bindState('data-indicator', 'change', $.proxy(this.onDataIndicatorChange, this));
      this.render();
      this.applyIndicator();
      this.applyDataIndicator();
      this.applyView();
   },
   render: function ( ) {
      var button = $('<div class="component-detail-button"></div>');

      button.click($.proxy(this.onButtonClick, this));
      this.$el.append(button);

      var content = $('<div class="component-breakdown-view">');
      content.css('display', 'none');
      this.$el.append(content);

      var indicatorLabel = $('<div class="indicator-label"></div>');
      content.append(indicatorLabel);

      var indicatorDesc = $('<div class="indicator-desc"></div>');
      content.append(indicatorDesc);

      var indicatorExpl = $('<div class="indicator-expl"></div>');
      content.append(indicatorExpl);

      var chartViewHolder = $('<div class="component-chart-view"></div>');
      content.append(chartViewHolder);
      var componentChartView = new ComponentChartView( { el: chartViewHolder });

   },
   open: function ( ) {
      if(!this._isOpen) {
         this._isOpen = true;
         var app = $('.app');
         var top = $('.view-container').offset().top + parseInt($('.component-breakdown-view').css('margin-top')) - app.offset().top;
         var height = app.outerHeight(true) - top - this.$el.height() + this.$el.find('.component-detail-button').height();

         $('.show-eu-button').css('top', '19px');
         $('.sort-geochart-button').css('bottom', '4px');
         $('.region-menu').css('bottom', '4px');

         this.$el.animate( { height: height }, 'slow', function() {
            $(this).css('top', '30px');
         });
         this.$el.addClass('component-detail-view-open');

         var breakdownView = this.$el.find('.component-breakdown-view');
         breakdownView.css('display','block');
         breakdownView.css('height', app.height() - top);
      }
   },
   close: function ( ) {
      if(this._isOpen) {
         this._isOpen = false;

         var height = this.$el.find('.component-detail-button').height();
         var breakdownView = this.$el.find('.component-breakdown-view');

         $('.show-eu-button').css('top', '');
         $('.sort-geochart-button').css('bottom', '');
         $('.region-menu').css('bottom', '');

         this.$el.css('top', '');
         this.$el.animate({ height: height }, 'slow', function ( ) {
            breakdownView.css('display', 'none');
         });
         this.$el.removeClass('component-detail-view-open');
      }
   },
   show: function() {
      if(!this._isVisible) {
         this._isVisible = true;
         this.$el.css('display', 'block');
          
        }
      
   },
   hide: function ( ) {
      this.close();
      if(this._isVisible) {
         this.$el.css('display', 'none');
         this._isVisible = false;
      }
   },
   applyIndicator: function ( ) {
      var ind = getState('indicator');
      var show = ind.get('level') > 1;
      if(show) {
         this.show();
      } else {
         this.hide();
      }
      this.setButtonLabel();
      this.$el.find('.component-detail-button').css('background-color', ind.get('color'));

      $('.map-average #gradient').gradient('h', '#FFF', ind.get('color'));
   },
   applyView: function ( ) {
      if(getState('view') == 'component') {
         this.open();
      } else {
         this.close();
      }
   },
   setButtonLabel: function ( ) {
      var ind = getState('indicator');
      var isOpen = getState('view') == 'component';
      var labelID = isOpen ? 'close' : 'drill_down';
      var label = ind.label;
      var buttonLabel = window.App.get('labelList').getLabelByCode(labelID);
      var formattedLabel = new Label();
      var vals = buttonLabel.values;
      for(var lang in vals) {
         formattedLabel.setValue(lang, buttonLabel.getValue(lang).replace('<component>', label.getValue(lang)));
      }

      var el = this.$el.find('.component-detail-button');
      registerLabel(el, formattedLabel);
   },
   onButtonClick: function ( ) {
      var isComponentView = getState('view') == 'component';
      setState('view', isComponentView ? 'map' : 'component');
   },
   onIndicatorChange: function ( oldInd, newInd ) {
      this.applyIndicator();
   },
   onDataIndicatorChange: function ( oldInd, newInd ) {
      this.applyDataIndicator();
   },
   applyDataIndicator: function ( ) {
      var indicator = getState('data-indicator');
      var lblEl = this.$el.find('.indicator-label');
      var descEl = this.$el.find('.indicator-desc');
      var explEl = this.$el.find('.indicator-expl');

      registerLabel(lblEl, indicator.label);
      registerLabel(descEl, indicator.desc);

      var lang = window.App.state.get('language');
      var e = indicator.explanation ? indicator.explanation.getValue(lang) : '';

      if(e)
      {
         registerLabel(explEl, indicator.explanation);

         if(!descEl.find('.info-button').length)
            descEl.append('<div class="info-button"><div/></div>');

         var button = descEl.find('.info-button');
         button.off('.infobutton').on('click.infobutton', function(e) {
            explEl.toggle();

            $(document).on('click.infobutton', function() {
               explEl.toggle();
               $(document).off('.infobutton');
            });

            e.stopPropagation();
         }).show();
      }
      else
      {
         descEl.find('.info-button').hide();
         explEl.hide();
      }
   },
   onViewChange: function ( oldView, newView ) {
      this.applyView();
      this.setButtonLabel();
   }
});

var ComponentChartView = Backbone.View.extend( {
   initialize: function ( ) {
      this._cachedCharts = [];
      this._uid = _.uniqueId();
      this._viewsByIndicatorCode = {};
      this.initToolTip();
      bindState('indicator', 'change', $.proxy(this.onIndicatorChange, this));
      bindState('data-geoitem', 'change', $.proxy(this.onGeoItemChange, this));
      bindState('selected-region', 'change', $.proxy(this.onRegionChange, this));
      bindState('data-indicator', 'change', $.proxy(this.onDataIndicatorChange, this));
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      this.render();
      this.applyIndicator();
      _.once($.proxy(this.setData, this), this);
   },
   render: function ( ) {
      var lbl = $('<div class="component-geoitem-label"></div>');
      this.$el.append(lbl);

      var chartHolder = $('<div class="component-chart-holder"></div>');
      this._holder = chartHolder;
      this.$el.append(chartHolder);

      var axisComponent = $('<div class="component-chart-axis"></div>');
      this.$el.append(axisComponent);
      this._axisComponent = axisComponent;

      axisComponent.append($('<div class="component-axis-label min-val-label"></div>'));
      axisComponent.append($('<div class="component-axis-label zero-val-label"></div>'));
      axisComponent.append($('<div class="component-axis-label max-val-label"></div>'));

      var averageComponent = $('<div class="component-chart-average">5 = average</div>');
      this.$el.append(averageComponent);
      this._averageComponent = averageComponent;

   },
   onIndicatorChange: function ( ) {
      this.applyIndicator();
      this.setToolTipColor();
      _.once($.proxy(this.setData, this), this);
   },
   onGeoItemChange: function ( oldGeoItem, newGeoItem ) {
      _.once($.proxy(this.setData, this), this);
   },
   onRegionChange: function ( oldRegion, newRegion ) {
      _.once($.proxy(this.setData, this), this);
   },
   onDataIndicatorChange: function ( oldInd, newInd ) {
      var view;
      if(oldInd && (view = this._viewsByIndicatorCode[oldInd.get('code')])) {
         view.$el.removeClass('bar-chart-item-selected');
      }
      if(newInd && (view = this._viewsByIndicatorCode[newInd.get('code')])) {
         view.$el.addClass('bar-chart-item-selected');
      }
   },
   onViewChange: function ( oldView, newView ) {
      if(newView == 'component') {
         _.once($.proxy(this.setData, this), this);
      }
   },
   applyIndicator: function ( ) {
      this.clearCharts();

      var indicator = getState('indicator');
      if(indicator.get('level') == 1) {
         return;
      }
      this.addChartsOf(indicator);
   },
   addChartsOf: function ( indicator ) {
      var childrenList = indicator.childrenList;
      var child, el, view;
      for(var i = 0, l = childrenList ? childrenList.length : 0; i < l; ++i) {
         child = childrenList.at(i);
         this.getChart(child);
         this.addChartsOf(child);
      }
   },
   clearCharts: function ( ) {
      var view;
      for(var code in this._viewsByIndicatorCode) {
         view = this._viewsByIndicatorCode[code];
         this.cacheChart(view);
         view.$el.removeClass('bar-chart-item-selected');
      }
   },
   cacheChart: function ( view ) {
      view.$el.detach();
      delete this._viewsByIndicatorCode[view.$el.data('indicator').get('code')];
      view.$el.removeData('indicator');
      this._cachedCharts.unshift(view);
   },
   getChart: function ( indicator ) {
      var view = this._cachedCharts.shift();
      if(!view) {
         var el = $('<div class="bar-chart-item"></div>');
         view = new SubjectChartItemView( { el: el, indicator: indicator, label: indicator.shortlabel });
         view.setValueType('score');
         if(!('ontouchstart' in window))
         {
            el.mouseenter($.proxy(this.onBarMouseOver, this));
            el.mouseleave($.proxy(this.onBarMouseLeave, this));
         }
         el.click(this.onViewClick);
      } else {
         view.update( { indicator: indicator, label: indicator.label });
      }
      view.$el.data('indicator', indicator);
      this._holder.append(view.$el);
      if(indicator.get('level') == 3) {
         view.$el.addClass('bar-chart-item-primary');
      } else {
         view.$el.removeClass('bar-chart-item-primary');
      }
      this._viewsByIndicatorCode[indicator.get('code')] = view;
      return view;
   },
   setData: function ( ) {
      if(getState('view') != 'component') {
         return;
      }
      var geoitem = getState('data-geoitem');
      var lbl = geoitem ? geoitem.label : null;
      var lblEl = this.$el.find('.component-geoitem-label');
      registerLabel(lblEl, lbl);

      var regionCode = getState('selected-region').get('code');
      var indicator;
      var indicatorList = window.App.get('indicatorFlatList');
      var minVal = 0, maxVal = -Number.MAX_VALUE;
      var val, vo, view, timeseries;
      var geoCode = geoitem ? geoitem.get('code') : null;
      var indicators = [];
      for(var code in this._viewsByIndicatorCode) {
         indicator = indicatorList.getIndicatorByCode(code);
         indicators.push(indicator);
         timeseries = indicator.getTimeseries(regionCode, geoCode);
         vo = timeseries ? timeseries.getValue(timeseries.endDate) : null;
         view = this._viewsByIndicatorCode[code];
         view.clearValues();
         if(vo) {
            val = view.getWeightedValue(vo);
            view.addValue(vo, indicator.get('color'));
         } else {
            val = NaN;
         }
         view.setTotal(val, indicator.get('decimalplaces'));
      }

      var countryList = window.App.get('countryList');
      var country, j, m, ind;
      for(var i = 0, l = countryList.length; i < l; ++i) {
         country = countryList.at(i);
         for(j = 0, m = indicators.length; j < m; ++j) {
            ind = indicators[j];
            timeseries = ind.getTimeseries(regionCode, country.get('code'));
            vo = timeseries ? timeseries.getValue(timeseries.endDate) : null;
            val = vo ? this._viewsByIndicatorCode[ind.get('code')].getWeightedValue(vo) : NaN;
            if(!isNaN(val)) {
               minVal = Math.min(minVal, val);
               maxVal = Math.max(maxVal, val);
            }
         }
      }

      for(code in this._viewsByIndicatorCode) {
         view = this._viewsByIndicatorCode[code];
         view.setRange(minVal, maxVal);
      }

      this.setAxisLabels(minVal, maxVal);

   },
   setAxisLabels: function ( minVal, maxVal ) {
      if(minVal == Number.MAX_VALUE) {
         this._axisComponent.css('display', 'none');
      } else {
         var ind = getState('indicator');
         var dec = parseFloat(ind.get('decimalplaces'));
         var minLabel = formatNumber(minVal, dec, false);
         var maxLabel = formatNumber(maxVal, dec, false);
         var minEl = this._axisComponent.find('.min-val-label');
         var zeroEl = this._axisComponent.find('.zero-val-label');
         var maxEl = this._axisComponent.find('.max-val-label');
         minEl.text(minLabel);

         var zv = formatNumber(0, dec, false);
         if(zv != minLabel)
            zeroEl.text(zv).show();
         else
            zeroEl.hide();

         maxEl.text(maxLabel);

         var zeroLeft = parseFloat(this._axisComponent.css('width')) * ((0 - minVal) / (maxVal - minVal));
         zeroEl.css('left', zeroLeft);
         zeroEl.css('visibility', zeroLeft !== 0 ? 'visible' : 'hidden');
         minEl.css('left', -minEl.width() / 2);
         maxEl.css('right', -maxEl.width() / 2);

         this._axisComponent.css('display', 'block');
      }
   },
   onViewClick: function ( ) {
      var desc = $('.indicator-desc');
      //desc.css('height', desc.height());
      var indicator = $(this).data('indicator');
      setState('data-indicator', indicator);
   },
   onBarMouseOver: function ( ) {
      this._toolTip.show();
   },
   onBarMouseLeave: function ( ) {
      this._toolTip.hide();
   },
   onMouseLeave: function ( ) {
      var desc = $('.indicator-desc');
      if(desc.css('height') == 'auto') {
         return;
      }
      desc.stop();
      var h = desc.height();
      desc.css('height', 'auto');
      var to = desc.height();
      desc.css('height', h);
      desc.animate( { height: to}, 'slow', function ( ) {
         desc.css('height', 'auto');
      });
   },
   setToolTipColor: function ( ) {
      var indicator = getState('indicator');
      if(indicator) {
         this._toolTip.setColor(indicator.get('color'));
      }
   },
   initToolTip: function ( ) {
      this._toolTip = new ToolTip( { el: '.component-chart-tooltip' });
      this._toolTip.setRegistration('bottomLeft');
      this.setToolTipColor();
   },
   toString: function ( ) {
      return this._uid;
   }
});

var HelpButton = Backbone.View.extend ( {
   initialize: function ( ) {
      this.setStyle();
      this.$el.click($.proxy(this.onClick, this));
      bindState('show-help', 'change', $.proxy(this.onShowHelpChange, this));
   },
   render: function ( ) {

   },
   setStyle: function ( ) {
      if(getState('show-help')) {
         this.$el.addClass('show-help-button-active');
      } else {
         this.$el.removeClass('show-help-button-active');
      }
   },
   onClick: function ( ) {
      setState('show-help', !getState('show-help'));
   },
   onMouseOver: function ( ) {

   },
   onMouseOut: function ( ) {

   },
   onShowHelpChange: function ( ) {
      this.setStyle();
   }
});

var HelpView = Backbone.View.extend( {
   initialize: function ( ) {
      this._uid = _.uniqueId();
      bindState('view', 'change', $.proxy(this.onViewChange, this));
      this.$el.click($.proxy(this.onClick, this));
      bindState('show-help', 'change', $.proxy(this.onShowHelpChange, this));
      this.createHelpTexts();
      this.setVisibility();
      if(getState('show-help')) {
         this.setPopUps();
      }
   },
   render: function ( ) {

   },
   createHelpTexts: function ( ) {
      var texts = [
         { id: 'components', labelID: 'TEXT_COMPONENTS', views: [ 'map', 'component' ] },
         { id: 'sort', labelID: 'TEXT_SORT', views: [ 'map', 'component' ] },
         { id: 'regional', labelID: 'TEXT_REGIONAL', views: [ 'map', 'component' ] },
         { id: 'trends', labelID: 'TEXT_TRENDS', views: [ 'map' ] },
         { id: 'scores', labelID: 'TEXT_SCORES', views: [ 'map' ] },
         { id: 'drilldown', labelID: 'TEXT_DRILLDOWN', views: [ 'map' ] },
         { id: 'main-overview', labelID: 'TEXT_MAIN_OVERVIEW', views: [ 'map' ] },
         { id: 'dd-overview', labelID: 'TEXT_DD_OVERVIEW', views: [ 'component' ] },
         { id: 'indicators', labelID: 'TEXT_INDICATORS', views: [ 'component' ] }
      ];
      for(var i = 0, l = texts.length; i < l; ++i) {
         this.addText(texts[i]);
      }
   },
   addText: function ( element ) {
      var el = $('<div class="help-popup"></div>');
      this.$el.append(el);
      var labelList = window.App.get('labelList');
      registerLabel(el, labelList.getLabelByCode(element.labelID));
      el.data('views', element.views);
      el.addClass('help-popup-' + element.id);
   },
   onViewChange: function ( ) {

   },
   onShowHelpChange: function ( ) {
      this.setPopUps();
      this.setVisibility();
   },
   setVisibility: function ( ) {
      var visible = getState('show-help');
      this.$el.css('display', visible ? 'block' : 'none');
   },
   setPopUps: function ( ) {
      var popupList = this.$el.find('.help-popup');
      var popup, views, visible;
      var view = getState('view');
      for(var i = 0, l = popupList.length; i < l; ++i) {
         popup = popupList.eq(i);
         views = popup.data('views');
         visible = _.indexOf(views, view) != -1;
         popup.css('display', visible ? 'block' : 'none');
      }
   },
   onClick: function ( ) {
      setState('show-help', false);
   },
   toString: function ( ) {
      return this._uid;
   }
});

var MovieButton = Backbone.View.extend ( {
   initialize: function ( ) {
      this.$el.click($.proxy(this.onClick, this));
   },
   onClick: function ( ) {
      window.open(this._url, '_blank');
   }
});

var ToolTip = Backbone.View.extend( {
   initialize: function ( ) {
      this._visible = false;
      this._registration = 'bottom';
      this._lockedX = NaN;
      this._lockedY = NaN;
      this.$el.append($('<div class="tooltip-pointer"></div>'));
      this.$el.hide();
   },
   render: function ( ) {

   },
   show: function ( ) {
      if(!this._visible) {
         this._visible = true;
         this.$el.show();
         this.enableMouseFollow();
      }
   },
   hide: function ( ) {
      if(this._visible) {
         this._visible = false;
         this.performHide();
      }
   },
   performHide: function ( ) {
      this._timeoutId = -1;
      this.$el.hide();
      this.disableMouseFollow();
   },
   enableMouseFollow: function ( ) {
      $(window).mousemove($.proxy(this.onMouseMove, this));
   },
   disableMouseFollow: function ( ) {
      $(window).unbind('mousemove', $.proxy(this.onMouseMove, this));
   },
   onMouseMove: function ( evt ) {
      var parent = this.$el.parent();
      var x = evt.pageX - parent.offset().left;
      var y = evt.pageY - parent.offset().top;
      this.positionToolTip(x, y);
   },
   positionToolTip: function ( x, y ) {
      if(!isNaN(this._lockedX)) {
         x = this._lockedX;
      }
      if(!isNaN(this._lockedY)) {
         y = this._lockedY;
      }

      var registration = this._registration.toLowerCase();
      var match = registration.match(/left|center|right/);
      var hor = match ? match[0] : 'center';
      match = registration.match(/top|center|bottom/);
      var ver = match ? match[0] : 'center';
      var width = this.$el.outerWidth(true), height = this.$el.outerHeight(true);
      var ml = parseFloat(this.$el.css('marginLeft')), mt = parseFloat(this.$el.css('marginTop')), mr = parseFloat(this.$el.css('marginRight')), mb = parseFloat(this.$el.css('marginBottom'));

      if(!PointerEventsPolyFill.isSupported()) {
         //mt = Math.max(mt, 10);
         //mb = Math.max(mb, 10);
      }

      switch(hor) {
         case 'left':
         x += mr;
         break;

         case 'center':
         x -= width / 2;
         break;

         case 'right':
         x -= width + mr;
         break;
      }

      switch(ver) {
         case 'top':
         y += mb;
         break;

         case 'center':
         y -= height/2;
         break;

         case 'bottom':
         y -= height + mb;
         break;
      }


      this.$el.css('top', y + 'px');
      this.$el.css('left', x + 'px');
   },
   lockPosition: function ( x, y ) {
      this._lockedX = x;
      this._lockedY = y;
      this.positionToolTip();
   },
   setRegistration: function ( registration ) {
      this._registration = registration;
   },
   setColor: function ( color ) {
      this.$el.css('background-color', color);
      var pointer = this.$el.find('.tooltip-pointer');
      var sides = ['top', 'right', 'bottom', 'left'];
      var side, borderColor;
      for(var i = 0, l = sides.length; i < l; ++i ){
         side = 'border-'+sides[i]+'-color';
         borderColor = pointer.css(side);
         pointer.css(side, 'transparent');
         if(pointer.css(side) !== borderColor) {
            pointer.css(side, color);
         }
      }
   }
});
