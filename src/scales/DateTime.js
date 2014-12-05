goog.provide('anychart.scales.DateTime');

goog.require('anychart.enums');
goog.require('anychart.scales.DateTimeTicks');
goog.require('anychart.scales.ScatterBase');



/**
 * Define Datetime scale.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.dateTime}.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.DateTime = function() {
  goog.base(this);
  /**
   * Major ticks for the scale.
   * @type {anychart.scales.DateTimeTicks}
   * @protected
   */
  this.ticksObj = null;

  /**
   * Minor ticks of the scale.
   * @type {anychart.scales.DateTimeTicks}
   * @protected
   */
  this.minorTicksObj = null;

  goog.base(this);
};
goog.inherits(anychart.scales.DateTime, anychart.scales.ScatterBase);


/** @inheritDoc */
anychart.scales.DateTime.prototype.isMissing = function(value) {
  return isNaN(anychart.utils.normalizeTimestamp(value));
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.getType = function() {
  return anychart.enums.ScaleTypes.DATE_TIME;
};


/**
 * Getter for set of scale ticks in terms of data values.
 * @return {!anychart.scales.DateTimeTicks} An instance of {@link anychart.scales.DateTimeTicks} class for method chaining.
 *//**
 * Setter for set of scale ticks in terms of data values.
 * @example
 * var chart = anychart.financial();
 * chart.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks([1188172800000, 1188432000000, 1188604800000]);
 * chart.container(stage).draw();
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!anychart.scales.DateTime} An instance of {@link anychart.scales.DateTime} class for method chaining.
 *//**
 * @ignoreDoc
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.DateTime|anychart.scales.DateTimeTicks)} Ticks or itself for chaining.
 */
anychart.scales.DateTime.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = new anychart.scales.DateTimeTicks(this);
    this.registerDisposable(this.ticksObj);
    this.ticksObj.listenSignals(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.ticksObj.setup(opt_value);
    return this;
  }
  return this.ticksObj;
};


/**
 * Getter for set of scale ticks in terms of data values.
 * @return {!anychart.scales.DateTimeTicks} An instance of {@link anychart.scales.DateTimeTicks} class for method chaining.
 *//**
 * Setter for set of scale ticks in terms of data values.
 * @example
 * var chart = anychanychart.financial* chart.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale().ticks().interval('P3D');
 * chart.xScale().minorTicks([1188172800000, 1188432000000, 1188604800000]);
 * chart.container(stage).draw();
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!anychart.scales.DateTime} An instance of {@link anychart.scales.DateTime} class for method chaining.
 *//**
 * @ignoreDoc
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.DateTime|anychart.scales.DateTimeTicks)} Ticks or itself for chaining.
 */
anychart.scales.DateTime.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicksObj) {
    this.minorTicksObj = new anychart.scales.DateTimeTicks(this);
    this.registerDisposable(this.minorTicksObj);
    this.minorTicksObj.listenSignals(this.ticksInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.minorTicksObj.setup(opt_value);
    return this;
  }
  return this.minorTicksObj;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.extendDataRange = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    goog.base(this, 'extendDataRange', anychart.utils.normalizeTimestamp(arguments[i]));
  }
  return this;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.transform = function(value, opt_subRangeRatio) {
  return goog.base(this, 'transform', anychart.utils.normalizeTimestamp(value), opt_subRangeRatio);
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.inverseTransform = function(ratio) {
  return Math.round(goog.base(this, 'inverseTransform', ratio));
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.calculate = function() {
  if (this.consistent) return;

  goog.base(this, 'calculate');

  var newRange = this.ticks().setupAsMajor(this.min, this.max, this.minimumModeAuto, this.maximumModeAuto);
  this.minorTicks().setupAsMinor(this.min, this.max, newRange[0], newRange[1]);
  // adjusting range AFTER minors calc to avoid range selection change
  if (this.minimumModeAuto)
    this.min = newRange[0];
  if (this.maximumModeAuto)
    this.max = newRange[1];

  this.range = this.max - this.min;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.getCategorisation = function() {
  return true;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.DateTime.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  return json;
};


/** @inheritDoc */
anychart.scales.DateTime.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for DateTime scale.
 * @example
 * var chart = anychart.financialChart();
 * chart.ohlc([
 *   [new Date('28-Aug-07'), 511.53, 514.98, 505.79, 506.40],
 *   [new Date('29-Aug-07'), 507.84, 513.30, 507.23, 512.88],
 *   [new Date('30-Aug-07'), 512.36, 515.40, 510.58, 511.40],
 *   [new Date('31-Aug-07'), 513.10, 516.50, 511.47, 515.25],
 *   [new Date('01-Sep-07'), 515.02, 528.00, 514.62, 525.15]
 * ]);
 * chart.xScale(anychart.scales.dateTime());
 * chart.container(stage).draw();
 * @return {anychart.scales.DateTime} DateTime scale.
 */
anychart.scales.dateTime = function() {
  return new anychart.scales.DateTime();
};


//exports
goog.exportSymbol('anychart.scales.dateTime', anychart.scales.dateTime);//doc|ex
anychart.scales.DateTime.prototype['ticks'] = anychart.scales.DateTime.prototype.ticks;//doc|ex
anychart.scales.DateTime.prototype['minorTicks'] = anychart.scales.DateTime.prototype.minorTicks;//doc|ex
anychart.scales.DateTime.prototype['transform'] = anychart.scales.DateTime.prototype.transform;//inherited
anychart.scales.DateTime.prototype['extendDataRange'] = anychart.scales.DateTime.prototype.extendDataRange;//inherited
