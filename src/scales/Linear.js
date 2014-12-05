goog.provide('anychart.scales.Linear');

goog.require('anychart.enums');
goog.require('anychart.scales.ScatterBase');
goog.require('anychart.scales.ScatterTicks');



/**
 * Represents simple linear scale that transforms values from domain [a, b] to domain [0, 1].
 * Note that a can be greater than b. The only condition for the scale is that a != b.<br/>
 * <b>Note:</b> To create instance use method {@link anychart.scales.linear}.
 * @constructor
 * @extends {anychart.scales.ScatterBase}
 */
anychart.scales.Linear = function() {
  /**
   * Major ticks for the scale.
   * @type {anychart.scales.ScatterTicks}
   * @protected
   */
  this.ticksObj = null;

  /**
   * Minor ticks of the scale.
   * @type {anychart.scales.ScatterTicks}
   * @protected
   */
  this.minorTicksObj = null;

  this.canBeStacked = true;

  /**
   * Log base value. Used mostly for ticks calculation, because it doesn't affect transformation results.
   * This value is declared here to avoid calculate() method override.
   * @type {number}
   * @protected
   */
  this.logBaseVal = 10;

  goog.base(this);
};
goog.inherits(anychart.scales.Linear, anychart.scales.ScatterBase);


/** @inheritDoc */
anychart.scales.Linear.prototype.getType = function() {
  return anychart.enums.ScaleTypes.LINEAR;
};


/**
 * Getter for set of scale ticks in terms of data values.
 * @return {!anychart.scales.ScatterTicks} Current ticks.
 *//**
 * Setter for set of scale ticks in terms of data values.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.9]);
 * chart.yScale().ticks([-1, 1, 3, 5]);
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!anychart.scales.Linear} An instance of {@link anychart.scales.Linear} class for method chaining.
 *//**
 * @ignoreDoc
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.Linear.prototype.ticks = function(opt_value) {
  if (!this.ticksObj) {
    this.ticksObj = this.createTicks();
  }
  if (goog.isDef(opt_value)) {
    this.ticksObj.setup(opt_value);
    return this;
  }
  return this.ticksObj;
};


/**
 * Getter for set of scale minor ticks in terms of data values.
 * @return {!anychart.scales.ScatterTicks} Current ticks.
 *//**
 * Setter for set of scale minor ticks in terms of data values.
 * @example <t>lineChart</t>
 * chart.line([1.1, 1.4, 1.2, 1.9]);
 * chart.yScale().minorTicks([1.1, 1.15, 1.2, 1.3]);
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!anychart.scales.Linear} An instance of {@link anychart.scales.Linear} class for method chaining.
 *//**
 * @ignoreDoc
 * Gets or sets a set of scale ticks in terms of data values.
 * @param {!Array=} opt_value An array of ticks to set.
 * @return {!(anychart.scales.Linear|anychart.scales.ScatterTicks)} Ticks or itself for method chaining.
 */
anychart.scales.Linear.prototype.minorTicks = function(opt_value) {
  if (!this.minorTicksObj) {
    this.minorTicksObj = this.createTicks();
    this.minorTicksObj.suspendSignalsDispatching();
    this.minorTicksObj.count(5);
    this.minorTicksObj.resumeSignalsDispatching(false);
  }
  if (goog.isDef(opt_value)) {
    this.minorTicksObj.setup(opt_value);
    return this;
  }
  return this.minorTicksObj;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.calculate = function() {
  if (this.consistent) return;

  goog.base(this, 'calculate');

  var setupResult = this.ticks().setupAsMajor(this.min, this.max, this.minimumModeAuto, this.maximumModeAuto, this.logBaseVal);

  if (this.minimumModeAuto)
    this.min = setupResult[0]; // new min

  if (this.maximumModeAuto)
    this.max = setupResult[1]; // new max

  this.minorTicks().setupAsMinor(this.ticks().get(), this.logBaseVal, setupResult[2], setupResult[3]);

  this.range = this.max - this.min;
};


/**
 * Ticks invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.scales.Linear.prototype.ticksInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.consistent = false;
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


/**
 * Create scale ticks.
 * @return {!anychart.scales.ScatterTicks}
 * @protected
 */
anychart.scales.Linear.prototype.createTicks = function() {
  var ticks = new anychart.scales.ScatterTicks(this);
  this.registerDisposable(ticks);
  ticks.listenSignals(this.ticksInvalidated_, this);
  return ticks;
};


//----------------------------------------------------------------------------------------------------------------------
//  Serialize & Deserialize
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.scales.Linear.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['ticks'] = this.ticks().serialize();
  json['minorTicks'] = this.minorTicks().serialize();
  json['stackMode'] = this.stackMode();
  return json;
};


/** @inheritDoc */
anychart.scales.Linear.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.ticks(config['ticks']);
  this.minorTicks(config['minorTicks']);
  this.stackMode(config['stackMode']);
};


//----------------------------------------------------------------------------------------------------------------------
//  Shortcut functions
//----------------------------------------------------------------------------------------------------------------------
/**
 * Constructor function for linear scale.
 * @example <t>lineChart</t>
 * chart.line([
 *    ['A1', 1.1],
 *    ['A2', 1.4],
 *    ['A3', 1.2],
 *    ['A4', 1.9]
 * ]);
 * chart.yScale(anychart.scales.linear());
 * @return {anychart.scales.Linear} Linear scale.
 */
anychart.scales.linear = function() {
  return new anychart.scales.Linear();
};


//exports
goog.exportSymbol('anychart.scales.linear', anychart.scales.linear);//doc|ex
anychart.scales.Linear.prototype['ticks'] = anychart.scales.Linear.prototype.ticks;//doc|ex
anychart.scales.Linear.prototype['minorTicks'] = anychart.scales.Linear.prototype.minorTicks;//doc|ex
anychart.scales.Linear.prototype['stackMode'] = anychart.scales.Linear.prototype.stackMode;//inherited
