//region Provide / Require
goog.provide('anychart.sankeyModule.Chart');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.data.Set');
goog.require('anychart.sankeyModule.elements.Dropoff');
goog.require('anychart.sankeyModule.elements.Flow');
goog.require('anychart.sankeyModule.elements.Node');
//endregion
//region Constructor



/**
 * Sankey chart class.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 */
anychart.sankeyModule.Chart = function() {
  anychart.sankeyModule.Chart.base(this, 'constructor');
  this.setType(anychart.enums.ChartTypes.SANKEY);

  this.bindHandlersToComponent(this,
      this.handleMouseOverAndMove,    // override from anychart.core.Chart
      this.handleMouseOut,            // override from anychart.core.Chart
      this.handleMouseClick_,         // click handler
      this.handleMouseOverAndMove,    // override from anychart.core.Chart
      null,                           // all handler
      this.handleMouseDown);          // anychart.core.Chart

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.sankeyModule.Chart.OWN_DESCRIPTORS_META);
};
goog.inherits(anychart.sankeyModule.Chart, anychart.core.SeparateChart);


//endregion
//region ConsistencyStates / Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.sankeyModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.sankeyModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.SANKEY_DATA |
    anychart.ConsistencyState.APPEARANCE;


//endregion
//region Properties
/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.sankeyModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'nodeWidth', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'nodePadding', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'curveFactor', anychart.core.settings.ratioNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.sankeyModule.Chart, anychart.sankeyModule.Chart.OWN_DESCRIPTORS);


/**
 * Descriptors meta.
 * @type {!Array.<Array>}
 */
anychart.sankeyModule.Chart.OWN_DESCRIPTORS_META = (function() {
  return [
    ['nodeWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['nodePadding', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['curveFactor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW]
  ];
})();


//endregion
//region Data
/**
 * Sets data for sankey chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 */
