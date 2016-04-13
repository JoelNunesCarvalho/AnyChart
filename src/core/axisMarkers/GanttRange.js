goog.provide('anychart.core.axisMarkers.GanttRange');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.axisMarkers.PathBase');
goog.require('anychart.enums');



/**
 * Gantt range marker.
 * @param {anychart.scales.GanttDateTime} scale - Gantt date times cale.
 * @constructor
 * @extends {anychart.core.axisMarkers.PathBase}
 */
anychart.core.axisMarkers.GanttRange = function(scale) {
  anychart.core.axisMarkers.GanttRange.base(this, 'constructor');

  this.scaleInternal(scale);

  /**
   * @type {anychart.core.axisMarkers.PathBase.Range}
   */
  this.val = {from: 0, to: 0};

  /**
   * @type {string|acgraph.vector.Fill}
   * @private
   */
  this.fill_;

};
goog.inherits(anychart.core.axisMarkers.GanttRange, anychart.core.axisMarkers.PathBase);


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.GanttRange.prototype.SUPPORTED_SIGNALS =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.GanttRange.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES;


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set layout.
 * @param {anychart.enums.Layout=} opt_value - RangeMarker layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.GanttRange} - Layout or this.
 */
anychart.core.axisMarkers.GanttRange.prototype.layout = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == anychart.enums.Layout.HORIZONTAL)
      anychart.utils.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_LAYOUT);
    return this;
  }
  return /** @type {anychart.enums.Layout} */ (anychart.enums.Layout.VERTICAL);
};


/**
 * Does nothing.
 * @param {anychart.enums.Layout} value - Layout value.
 */
anychart.core.axisMarkers.GanttRange.prototype.setDefaultLayout = function(value) {};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for scale.
 * @param {anychart.scales.GanttDateTime=} opt_value Scale.
 * @return {anychart.scales.GanttDateTime|!anychart.core.axisMarkers.GanttRange} - Scale or itself for method chaining.
 */
anychart.core.axisMarkers.GanttRange.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.utils.warning(anychart.enums.WarningCode.IMMUTABLE_MARKER_SCALE);
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime} */ (this.scaleInternal());
};


//----------------------------------------------------------------------------------------------------------------------
//  Settings.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set range marker fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.core.axisMarkers.GanttRange)} .
 */
anychart.core.axisMarkers.GanttRange.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_ || 'none';
};


/**
 * Deos nothing.
 * @param {acgraph.vector.Fill} value - Default fill value.
 */
anychart.core.axisMarkers.GanttRange.prototype.setDefaultFill = function(value) {};


/**
 * Get/set starting marker value.
 * @param {(number|anychart.enums.GanttDateTimeMarkers)=} opt_newValue - RangeMarker value settings.
 * @return {number|anychart.enums.GanttDateTimeMarkers|anychart.core.axisMarkers.GanttRange} - RangeMarker value
 *  settings or RangeMarker instance for method chaining.
 */
anychart.core.axisMarkers.GanttRange.prototype.from = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.val.from != opt_newValue) {
      this.val.from = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }

  return /** @type {number|anychart.enums.GanttDateTimeMarkers} */ (this.val.from);
};


/**
 * Get/set ending marker value.
 * @param {(number|anychart.enums.GanttDateTimeMarkers)=} opt_newValue RangeMarker value settings.
 * @return {number|anychart.enums.GanttDateTimeMarkers|anychart.core.axisMarkers.GanttRange} RangeMarker value settings or
 *  RangeMarker instance for method chaining.
 */
anychart.core.axisMarkers.GanttRange.prototype.to = function(opt_newValue) {
  if (goog.isDef(opt_newValue)) {
    if (this.val.to != opt_newValue) {
      this.val.to = opt_newValue;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }

  return /** @type {number|anychart.enums.GanttDateTimeMarkers} */ (this.val.to);
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
anychart.core.axisMarkers.GanttRange.prototype.boundsInvalidated = function() {
  this.drawRange();
};


/**
 * @inheritDoc
 */
anychart.core.axisMarkers.GanttRange.prototype.appearanceInvalidated = function() {
  this.markerElement().stroke(null).fill(/** @type {acgraph.vector.Fill} */(this.fill()));
};


//----------------------------------------------------------------------------------------------------------------------
//  Disposing.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.GanttRange.prototype.disposeInternal = function() {
  delete this.fill_;
  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.axisMarkers.GanttRange.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['from'] = this.from();
  json['to'] = this.to();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill} */(this.fill()));
  if (this.layout_) json['layout'] = this.layout_;
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.GanttRange.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.from(config['from']);
  this.to(config['to']);
  this.fill(config['fill']);
};


//exports
anychart.core.axisMarkers.GanttRange.prototype['from'] = anychart.core.axisMarkers.GanttRange.prototype.from;
anychart.core.axisMarkers.GanttRange.prototype['to'] = anychart.core.axisMarkers.GanttRange.prototype.to;
anychart.core.axisMarkers.GanttRange.prototype['scale'] = anychart.core.axisMarkers.GanttRange.prototype.scale;
anychart.core.axisMarkers.GanttRange.prototype['layout'] = anychart.core.axisMarkers.GanttRange.prototype.layout;
anychart.core.axisMarkers.GanttRange.prototype['fill'] = anychart.core.axisMarkers.GanttRange.prototype.fill;
anychart.core.axisMarkers.GanttRange.prototype['isHorizontal'] = anychart.core.axisMarkers.GanttRange.prototype.isHorizontal;
