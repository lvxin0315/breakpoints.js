var Reusables = Reusables || {};
Reusables.Breakpoints = (function ($) {

  var Breakpoint = function ($elements, range, options) {
    this.$elements = $elements;
    this.range = range;
    this.options = options;

    // set elements
    this.elements = (function () {
      var isFunction = typeof $elements === 'function';
      var isString = typeof $elements === 'string';
      var isJQuery = $elements instanceof jQuery;
      var hasSelector = isJQuery && !!$elements.selector;
      var elements;

      if (isFunction) {
        elements = $elements;
      } else if (isString) {
        elements = function () { return $($elements); };
      } else if (isJQuery && hasSelector) {
        elements = function () { return $($elements.selector); };
      } else if (isJQuery) {
        elements = function () { return $elements; };
      } else {
        // ...
      }

      return elements;
    })();

    // set range
    this.min = range[0] || 0;
    this.max = range[1] || Infinity;

    // set name
    this.name = (function (name, min, max) {
      if (name) {
        return name;
      }

      // default to breakpoint-{min}-{max}
      max = max === Infinity ? 'up' : max;
      return ['breakpoint', min, max].join('-');
    })(options.name, this.min, this.max);

    // set enter
    if (typeof options.enter === 'function') {
      this.enter = options.enter;
    } else {
      this.enter = function () {};
    }

    // set exit
    if (typeof options.exit === 'function') {
      this.exit = options.exit;
    } else {
      this.exit = function () {};
    }

    return this;
  };

  Breakpoint.prototype.evaluate = function () {
    var breakpoint = this;
    breakpoint.elements().each(function (index, element) {
      var $element = $(element);
      var width = $element.outerWidth();
      var matchNow = breakpoint.min <= width && width < breakpoint.max;
      var matchBefore = $element.data(breakpoint.name) || false;
      var change = matchNow !== matchBefore;
      $element.data(breakpoint.name, matchNow);
      var entering = change && matchNow;
      var exiting = change && !matchNow;
      if (entering) {
        $element.addClass(breakpoint.name);
        breakpoint.enter($element);
      } else if (exiting) {
        $element.removeClass(breakpoint.name);
        breakpoint.exit($element);
      }
    });
  };



  /* PUBLIC */

  var Breakpoints = {};

  var Builder = function ($elements) {
    this.$elements = $elements;
  };

  Breakpoints.on = function ($elements) {
    return new Builder($elements);
  };

  /* functions that rely on private breakpoints array - want to keep that isolated */
  (function () {
    var breakpoints = [];
    Builder.prototype.define = function (range, options) {
      breakpoints.push(new Breakpoint(this.$elements, range, options));
      return this;
    };

    Breakpoints.evaluate = function () {
      var length = breakpoints.length;
      for (var i; i < length; i++) {
        breakpoints[i].evaluate();
      }
    };

  })();

  /* bind events */
  $(document).on('ready.reusables.breakpoints', Breakpoints.evaluate);
  $(window).on('resize.reusables.breakpoints', Breakpoints.evaluate);

  return Breakpoints;

})(jQuery);