anychart.sankeyModule.Chart.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) this.title(title);
      if (opt_value['rows']) opt_value = opt_value['rows'];
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.data_);
      this.iterator_ = null;
      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = opt_value.derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = opt_value.mapAs();
      else
        this.data_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.SANKEY_DATA, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.sankeyModule.Chart.prototype.dataInvalidated_ = function(e) {
  this.invalidate(anychart.ConsistencyState.SANKEY_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.sankeyModule.Chart.prototype.getDetachedIterator = function() {
  return this.data_.getIterator();
};


/**
 * Returns new data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.sankeyModule.Chart.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


/**
 * Returns current data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.sankeyModule.Chart.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/**
 * Checks if value is missing.
 * @param {*} from From value to check.
 * @param {*} to To value to check.
 * @param {*} flow Flow value to check.
 * @return {boolean} Is point missing.
 * @private
 */
anychart.sankeyModule.Chart.prototype.isMissing_ = function(from, to, flow) {
  var valueMissing = !(goog.isNumber(flow) && flow > 0);
  var fromMissing = !(goog.isString(from) && from.length > 0);
  var toMissing = !goog.isNull(to) && !(goog.isString(to) && to.length > 0);
  return valueMissing && fromMissing && toMissing;
};


//endregion
//region Infrastructure
/**
 * @typedef {{
 *   id: (number|undefined),
 *   name: !string,
 *   level: !number,
 *   weight: (number|undefined),
 *   incomeValue: !number,
 *   outcomeValue: !number,
 *   dropoffValue: !number,
 *   incomeNodes: !Array.<anychart.sankeyModule.Chart.Node>,
 *   outcomeNodes: !Array.<anychart.sankeyModule.Chart.Node>,
 *   incomeValues: !Array.<number>,
 *   outcomeValues: !Array.<number>,
 *   dropoffValues: !Array.<number>,
 *   incomeCoords: Array.<{x: number, y1: number, y2: number}>,
 *   outcomeCoords: Array.<{x: number, y1: number, y2: number}>,
 *   incomeFlows: Array.<anychart.sankeyModule.Chart.Flow>,
 *   outcomeFlows: Array.<anychart.sankeyModule.Chart.Flow>,
 *   conflict: boolean,
 *   top: (number|undefined),
 *   right: (number|undefined),
 *   bottom: (number|undefined),
 *   left: (number|undefined)
 * }}
 */
anychart.sankeyModule.Chart.Node;


/**
 * @typedef {{
 *   dataIndex: number,
 *   from: anychart.sankeyModule.Chart.Node,
 *   to: ?anychart.sankeyModule.Chart.Node,
 *   weight: number,
 * }}
 */
anychart.sankeyModule.Chart.Flow;


/**
 * @typedef {{
 *   nodes: Array.<anychart.sankeyModule.Chart.Node>,
 *   weightsSum: number,
 *   top: number
 * }}
 */
anychart.sankeyModule.Chart.Level;


/**
 * Update node levels
 * @param {anychart.sankeyModule.Chart.Node} fromNode
 */
anychart.sankeyModule.Chart.prototype.shiftNodeLevels = function(fromNode) {
  var toNodes = fromNode.outcomeNodes;
  for (var i = 0; i < toNodes.length; i++) {
    var toNode = toNodes[i];
    if (fromNode.level <= toNode.level) {
      toNode.level = fromNode.level + 1;
      this.shiftNodeLevels(toNode);
    }
  }
};


/**
 * Creates flow.
 * @param {anychart.sankeyModule.Chart.Node} fromNode
 * @param {anychart.sankeyModule.Chart.Node} toNode
 * @param {number} flow
 */
anychart.sankeyModule.Chart.prototype.createFlow = function(fromNode, toNode, flow) {
  var index = this.getIterator().getIndex();
  this.flows[index] = {
    dataIndex: index,
    from: fromNode,
    to: toNode,
    weight: flow
  };
  if (toNode === null) {
    this.createDropOffFlow(fromNode, flow);
  } else {
    fromNode.outcomeFlows.push(this.flows[index]);
    fromNode.outcomeValue += flow;
    fromNode.outcomeValues.push(flow);
    fromNode.outcomeNodes.push(toNode);

    toNode.incomeValue += flow;
    toNode.incomeValues.push(flow);
    toNode.incomeNodes.push(fromNode);
    toNode.incomeFlows.push(this.flows[index]);
    if (fromNode.level >= toNode.level) {
      toNode.level = fromNode.level + 1;
      this.shiftNodeLevels(toNode);
    }
    if (toNode.level > this.lastLevel)
      this.lastLevel = toNode.level;
  }
};


/**
 * Creates drop off flow.
 * @param {anychart.sankeyModule.Chart.Node} fromNode
 * @param {number} flow
 */
anychart.sankeyModule.Chart.prototype.createDropOffFlow = function(fromNode, flow) {
  fromNode.outcomeValue += flow;
  fromNode.dropoffValue += flow;
  fromNode.dropoffValues.push(flow);
};


/**
 * Calculate node levels.
 * @private
 */
anychart.sankeyModule.Chart.prototype.calculateLevels_ = function() {
  /** @type {!string} */
  var from;

  /** @type {?string} */
  var to;

  /** @type {number} */
  var flow;

  /**
   * Nodes information by node name.
   * @type {Object.<string, anychart.sankeyModule.Chart.Node>}
   */
  this.nodes = {};

  /**
   * Flows information by row index
   * @type {Object.<string, anychart.sankeyModule.Chart.Flow>}
   */
  this.flows = {};

  /**
   * @type {anychart.sankeyModule.Chart.Node}
   */
  var fromNode;

  /**
   * @type {?anychart.sankeyModule.Chart.Node}
   */
  var toNode;

  /**
   * Number of the last level.
   * @type {number}
   */
  this.lastLevel = -1;

  var iterator = this.getIterator().reset();
  while (iterator.advance()) {
    from = /** @type {string} */ (iterator.get('from'));
    to = /** @type {string} */ (iterator.get('to'));
    flow = /** @type {number} */ (iterator.get('flow'));
    if (this.isMissing_(from, to, flow))
      continue;

    fromNode = this.nodes[from];
    if (!fromNode) {
      this.nodes[from] = fromNode = {
        name: from,
        level: 0,
        incomeValue: NaN,
        outcomeValue: 0,
        dropoffValue: 0,
        incomeNodes: [],
        outcomeNodes: [],
        incomeValues: [],
        outcomeValues: [],
        dropoffValues: [],
        incomeCoords: [],
        outcomeCoords: [],
        incomeFlows: [],
        outcomeFlows: [],
        conflict: false
      };
    }
    if (to === null) {
      toNode = null;
    } else {
      toNode = this.nodes[to];
      if (!toNode) {
        this.nodes[to] = toNode = {
          name: /** @type {!string} */ (to),
          level: -1,
          incomeValue: 0,
          outcomeValue: 0,
          dropoffValue: 0,
          incomeNodes: [],
          outcomeNodes: [],
          incomeValues: [],
          outcomeValues: [],
          dropoffValues: [],
          incomeCoords: [],
          outcomeCoords: [],
          incomeFlows: [],
          outcomeFlows: [],
          conflict: false
        };
      }
    }
    this.createFlow(fromNode, toNode, flow);
  }
  /**
   * Levels meta.
   * @type {Array.<anychart.sankeyModule.Chart.Level>}
   */
  this.levels = [];

  this.setAsLast = true;
  this.maxLevelWeight = 0;

  /** @type {number} */
  var levelNumber;

  /** @type {anychart.sankeyModule.Chart.Level} */
  var level;

  for (var name in this.nodes) {
    var node = this.nodes[name];

    var outLength = node.outcomeNodes.length + node.dropoffValues.length;

    // place node without outcome nodes at last level
    if (this.setAsLast && !outLength)
      node.level = this.lastLevel;

    // check whether node in confict
    if (node.incomeNodes.length && outLength) {
      node.conflict = (node.incomeValue != node.outcomeValue);
    }

    // first-level node
    if (isNaN(node.incomeValue))
      node.weight = node.outcomeValue;
    // last level node (nor outcome nor dropoff)
    else if (!outLength)
      node.weight = node.incomeValue;
    // other nodes
    else
      node.weight = Math.max(node.incomeValue, node.outcomeValue);

    levelNumber = node.level;
    level = this.levels[levelNumber];
    if (!this.levels[levelNumber]) {
      this.levels[levelNumber] = level = {
        nodes: [],
        weightsSum: 0,
        top: NaN
      };
    }
    level.nodes.push(node);
    level.weightsSum += node.weight;
    // calculating max level weight
    if (level.weightsSum > this.maxLevelWeight) {
      this.maxLevelWeight = level.weightsSum;
    }
  }

  this.maxNodesCount = 0;
  this.maxLevel = 0;
  var linearId = 0;
  for (var i = 0; i < this.levels.length; i++) {
    level = this.levels[i];

    var nodesLength = level.nodes.length;
    if ((level.weightsSum == this.maxLevelWeight) && (nodesLength > this.maxNodesCount)) {
      this.maxNodesCount = nodesLength;
      this.maxLevel = i;
    }
    for (var j = 0; j < nodesLength; j++) {
      level.nodes[j].id = linearId++;
    }
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.SANKEY_DATA)) {
    this.calculateLevels_();
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.markConsistent(anychart.ConsistencyState.SANKEY_DATA);
  }
};


//endregion
//region Interactivity
/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/**
 * Tooltip invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.sankeyModule.Chart.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  tooltip.draw();
};


anychart.sankeyModule.Chart.prototype.createContextProvider = function(tag) {
  if (!this.contextProvider_)
    this.contextProvider_ = new anychart.format.Context();

  var values = {};
  values['type'] = {value: tag.type, type: anychart.enums.TokenType.STRING};

  var name, node, flow;

  if (tag.type == anychart.sankeyModule.Chart.ElementType.NODE) {
    node = tag.node;
    name = node.name;
    values['value'] = {value: node.weight, type: anychart.enums.TokenType.STRING};
    values['name'] = {value: name, type: anychart.enums.TokenType.STRING};
  } else if (tag.type == anychart.sankeyModule.Chart.ElementType.FLOW) {
    flow = tag.flow;
    name = flow.from.name + ' -> ' + flow.to.name;
    values['value'] = {value: flow.weight, type: anychart.enums.TokenType.STRING};
    values['name'] = {value: name, type: anychart.enums.TokenType.STRING};
  } else {
    flow = tag.flow;
    name = flow.from.name + ' dropoff';
    values['value'] = {value: flow.weight, type: anychart.enums.TokenType.STRING};
    values['name'] = {value: name, type: anychart.enums.TokenType.STRING};
  }

  return /** @type {anychart.format.Context} */ (this.contextProvider_.propagate(values));
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  var state, context;
  var fill, stroke;
  var tooltip;

  if (tag) {
    var type = tag.type;

    if (type == anychart.sankeyModule.Chart.ElementType.NODE) {
      // node and conflict node
      state = anychart.PointState.HOVER;
      context = this.getColorResolutionContext(tag);

      fill = this.node_.getFill(state, context);
      stroke = this.node_.getStroke(state, context);
      domTarget.fill(fill);
      domTarget.stroke(stroke);

      tooltip = this.node_.tooltip();

      var flows = goog.array.concat(tag.node.incomeFlows, tag.node.outcomeFlows);
      for (var i = 0; i < flows.length; i++) {
        var flowPath = flows[i].path;
        var flowTag = flowPath.tag;
        context = this.getColorResolutionContext(flowTag);
        fill = this.flow_.getFill(state, context);
        stroke = this.flow_.getStroke(state, context);
        flowPath.fill(fill).stroke(stroke);
      }
    } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) {
      // flow
      state = tag.isSelected ? anychart.PointState.SELECT : anychart.PointState.HOVER;
      tooltip = this.flow_.tooltip();
      context = this.getColorResolutionContext(tag);
      fill = this.flow_.getFill(state, context);
      stroke = this.flow_.getStroke(state, context);
      domTarget.fill(fill);
      domTarget.stroke(stroke);

      var flow = tag.flow;
      context = this.getColorResolutionContext(flow.from.path.tag);
      fill = this.node_.getFill(state, context);
      stroke = this.node_.getStroke(state, context);
      flow.from.path.fill(fill).stroke(stroke);

      context = this.getColorResolutionContext(flow.to.path.tag);
      fill = this.node_.getFill(state, context);
      stroke = this.node_.getStroke(state, context);
      flow.to.path.fill(fill).stroke(stroke);
    } else {
      tooltip = this.flow_.tooltip();
      // dropoff flow
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(tag));
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  var state, context;
  var fill, stroke;
  this.tooltip().hide();
  if (tag) {
    var type = tag.type;

    if (type == anychart.sankeyModule.Chart.ElementType.NODE) {
      // node and conflict node
      state = anychart.PointState.NORMAL;
      context = this.getColorResolutionContext(tag);
      fill = this.node_.getFill(state, context);
      stroke = this.node_.getStroke(state, context);
      domTarget.fill(fill);
      domTarget.stroke(stroke);

      var flows = goog.array.concat(tag.node.incomeFlows, tag.node.outcomeFlows);
      for (var i = 0; i < flows.length; i++) {
        var flowPath = flows[i].path;
        var flowTag = flowPath.tag;
        context = this.getColorResolutionContext(flowTag);
        fill = this.flow_.getFill(state, context);
        stroke = this.flow_.getStroke(state, context);
        flowPath.fill(fill).stroke(stroke);
      }

    } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) {
      // flow
      state = tag.isSelected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;
      context = this.getColorResolutionContext(tag);
      fill = this.flow_.getFill(state, context);
      stroke = this.flow_.getStroke(state, context);
      domTarget.fill(fill);
      domTarget.stroke(stroke);

      var flow = tag.flow;
      context = this.getColorResolutionContext(flow.from.path.tag);
      fill = this.node_.getFill(state, context);
      stroke = this.node_.getStroke(state, context);
      flow.from.path.fill(fill).stroke(stroke);

      context = this.getColorResolutionContext(flow.to.path.tag);
      fill = this.node_.getFill(state, context);
      stroke = this.node_.getStroke(state, context);
      flow.to.path.fill(fill).stroke(stroke);
    } else {
      // dropoff flow
    }
  }
};


