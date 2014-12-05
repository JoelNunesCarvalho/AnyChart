goog.provide('anychart.palettes.RangeColors');
goog.require('anychart.color');
goog.require('anychart.core.Base');
goog.require('goog.array');
goog.require('goog.color');



/**
 * Gradient palette.
 * @example <t>simple-h100</t>
 * var palette = anychart.utils.rangeColorPalette()
 *     .colors(['red', 'yellow'])
 *     .count(9);
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *     .fill(palette.colorAt(i))
 *     .stroke('1px #000');
 * }
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.palettes.RangeColors = function() {
  goog.base(this);

  /**
   * Color palette colors list.
   * @type {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
   * Array.<acgraph.vector.GradientKey>|Array.<string>}
   * @private
   */
  this.colors_ = null;


  /**
   * Color palette colors count.
   * @type {number}
   * @private
   */
  this.count_ = NaN;

  /**
   * Color palette.
   * @type {Array.<acgraph.vector.SolidFill>}
   * @private
   */
  this.colorPalette_ = [];

  this.restoreDefaults(true);
};
goog.inherits(anychart.palettes.RangeColors, anychart.core.Base);


/**
 * Signal mask.
 * @type {number}
 */
anychart.palettes.RangeColors.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Color palette.
 * @type {Array.<acgraph.vector.SolidFill>}
 * @private
 */
anychart.palettes.RangeColors.prototype.colorPalette_;


/**
 * Getter for the color palette colors list.
 * @return {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>} Color palette colors list.
 *//**
 * Setter for color palette colors list.
 * @example <t>listingOnly</t>
 * var palette = anychart.utils.rangeColorPalette()
 *      .colors(['red', 'yellow'])
 *      .count(10);
 * @param {(Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>)=} opt_value Color palette colors list to set.
 * @return {!anychart.palettes.RangeColors} An instance of the {@link anychart.palettes.RangeColors} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>)=} opt_value .
 * @return {Array.<acgraph.vector.SolidFill>|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient|
 * Array.<acgraph.vector.GradientKey>|Array.<string>|anychart.palettes.RangeColors} .
 */
anychart.palettes.RangeColors.prototype.colors = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.colors_ = opt_value;
    this.processColorRange_();
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    return this.colors_;
  }
};


/**
 * Getter for color palette colors counts.
 * @return {number} Current color palette colors count.
 *//**
 * Setter for color palette's colors counts.<br/>
 * <b>Note:</b> Defines how many steps we need in gradient.
 * @param {number=} opt_value [NaN] Color palette colors counts.
 * @return {!anychart.palettes.RangeColors} An instance of the {@link anychart.palettes.RangeColors} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {number|anychart.palettes.RangeColors} .
 */
anychart.palettes.RangeColors.prototype.count = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.count_ != opt_value) {
      this.count_ = opt_value;
      this.processColorRange_();
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  } else {
    return this.count_;
  }
};


/**
 * Getter for color palette colors from list by index.
 * @param {number} index Index to set or get color.
 * @return {acgraph.vector.SolidFill|anychart.palettes.RangeColors} Color palette colors by index.
 *//**
 * Setter for color palette colors from list by index.
 * @example <t>simple-h100</t>
 * var palette = anychart.utils.rangeColorPalette()
 *     .colors(['red', 'yellow'])
 *     .count(9);
 * palette.colorAt(4, 'blue');
 * for (var i = 1; i < 10; i++) {
 *   stage.rect((i - 1) * stage.width() / 9, 0, stage.width() / 9 - .5, stage.height())
 *     .fill(palette.colorAt(i))
 *     .stroke('1px #000');
 * }
 * @param {number} index Index to set or get color.
 * @param {acgraph.vector.SolidFill=} opt_color Color to set by passed index.
 * @return {!anychart.palettes.RangeColors} An instance of the {@link anychart.palettes.RangeColors} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number} index .
 * @param {acgraph.vector.SolidFill=} opt_color .
 * @return {acgraph.vector.SolidFill|anychart.palettes.RangeColors} .
 */
anychart.palettes.RangeColors.prototype.colorAt = function(index, opt_color) {
  if (!this.colors_ || this.colors_.length < 1) return null;
  if (this.count_ == 0) return null;

  if (goog.isDef(opt_color)) {
    this.colorPalette_[index] = opt_color;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    return this;
  } else {
    if (index > this.count_ - 1) index = this.count_ - 1;
    if (index < 0) index = 0;
    var color = /**@type {acgraph.vector.SolidFill} */(this.colorPalette_[index]);
    return color ? color : null;
  }
};


/**
 * Palette processing.
 * @private
 */