/**
 * Handler for mouse click event.
 * @private
 * @param {anychart.core.MouseEvent} event Event object.
 */
anychart.sankeyModule.Chart.prototype.handleMouseClick_ = function(event) {

};


//endregion
//region Element Settings
/**
 * Conflict invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.sankeyModule.Chart.prototype.elementInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};


/**
 * TODO: add docs
 * @param {Object=} opt_value
 * @return {anychart.sankeyModule.elements.Dropoff|anychart.sankeyModule.Chart}
 */
anychart.sankeyModule.Chart.prototype.dropoff = function(opt_value) {
  if (!this.dropoff_) {
    this.dropoff_ = new anychart.sankeyModule.elements.Dropoff(this);
    this.dropoff_.listenSignals(this.elementInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.dropoff_.setup(opt_value);
    return this;
  }
  return this.dropoff_;
};


/**
 * TODO: add docs
 * @param {Object=} opt_value
 * @return {anychart.sankeyModule.elements.Flow|anychart.sankeyModule.Chart}
 */
anychart.sankeyModule.Chart.prototype.flow = function(opt_value) {
  if (!this.flow_) {
    this.flow_ = new anychart.sankeyModule.elements.Flow(this);
    this.flow_.listenSignals(this.elementInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.flow_.setup(opt_value);
    return this;
  }
  return this.flow_;
};


/**
 * TODO: add docs
 * @param {Object=} opt_value
 * @return {anychart.sankeyModule.elements.Node|anychart.sankeyModule.Chart}
 */
anychart.sankeyModule.Chart.prototype.node = function(opt_value) {
  if (!this.node_) {
    this.node_ = new anychart.sankeyModule.elements.Node(this);
    this.node_.listenSignals(this.elementInvalidated_, this);
  }
  if (goog.isDef(opt_value)) {
    this.node_.setup(opt_value);
    return this;
  }
  return this.node_;
};


//endregion
//region Coloring
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.sankeyModule.Chart)} .
 */