anychart.palettes.RangeColors.prototype.processColorRange_ = function() {
  if (this.colors_ && this.count_ != 0) {
    var gradientKeys = [];
    var colors = goog.isArray(this.colors_) ? this.colors_ : this.colors_.keys;
    if (!goog.isArray(colors) || colors.length == 0) return;
    if (isNaN(this.count_)) this.count_ = colors.length;


    var offsetStep = 1 / (colors.length - 1), color;
    for (var i = 0; i < colors.length; i++) {
      var colorItem = colors[i];
      if (goog.isString(colorItem)) {
        color = anychart.color.parseColor(colorItem);
        gradientKeys.push(
            {
              'color': color ? color.hex : '#000000',
              'offset': i * offsetStep
            }
        );
      } else {
        color = anychart.color.parseColor(colorItem.color);
        gradientKeys.push(
            {
              'color': color ? color.hex : '#000000',
              'offset': goog.isDef(colorItem.offset) ? colorItem.offset : i * offsetStep
            }
        );
      }
    }

    goog.array.sortObjectsByKey(gradientKeys, 'offset');

    this.colorPalette_ = [];

    if (gradientKeys.length == 1) {
      for (i = 0; i < this.count_; i++)
        this.colorPalette_[i] = {'color': gradientKeys[0].color};
    } else {
      for (i = 0; i < this.count_; i++) {
        var indexOffset = this.count_ == 1 ? 0 : i / (this.count_ - 1);

        var leftLimit = null;
        var rightLimit = null;

        for (var j = 0; j < gradientKeys.length; j++) {
          if (indexOffset >= gradientKeys[j].offset) {
            leftLimit = gradientKeys[j];
          }

          if (indexOffset <= gradientKeys[j].offset) {
            if (rightLimit == null) rightLimit = gradientKeys[j];
          }
        }

        if (!leftLimit) leftLimit = gradientKeys[0];
        if (!rightLimit) rightLimit = gradientKeys[gradientKeys.length - 1];

        if (rightLimit.offset == leftLimit.offset) {
          this.colorPalette_[i] = {'color': leftLimit.color};
        } else {
          var pos = 1 - (indexOffset - leftLimit.offset) / (rightLimit.offset - leftLimit.offset);
          this.colorPalette_[i] = {
            'color': goog.color.rgbArrayToHex(goog.color.blend(goog.color.hexToRgb(leftLimit.color), goog.color.hexToRgb(rightLimit.color), pos))
          };
        }
      }
    }
  }
};


/**
 * Restore color palette default settings.
 * @param {boolean=} opt_doNotDispatch Define, should dispatch invalidation event after default settings will be restored.
 */
anychart.palettes.RangeColors.prototype.restoreDefaults = function(opt_doNotDispatch) {
  this.count_ = NaN;
  this.colors_ = [
    '#1D8BD1',
    '#F1683C',
    '#2AD62A',
    '#DBDC25',
    '#8FBC8B',
    '#D2B48C',
    '#FAF0E6',
    '#20B2AA',
    '#B0C4DE',
    '#DDA0DD',
    '#9C9AFF',
    '#9C3063',
    '#FFFFCE',
    '#CEFFFF',
    '#630063',
    '#FF8284',
    '#0065CE',
    '#CECFFF',
    '#000084',
    '#FF00FF',
    '#FFFF00',
    '#00FFFF',
    '#840084',
    '#840000',
    '#008284',
    '#0000FF',
    '#00CFFF',
    '#CEFFFF',
    '#CEFFCE',
    '#FFFF9C',
    '#9CCFFF',
    '#FF9ACE',
    '#CE9AFF',
    '#FFCF9C',
    '#3165FF',
    '#31CFCE',
    '#9CCF00',
    '#FFCF00',
    '#FF9A00',
    '#FF6500'
  ];
  this.processColorRange_();
  if (opt_doNotDispatch) this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['type'] = 'range';
  var res = [];
  for (var i = 0; i < this.colors_.length; i++) {
    res.push(anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.colors_[i])));
  }
  json['colors'] = res;
  json['count'] = this.count_;
  return json;
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.setupSpecial = function(var_args) {
  var args = arguments;
  if (args[0] instanceof anychart.palettes.RangeColors) {
    this.colors(args[0].colors());
    this.count(args[0].count());
    return true;
  }
  if (goog.isArray(args[0])) {
    this.colors(args[0]);
    this.count(args[0].length);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, args);
};


/** @inheritDoc */
anychart.palettes.RangeColors.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.colors(config['colors']);
  this.count(config['count']);
};


/**
 * Constructor function.
 * @return {!anychart.palettes.RangeColors}
 */
anychart.palettes.rangeColors = function() {
  return new anychart.palettes.RangeColors();
};


//exports
goog.exportSymbol('anychart.palettes.rangeColors', anychart.palettes.rangeColors);
anychart.palettes.RangeColors.prototype['colorAt'] = anychart.palettes.RangeColors.prototype.colorAt;//in docs/
anychart.palettes.RangeColors.prototype['colors'] = anychart.palettes.RangeColors.prototype.colors;//in docs/
anychart.palettes.RangeColors.prototype['count'] = anychart.palettes.RangeColors.prototype.count;//in docs/