anychart.sankeyModule.Chart.prototype.palette = function(opt_value) {
  if (anychart.utils.instanceOf(opt_value, anychart.palettes.RangeColors)) {
    this.setupPalette_(anychart.palettes.RangeColors, /** @type {anychart.palettes.RangeColors} */(opt_value));
    return this;
  } else if (anychart.utils.instanceOf(opt_value, anychart.palettes.DistinctColors)) {
    this.setupPalette_(anychart.palettes.DistinctColors, /** @type {anychart.palettes.DistinctColors} */(opt_value));
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.sankeyModule.Chart.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (anychart.utils.instanceOf(this.palette_, cls)) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
    this.palette_.listenSignals(this.paletteInvalidated_, this);
    if (doDispatch)
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.sankeyModule.Chart.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


anychart.sankeyModule.Chart.colorResolversCache = {};


anychart.sankeyModule.Chart.getColorResolver = function(colorName, colorType, chart) {
  if (!colorName) return anychart.color.getNullColor;
  var hash = colorType + '|' + colorName;
  var result = anychart.sankeyModule.Chart.colorResolversCache[hash];
  if (!result) {
    var normalizerFunc;
    switch (colorType) {
      case anychart.enums.ColorType.STROKE:
        normalizerFunc = anychart.core.settings.strokeOrFunctionSimpleNormalizer;
        break;
      case anychart.enums.ColorType.HATCH_FILL:
        normalizerFunc = anychart.core.settings.hatchFillOrFunctionSimpleNormalizer;
        break;
      default:
      case anychart.enums.ColorType.FILL:
        normalizerFunc = anychart.core.settings.fillOrFunctionSimpleNormalizer;
        break;
    }
    anychart.sankeyModule.Chart.colorResolversCache[hash] = result = goog.partial(anychart.sankeyModule.Chart.getColor,
        colorName, normalizerFunc, colorType == anychart.enums.ColorType.HATCH_FILL, chart);
  }
  return result;
};


/**
 * Returns normalized color.
 * @param {string} colorName
 * @param {Function} normalizer
 * @param {boolean} isHatchFill
 * @param {anychart.sankeyModule.Chart} chart
 * @param {(anychart.PointState|number)} state
 * @param {acgraph.vector.Path} path
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 */
anychart.sankeyModule.Chart.getColor = function(colorName, normalizer, isHatchFill, chart, state, path) {
  var context, stateColor;
  if (state != anychart.PointState.NORMAL) {
    stateColor = chart.resolveOption(colorName, state, normalizer);
    if (isHatchFill && stateColor == true)
      stateColor = normalizer(chart.getAutoHatchFill());
    if (goog.isDef(stateColor)) {
      if (!goog.isFunction(stateColor))
        return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(stateColor);
      else if (isHatchFill) {
        context = chart.getHatchFillResolutionContext();
        return normalizer(stateColor.call(context, context));
      }
    }
  }

  var color = chart.resolveOption(colorName, 0, normalizer);

  if (isHatchFill && color == true)
    color = normalizer(chart.getAutoHatchFill());

  if (goog.isFunction(color)) {
    context = isHatchFill ?
        chart.getHatchFillResolutionContext() :
        chart.getColorResolutionContext(path);
    color = color.call(context, context);
  }
  if (stateColor) {
    context = chart.getColorResolutionContext();
    color = normalizer(stateColor.call(context, context));
  }
  return /** @type {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill} */(color);
};


anychart.sankeyModule.Chart.prototype.resolveOption = function(colorName, state, normalizer) {
  var option = this.getOption(colorName) || this.getOption('nodeFill');
  return normalizer(option);
};


/**
 * Returns context for color resolution.
 * @param {Object} tag Tag
 * @param {boolean=} opt_isHatchFill
 * @return {*}
 */
anychart.sankeyModule.Chart.prototype.getColorResolutionContext = function(tag, opt_isHatchFill) {
  var from, to, node;
  var type = tag.type;
  var palette = opt_isHatchFill ? this.hatchFillPalette() : this.palette();

  if (type == anychart.sankeyModule.Chart.ElementType.NODE) { // node, conflict
    node = tag.node;
    return {
      'id': node.id,
      'name': node.name,
      'sourceColor': palette.itemAt(node.id),
      'conflict': node.conflict
    };
  } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) { // flow
    var flow = tag.flow;
    from = flow.from;
    to = flow.to;
    return {
      'from': from.name,
      'to': to.name,
      'sourceColor': palette.itemAt(from.id)
    };
  } else { // dropoff
    from = tag.from;
    return {
      'from': from.name,
      'sourceColor': palette.itemAt(from.id)
    };
  }
};


/**
 * Returns auto hatch fill.
 * @return {acgraph.vector.HatchFill}
 */
anychart.sankeyModule.Chart.prototype.getAutoHatchFill = function() {
  //TODO(AntonKagakin): waits for hatch fill implementation
  return /** @type {acgraph.vector.HatchFill} */ ('none');
};


/**
 * Hatch fill resolution context.
 * @return {{}}
 */
anychart.sankeyModule.Chart.prototype.getHatchFillResolutionContext = function() {
  return {};
};


//endregion
//region Drawing
/**
 * Calculate coords for flows.
 * @param {Array.<number>} values Flow values
 * @param {number} x
 * @param {number} top
 * @return {Array}
 */
anychart.sankeyModule.Chart.prototype.calculateCoords = function(values, x, top) {
  var rv = [];
  for (var i = 0; i < values.length; i++) {
    rv.push({
      x: x,
      y1: top,
      y2: top += values[i] * this.weightAspect
    });
  }
  return rv;
};


/**
 * Element type.
 * @enum {string}
 */
anychart.sankeyModule.Chart.ElementType = {
  NODE: 'node',
  FLOW: 'flow',
  DROPOFF: 'dropoff'
};


/**
 * Default ascending compare function to sort nodes/values for
 * better user experience on drawing flows.
 * @param {anychart.sankeyModule.Chart.Node} node1
 * @param {anychart.sankeyModule.Chart.Node} node2
 * @return {number}
 */
anychart.sankeyModule.Chart.NODE_COMPARE_FUNCTION = function(node1, node2) {
  return node1.id - node2.id;
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  // calculates everything that can be calculated from data
  this.calculate();


  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.rootElement.removeChildren();
    this.conflictPaths = [];
    this.dropoffPaths = [];
    this.nodePaths = [];
    this.flowPaths = [];

    var level;
    var levelsCount = this.levels.length;
    var levelWidth = bounds.width / levelsCount;

    var baseNodePadding = /** @type {number} */ (this.getOption('nodePadding'));
    var nodeWidth = /** @type {string|number} */ (this.getOption('nodeWidth'));
    nodeWidth = anychart.utils.normalizeSize(nodeWidth, levelWidth);
    var dropOffPadding = nodeWidth * 0.3;

    // if we have dropoff on last node we should count it in calculations to show it correctly
    var lastNodeDropOffPadding = this.levels[this.maxLevel].nodes[this.maxNodesCount - 1].dropoffValue ? dropOffPadding : 0;
    this.weightAspect = (bounds.height - (this.maxNodesCount - 1) * baseNodePadding - lastNodeDropOffPadding) / this.maxLevelWeight;

    var nodesPerLevel;
    var levelPadding = baseNodePadding;

    var i, j;
    for (i = 0; i < this.levels.length; i++) {
      level = this.levels[i];
      nodesPerLevel = level.nodes.length;
      var pixelHeight = level.weightsSum * this.weightAspect;
      lastNodeDropOffPadding = level.nodes[nodesPerLevel - 1].dropoffValue ? dropOffPadding : 0;

      var height = (nodesPerLevel - 1) * levelPadding + pixelHeight + lastNodeDropOffPadding;
      if (height > bounds.height) {
        height = bounds.height;
        levelPadding = (height - pixelHeight - lastNodeDropOffPadding) / (nodesPerLevel - 1);
      }
      level.top = bounds.top + (bounds.height - height) / 2;

      var lastTop = level.top;
      var index;
      for (j = 0; j < level.nodes.length; j++) {
        var node = level.nodes[j];
        var nodeHeight = node.weight * this.weightAspect;

        var path = this.rootElement.path().zIndex(2);
        if (node.conflict)
          this.conflictPaths.push(path);
        else
          this.nodePaths.push(path);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.NODE,
          node: node
        };
        node.path = path;

        var nodeLeft = (i * levelWidth) + (levelWidth - nodeWidth) / 2;
        var nodeTop = lastTop;
        var nodeRight = nodeLeft + nodeWidth;
        var nodeBottom = nodeTop + nodeHeight;

        nodeLeft = anychart.utils.applyPixelShift(nodeLeft, 1);
        nodeTop = anychart.utils.applyPixelShift(nodeTop, 1);
        nodeRight = anychart.utils.applyPixelShift(nodeRight, 1);
        nodeBottom = anychart.utils.applyPixelShift(nodeBottom, 1);

        node.top = nodeTop;
        node.right = nodeRight;
        node.bottom = nodeBottom;
        node.left = nodeLeft;

        var sortedNodes, sortedValues, sortedFlows, k;
        if (!isNaN(node.incomeValue) && node.incomeValue) {
          sortedNodes = Array.prototype.slice.call(node.incomeNodes, 0);
          goog.array.sort(sortedNodes, anychart.sankeyModule.Chart.NODE_COMPARE_FUNCTION);
          sortedValues = [];
          sortedFlows = [];
          for (k = 0; k < sortedNodes.length; k++) {
            index = goog.array.indexOf(node.incomeNodes, sortedNodes[k]);
            sortedValues.push(node.incomeValues[index]);
            sortedFlows.push(node.incomeFlows[index]);
          }

          node.incomeValues = sortedValues;
          node.incomeNodes = sortedNodes;
          node.incomeFlows = sortedFlows;

          node.incomeCoords = this.calculateCoords(node.incomeValues, nodeLeft, nodeTop);
        }

        if (node.outcomeValue) {
          sortedNodes = Array.prototype.slice.call(node.outcomeNodes, 0);
          goog.array.sort(sortedNodes, anychart.sankeyModule.Chart.NODE_COMPARE_FUNCTION);
          sortedValues = [];
          sortedFlows = [];
          for (k = 0; k < sortedNodes.length; k++) {
            index = goog.array.indexOf(node.outcomeNodes, sortedNodes[k]);
            sortedValues.push(node.outcomeValues[index]);
            sortedFlows.push(node.outcomeFlows[index]);
          }

          node.outcomeValues = sortedValues;
          node.outcomeNodes = sortedNodes;
          node.outcomeFlows = sortedFlows;

          node.outcomeCoords = this.calculateCoords(node.outcomeValues, nodeRight, nodeTop);
        }

        path
            .moveTo(nodeLeft, nodeTop)
            .lineTo(nodeRight, nodeTop)
            .lineTo(nodeRight, nodeBottom)
            .lineTo(nodeLeft, nodeBottom)
            .lineTo(nodeLeft, nodeTop)
            .close();

        // just for presentation
        var text = this.rootElement.text().zIndex(3);
        // text.text(node.name + '\n' + node.weight);
        text.text(node.weight);
        var textBounds = text.getBounds();
        var textWidth = textBounds.width;
        var textHeight = textBounds.height;
        var x = nodeLeft + nodeWidth / 2 - textWidth / 2;
        var y = nodeTop + nodeHeight / 2 - textHeight / 2;
        text.x(x).y(y);

        lastTop = nodeBottom + levelPadding;
      }
    }

    var curvy = this.getOption('curveFactor') * (bounds.width - nodeWidth) / (this.levels.length - 1);

    for (var dataIndex in this.flows) {
      var flow = this.flows[dataIndex];
      var fromNode = flow.from;
      var toNode = flow.to;
      if (toNode) {
        var indexFrom = goog.array.indexOf(fromNode.outcomeFlows, flow);
        var indexTo = goog.array.indexOf(toNode.incomeFlows, flow);

        var fromCoords = fromNode.outcomeCoords[indexFrom];
        var toCoords = toNode.incomeCoords[indexTo];

        path = this.rootElement.path().zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.FLOW,
          flow: flow
        };

        this.flowPaths.push(path);
        flow.path = path;

        path
            .moveTo(fromCoords.x, fromCoords.y1)
            .curveTo(fromCoords.x + curvy, fromCoords.y1, toCoords.x - curvy, toCoords.y1, toCoords.x, toCoords.y1)
            .lineTo(toCoords.x, toCoords.y2)
            .curveTo(toCoords.x - curvy, toCoords.y2, fromCoords.x + curvy, fromCoords.y2, fromCoords.x, fromCoords.y2)
            .lineTo(fromCoords.x, fromCoords.y1)
            .close();
      } else {
        // dropoff flow
        x = fromNode.right;
        height = fromNode.dropoffValue * this.weightAspect;
        var y2 = fromNode.bottom;
        var y1 = y2 - height;

        path = this.rootElement.path().zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.DROPOFF,
          from: fromNode,
          flow: flow
        };

        this.dropoffPaths.push(path);

        path
            .moveTo(x, y1)
            .arcTo(nodeWidth / 2, height, -90, 90)
            .lineTo(x + nodeWidth / 4, y2 + dropOffPadding)
            // .lineTo(x, y2 + 0.3 * height)
            .lineTo(x, y2)
            .close();
      }
    }

    /**for (var name in this.nodes) {
      var fromNode = this.nodes[name];

      var len = fromNode.outcomeNodes.length;
      for (i = 0; i < len; i++) {
        var fromCoords = fromNode.outcomeCoords[i];
        var toNode = fromNode.outcomeNodes[i];

        index = goog.array.findIndex(toNode.incomeNodes, function(item) {
          return item.name == name;
        });
        var toCoords = toNode.incomeCoords[index];

        path = this.rootElement.path().zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.FLOW,
          from: fromNode,
          to: toNode
        };

        this.flowPaths.push(path);

        path
            .moveTo(fromCoords.x, fromCoords.y1)
            .curveTo(fromCoords.x + curvy, fromCoords.y1, toCoords.x - curvy, toCoords.y1, toCoords.x, toCoords.y1)
            .lineTo(toCoords.x, toCoords.y2)
            .curveTo(toCoords.x - curvy, toCoords.y2, fromCoords.x + curvy, fromCoords.y2, fromCoords.x, fromCoords.y2)
            .lineTo(fromCoords.x, fromCoords.y1)
            .close();
      }

      //TODO(AntonKagakin): rework dropoff width/height calculation
      // width is a percent of full node weight, but limited
      // length of the "arrow" depends on dropoff width
      if (fromNode.dropoffValues.length) {
        x = fromNode.right;
        height = fromNode.dropoffValue * this.weightAspect;
        var y2 = fromNode.bottom;
        var y1 = y2 - height;

        path = this.rootElement.path().zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.DROPOFF,
          from: fromNode
        };

        this.dropoffPaths.push(path);

        path
            .moveTo(x, y1)
            .arcTo(nodeWidth / 2, height, -90, 90)
            .lineTo(x + nodeWidth / 4, y2 + dropOffPadding)
            // .lineTo(x, y2 + 0.3 * height)
            .lineTo(x, y2)
            .close();
      }
    }*/

    this.invalidate(anychart.ConsistencyState.APPEARANCE);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var context, fill, stroke;

    for (i = 0; i < this.nodePaths.length; i++) {
      path = this.nodePaths[i];
      context = this.getColorResolutionContext(path.tag);
      fill = this.node_.getFill(0, context);
      stroke = this.node_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    for (i = 0; i < this.flowPaths.length; i++) {
      path = this.flowPaths[i];
      context = this.getColorResolutionContext(path.tag);
      fill = this.flow_.getFill(0, context);
      stroke = this.flow_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    for (i = 0; i < this.dropoffPaths.length; i++) {
      path = this.dropoffPaths[i];
      context = this.getColorResolutionContext(path.tag);
      fill = this.dropoff_.getFill(0, context);
      stroke = this.dropoff_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    for (i = 0; i < this.conflictPaths.length; i++) {
      path = this.conflictPaths[i];
      context = this.getColorResolutionContext(path.tag);
      fill = this.node_.getFill(0, context);
      stroke = this.node_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.serialize = function() {
  var json = anychart.sankeyModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.sankeyModule.Chart.OWN_DESCRIPTORS, json);

  json['dropoff'] = this.dropoff().serialize();
  json['flow'] = this.flow().serialize();
  json['node'] = this.node().serialize();

  return json;
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.sankeyModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.sankeyModule.Chart.OWN_DESCRIPTORS, config, opt_default);

  if ('dropoff' in config)
    this.dropoff().setupInternal(!!opt_default, config['dropoff']);
  if ('flow' in config)
    this.flow().setupInternal(!!opt_default, config['flow']);
  if ('node' in config)
    this.node().setupInternal(!!opt_default, config['node']);
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.palette_, this.dropoff_, this.flow_, this.node_, this.tooltip_);
  anychart.sankeyModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
//exports
(function() {
  var proto = anychart.sankeyModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['tooltip'] = proto.tooltip;
  // elements settings
  proto['dropoff'] = proto.dropoff;
  proto['flow'] = proto.flow;
  proto['node'] = proto.node;
  // palettes
  proto['palette'] = proto.palette;
  // auto generated
  // proto['nodePadding'] = proto.nodePadding;
  // proto['nodeWidth'] = proto.nodeWidth;
  // proto['curveFactor'] = proto.curveFactor;
})();
//endregion
