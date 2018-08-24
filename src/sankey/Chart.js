//region Provide / Require
goog.provide('anychart.sankeyModule.Chart');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.StateSettings');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');
goog.require('anychart.sankeyModule.elements.Dropoff');
goog.require('anychart.sankeyModule.elements.Flow');
goog.require('anychart.sankeyModule.elements.Node');
//endregion
//region Constructor



/**
 * Sankey chart class.
 * @constructor
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 */
anychart.sankeyModule.Chart = function(opt_data, opt_csvSettings) {
  anychart.sankeyModule.Chart.base(this, 'constructor');
  this.setType(anychart.enums.ChartTypes.SANKEY);

  this.bindHandlersToComponent(this,
      this.handleMouseOverAndMove,    // override from anychart.core.Chart
      this.handleMouseOut,            // override from anychart.core.Chart
      null,                           // click handler
      this.handleMouseOverAndMove,    // override from anychart.core.Chart
      null,                           // all handler
      this.handleMouseDown);          // anychart.core.Chart

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, anychart.sankeyModule.Chart.OWN_DESCRIPTORS_META);

  this.LABELS_STATE = anychart.ConsistencyState.SANKEY_NODE_LABELS | anychart.ConsistencyState.SANKEY_FLOW_LABELS;

  this.data(opt_data || null, opt_csvSettings);
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
    anychart.ConsistencyState.SANKEY_NODE_LABELS |
    anychart.ConsistencyState.SANKEY_FLOW_LABELS |
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


/**
 * Z-index of a sankey data layer.
 * @type {number}
 */
anychart.sankeyModule.Chart.ZINDEX_SANKEY = 30;


//endregion
//region Data
/**
 * Sets data for sankey chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.sankeyModule.Chart|anychart.data.View}
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
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs();
      else
        this.data_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.SANKEY_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
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
  return valueMissing || fromMissing || toMissing;
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
 *   left: (number|undefined),
 *   label: (anychart.core.ui.LabelsFactory.Label|undefined)
 * }}
 */
anychart.sankeyModule.Chart.Node;


/**
 * @typedef {{
 *   dataIndex: number,
 *   from: anychart.sankeyModule.Chart.Node,
 *   to: ?anychart.sankeyModule.Chart.Node,
 *   weight: number,
 *   left: (number|undefined),
 *   right: (number|undefined),
 *   top: (number|undefined),
 *   bottom: (number|undefined),
 *   topCenter: (number|undefined),
 *   bottomCenter: (number|undefined),
 *   leftTop: ({x: number, y: number}|undefined),
 *   rightTop: ({x: number, y: number}|undefined),
 *   rightBottom: ({x: number, y: number}|undefined),
 *   leftBottom: ({x: number, y: number}|undefined),
 *   path: (acgraph.vector.Path|undefined),
 *   label: (anychart.core.ui.LabelsFactory.Label|undefined)
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
    if (fromNode.level >= toNode.level) {
      var diff = fromNode.level - toNode.level;
      toNode.level = toNode.level + diff + 1;
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

    if (isNaN(toNode.incomeValue))
      toNode.incomeValue = 0;

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
   * @type {Object.<(string|number), anychart.sankeyModule.Chart.Flow>}
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
    flow = /** @type {number} */ (anychart.utils.toNumber(iterator.get('flow')));
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


/**
 * Creates provider for sankey labels.
 * @param {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} element
 * @param {anychart.sankeyModule.Chart.ElementType} elementType
 * @param {boolean=} opt_force - create context provider forcibly.
 * @return {anychart.format.Context}
 */
anychart.sankeyModule.Chart.prototype.createLabelContextProvider = function(element, elementType, opt_force) {
  if (!this.labelsContextProvider_ || opt_force)
    this.labelsContextProvider_ = new anychart.format.Context();

  var name;
  var values = {};
  values['type'] = {value: elementType, type: anychart.enums.TokenType.STRING};

  var value = element.weight;

  if (elementType == anychart.sankeyModule.Chart.ElementType.NODE) {
    values['value'] = {value: value, type: anychart.enums.TokenType.STRING};
    values['name'] = {value: element.name, type: anychart.enums.TokenType.STRING};

  } else if (elementType == anychart.sankeyModule.Chart.ElementType.FLOW) {
    name = element.from.name + ' -> ' + element.to.name;
    values['value'] = {value: value, type: anychart.enums.TokenType.STRING};
    values['name'] = {value: name, type: anychart.enums.TokenType.STRING};

  } else {
    name = element.from.name + ' dropoff';
    values['value'] = {value: value, type: anychart.enums.TokenType.STRING};
    values['name'] = {value: name, type: anychart.enums.TokenType.STRING};
  }

  return /** @type {anychart.format.Context} */ (this.labelsContextProvider_.propagate(values));
};


/**
 * Creates context provider for tooltip.
 * @param {Object} tag
 * @return {anychart.format.Context}
 */
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


/**
 * Labels position for HOVERED state flows.
 * @param {anychart.sankeyModule.Chart.Flow} flow
 * @param {string} side
 * @return {{x: number, y: number}}
 */
anychart.sankeyModule.Chart.prototype.hoverNodeFlowsPositionProvider = function(flow, side) {
  return {
    'x': flow[side].x,
    'y': flow[side].y
  };
};


/**
 * Labels position for NORMAL state flows.
 * @param {anychart.sankeyModule.Chart.Flow} flow
 * @return {{x: number, y: number}}
 */
anychart.sankeyModule.Chart.prototype.unhoverNodeFlowsPositionProvider = function(flow) {
  return {
    'x': /** @type {number} */ ((flow['left'] + flow['right']) / 2),
    'y': /** @type {number} */ (flow['topCenter'])
  };
};


/**
 * Colors node flows depends on state
 * @param {Array.<anychart.sankeyModule.Chart.Flow>} flowArray
 * @param {anychart.enums.Anchor} autoAnchor
 * @param {anychart.PointState|number} state
 * @param {Function} positionProviderFn
 * @param {string=} opt_side
 */
anychart.sankeyModule.Chart.prototype.colorNodeFlows = function(flowArray, autoAnchor, state, positionProviderFn, opt_side) {
  var flow, flowPath;
  for (var i = 0; i < flowArray.length; i++) {
    flow = flowArray[i];
    flowPath = flow.path;
    this.setFillStroke(this.flow_, /** @type {Object} */ (flowPath.tag), flowPath, state);

    flow.label.autoAnchor(autoAnchor);
    flow.label.positionProvider({
      'value': positionProviderFn(flow, opt_side)
    });
    this.drawLabel_(this.flow_, flow, state);
  }
};


/**
 * Sets fill and stroke depends on context.
 * @param {anychart.sankeyModule.elements.VisualElement} source
 * @param {Object} tag
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 */
anychart.sankeyModule.Chart.prototype.setFillStroke = function(source, tag, path, state) {
  var context = this.getColorResolutionContext(tag);
  var fill = /** @type {acgraph.vector.Fill} */ (source.getFill(state, context));
  var stroke = /** @type {acgraph.vector.Stroke} */ (source.getStroke(state, context));
  path.fill(fill);
  path.stroke(stroke);
};


/**
 * Colorize node and related flows.
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 * @param {anychart.enums.Anchor} incomeAutoAnchor Auto anchor for related income flows.
 * @param {anychart.enums.Anchor} outcomeAutoAnchor Auto anchor for related outcome flows.
 * @param {Function} positionProviderFn Labels position provider function.
 */
anychart.sankeyModule.Chart.prototype.colorizeNode = function(path, state, incomeAutoAnchor, outcomeAutoAnchor, positionProviderFn) {
  var tag = /** @type {Object} */ (path.tag);
  // sets <state> state color for node
  this.setFillStroke(this.node_, tag, path, state);

  // sets <state>> state color for node's income and outcome flows
  this.colorNodeFlows(tag.node.incomeFlows, incomeAutoAnchor, state, positionProviderFn, 'leftTop');
  this.colorNodeFlows(tag.node.outcomeFlows, outcomeAutoAnchor, state, positionProviderFn, 'rightTop');

  // draws <state> label for node
  this.drawLabel_(this.node_, tag.node, state);
};


/**
 * Colorize flow and related nodes.
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 */
anychart.sankeyModule.Chart.prototype.colorizeFlow = function(path, state) {
  var tag = /** @type {Object} */ (path.tag);
  // sets <state> state color for flow
  this.setFillStroke(this.flow_, tag, path, state);

  var flow = tag.flow;
  flow.label.autoAnchor(anychart.enums.Anchor.CENTER_BOTTOM);
  flow.label.positionProvider({
    'value': this.unhoverNodeFlowsPositionProvider(flow)
  });

  // sets <state> state color for FROM and TO nodes of the flow.
  this.setFillStroke(this.node_, flow.from.path.tag, flow.from.path, state);
  this.setFillStroke(this.node_, flow.to.path.tag, flow.to.path, state);

  // draws <state> label for flow
  this.drawLabel_(this.flow_, flow, state);
};


/**
 * Colorize dropoff.
 * @param {acgraph.vector.Path} path
 * @param {anychart.PointState|number} state
 */
anychart.sankeyModule.Chart.prototype.colorizeDropoff = function(path, state) {
  var tag = /** @type {Object} */ (path.tag);
  // sets <state> state color for dropoff
  this.setFillStroke(this.dropoff_, tag, path, state);

  // draws <state> label for dropoff flow
  this.drawLabel_(this.dropoff_, path.tag.flow, state);
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  var tag = /** @type {Object} */ (domTarget.tag);
  var tooltip;

  if (tag) {
    var type = tag.type;

    if (type == anychart.sankeyModule.Chart.ElementType.NODE) {
      tooltip = this.node_.tooltip();

      // colorize node and all related flows
      this.colorizeNode(domTarget, anychart.PointState.HOVER, anychart.enums.Anchor.LEFT_BOTTOM, anychart.enums.Anchor.RIGHT_BOTTOM, this.hoverNodeFlowsPositionProvider);
    } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) {
      tooltip = this.flow_.tooltip();

      // colorize flow and related nodes(from, to)
      this.colorizeFlow(domTarget, anychart.PointState.HOVER);
    } else {
      tooltip = this.dropoff_.tooltip();

      // colorize dropoff flow
      this.colorizeDropoff(domTarget, anychart.PointState.HOVER);
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(/** @type {Object} */ (tag)));
  } else {
    this.tooltip().hide();
  }
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  var tag = /** @type {Object} */ (domTarget.tag);
  this.tooltip().hide();
  if (tag) {
    var type = tag.type;

    if (type == anychart.sankeyModule.Chart.ElementType.NODE) {
      // colorize node and all related flows
      this.colorizeNode(domTarget, anychart.PointState.NORMAL, anychart.enums.Anchor.CENTER_BOTTOM, anychart.enums.Anchor.CENTER_BOTTOM, this.unhoverNodeFlowsPositionProvider);
    } else if (type == anychart.sankeyModule.Chart.ElementType.FLOW) {
      // colorize flow and related nodes(from, to)
      this.colorizeFlow(domTarget, anychart.PointState.NORMAL);
    } else {
      // colorize dropoff flow
      this.colorizeDropoff(domTarget, anychart.PointState.NORMAL);
    }
  }
};


//endregion
//region Element Settings
/**
 * Element settings invalidation handler (node, flow, dropoff).
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.sankeyModule.Chart.prototype.elementInvalidated_ = function(event) {
  var state = anychart.ConsistencyState.APPEARANCE;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_LABELS)) {
    var nodeLabels = anychart.utils.instanceOf(event.target, anychart.sankeyModule.elements.Node);
    state |= (nodeLabels ? anychart.ConsistencyState.SANKEY_NODE_LABELS : anychart.ConsistencyState.SANKEY_FLOW_LABELS);
  }
  this.invalidate(state, anychart.Signal.NEEDS_REDRAW);
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


/**
 * Returns context for color resolution.
 * @param {Object} tag Tag
 * @return {Object}
 */
anychart.sankeyModule.Chart.prototype.getColorResolutionContext = function(tag) {
  var from, to, node;
  var type = tag.type;
  var palette = this.palette();

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
 * @enum {number}
 */
anychart.sankeyModule.Chart.ElementType = {
  NODE: 0,
  FLOW: 1,
  DROPOFF: 2
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

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.sankeyModule.Chart.ZINDEX_SANKEY);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.rootLayer.removeChildren();
    this.node_.labels().invalidate(anychart.ConsistencyState.CONTAINER);
    this.flow_.labels().invalidate(anychart.ConsistencyState.CONTAINER);
    this.dropoff_.labels().invalidate(anychart.ConsistencyState.CONTAINER);
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

    if (this.levels.length) {
      // if we have dropoff on last node we should count it in calculations to show it correctly
      var lastNodeDropOffPadding = this.levels[this.maxLevel].nodes[this.maxNodesCount - 1].dropoffValue ? dropOffPadding : 0;
      this.weightAspect = (bounds.height - (this.maxNodesCount - 1) * baseNodePadding - lastNodeDropOffPadding) / this.maxLevelWeight;
    }

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

        var path = this.rootLayer.path();
        path.zIndex(2);
        this.nodePaths.push(path);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.NODE,
          node: node
        };
        node.path = path;

        var nodeLeft = bounds.left + (i * levelWidth) + (levelWidth - nodeWidth) / 2;
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

        lastTop = nodeBottom + levelPadding;
      }
    }

    var curvy = /** @type {number} */ (this.getOption('curveFactor')) * (bounds.width - nodeWidth) / (this.levels.length - 1);

    for (var dataIndex in this.flows) {
      var flow = this.flows[dataIndex];
      var fromNode = flow.from;
      var toNode = flow.to;
      if (toNode) {
        var indexFrom = goog.array.indexOf(fromNode.outcomeFlows, flow);
        var indexTo = goog.array.indexOf(toNode.incomeFlows, flow);

        var fromCoords = fromNode.outcomeCoords[indexFrom];
        var toCoords = toNode.incomeCoords[indexTo];

        path = this.rootLayer.path();
        path.zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.FLOW,
          flow: flow
        };

        this.flowPaths.push(path);
        flow.path = path;

        flow['left'] = fromCoords.x;
        flow['right'] = toCoords.x;
        flow.top = Math.min(fromCoords.y1, toCoords.y1);    // highest y coordinate
        flow.bottom = Math.max(fromCoords.y2, toCoords.y2); // lowest y coordinate
        flow['topCenter'] = (fromCoords.y1 + toCoords.y1) / 2;
        flow.bottomCenter = (fromCoords.y2 + toCoords.y2) / 2;

        flow['leftTop'] = {x: fromCoords.x, y: fromCoords.y1};
        flow['rightTop'] = {x: toCoords.x, y: toCoords.y1};
        flow.rightBottom = {x: toCoords.x, y: toCoords.y2};
        flow.leftBottom = {x: fromCoords.x, y: fromCoords.y2};

        path
            .moveTo(fromCoords.x, fromCoords.y1)
            .curveTo(fromCoords.x + curvy, fromCoords.y1, toCoords.x - curvy, toCoords.y1, toCoords.x, toCoords.y1)
            .lineTo(toCoords.x, toCoords.y2)
            .curveTo(toCoords.x - curvy, toCoords.y2, fromCoords.x + curvy, fromCoords.y2, fromCoords.x, fromCoords.y2)
            .lineTo(fromCoords.x, fromCoords.y1)
            .close();
      } else {
        // dropoff flow
        height = fromNode.dropoffValue * this.weightAspect;
        var left = /** @type {number} */ (fromNode.right);
        var radius = Math.min(height, nodeWidth / 4);
        var right = left + radius;
        var y2 = /** @type {number} */ (fromNode.bottom);
        var y1 = y2 - height;

        path = this.rootLayer.path();
        path.zIndex(1);

        path.tag = {
          type: anychart.sankeyModule.Chart.ElementType.DROPOFF,
          from: fromNode,
          flow: flow
        };

        this.dropoffPaths.push(path);
        flow.path = path;
        flow.rightX = right;
        flow.rightY = y2;

        path
            .moveTo(left, y1)
            .arcTo(radius, radius, -90, 90);

        if (y1 + radius < y2)
          path.lineTo(right, y2);

        path
            .lineTo((left + right) / 2, y2 + dropOffPadding)
            .lineTo(left, y2)
            .close();
      }
    }

    this.invalidate(anychart.ConsistencyState.APPEARANCE | this.LABELS_STATE);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var context, fill, stroke;

    for (i = 0; i < this.nodePaths.length; i++) {
      path = this.nodePaths[i];
      context = this.getColorResolutionContext(/** @type {Object} */ (path.tag));
      fill = this.node_.getFill(0, context);
      stroke = this.node_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    for (i = 0; i < this.flowPaths.length; i++) {
      path = this.flowPaths[i];
      context = this.getColorResolutionContext(/** @type {Object} */ (path.tag));
      fill = this.flow_.getFill(0, context);
      stroke = this.flow_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    for (i = 0; i < this.dropoffPaths.length; i++) {
      path = this.dropoffPaths[i];
      context = this.getColorResolutionContext(/** @type {Object} */ (path.tag));
      fill = this.dropoff_.getFill(0, context);
      stroke = this.dropoff_.getStroke(0, context);
      path.fill(fill);
      path.stroke(stroke);
    }

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  var labelsFormatProvider, labelsPositionProvider, labelIndex;
  if (this.hasInvalidationState(anychart.ConsistencyState.SANKEY_NODE_LABELS)) {
    var labels = this.node_.labels();
    labels.clear().container(this.rootLayer).zIndex(3);

    for (var name in this.nodes) {
      node = /** @type {anychart.sankeyModule.Chart.Node} */ (this.nodes[name]);
      labelIndex = node.id;
      labelsFormatProvider = this.createLabelContextProvider(node, anychart.sankeyModule.Chart.ElementType.NODE);
      labelsPositionProvider = {
        'value': {
          'x': (node.left + node.right) / 2,
          'y': (node.top + node.bottom) / 2
        }
      };

      node.label = labels.add(labelsFormatProvider, labelsPositionProvider, labelIndex);
      this.drawLabel_(this.node_, node, anychart.PointState.NORMAL);
    }
    labels.draw();

    this.node_.markLabelsConsistent();
    this.markConsistent(anychart.ConsistencyState.SANKEY_NODE_LABELS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SANKEY_FLOW_LABELS)) {
    var flowLabels = this.flow_.labels();
    var dropoffLabels = this.dropoff_.labels();

    flowLabels.clear().container(this.rootLayer).zIndex(3);
    dropoffLabels.clear().container(this.rootLayer).zIndex(3);

    for (dataIndex in this.flows) {
      flow = /** @type {anychart.sankeyModule.Chart.Flow} */ (this.flows[dataIndex]);
      labelIndex = anychart.utils.toNumber(dataIndex);
      fromNode = flow.from;
      toNode = flow.to;
      var type = toNode ? anychart.sankeyModule.Chart.ElementType.FLOW : anychart.sankeyModule.Chart.ElementType.DROPOFF;

      labelsFormatProvider = this.createLabelContextProvider(flow, type, true);
      if (toNode) {
        labelsPositionProvider = {
          'value': this.unhoverNodeFlowsPositionProvider(flow)
        };
        flow.label = flowLabels.add(labelsFormatProvider, labelsPositionProvider, labelIndex);
        flow.label.autoAnchor(anychart.enums.Anchor.CENTER_BOTTOM);
      } else {
        labelsPositionProvider = {
          'value': {
            'x': flow.rightX,
            'y': flow.rightY
          }
        };
        flow.label = dropoffLabels.add(labelsFormatProvider, labelsPositionProvider, labelIndex);
        flow.label.autoAnchor(anychart.enums.Anchor.LEFT_CENTER);
      }

      this.drawLabel_(toNode ? this.flow_ : this.dropoff_, flow, anychart.PointState.NORMAL);
    }
    flowLabels.draw();
    dropoffLabels.draw();

    this.flow_.markLabelsConsistent();
    this.dropoff_.markLabelsConsistent();
    this.markConsistent(anychart.ConsistencyState.SANKEY_FLOW_LABELS);
  }
};


/**
 * Check if the passed element is node
 * @param {anychart.sankeyModule.elements.VisualElement} element
 * @return {boolean}
 */
anychart.sankeyModule.Chart.prototype.isNode = function(element) {
  return anychart.utils.instanceOf(element, anychart.sankeyModule.elements.Node);
};


/**
 * Draws specified label.
 * @param {anychart.sankeyModule.elements.VisualElement} source
 * @param {anychart.sankeyModule.Chart.Node|anychart.sankeyModule.Chart.Flow} element
 * @param {anychart.PointState|number} state
 * @private
 */
anychart.sankeyModule.Chart.prototype.drawLabel_ = function(source, element, state) {
  var label = /** @type {anychart.core.ui.LabelsFactory.Label} */ (element.label);
  if (label) {
    var draw;
    var pointNormalLabel, pointHoveredLabel;
    var iterator = this.getIterator();
    this.isNode(source) ? iterator.reset() : iterator.select(element.dataIndex);

    pointNormalLabel = iterator.get('normal');
    pointNormalLabel = goog.isDef(pointNormalLabel) ? pointNormalLabel['label'] : void 0;
    pointHoveredLabel = iterator.get('hovered');
    pointHoveredLabel = goog.isDef(pointHoveredLabel) ? pointHoveredLabel['label'] : void 0;
    var pointLabel = anychart.utils.getFirstDefinedValue(pointNormalLabel, iterator.get('label'), null);
    var hoverLabel = anychart.utils.getFirstDefinedValue(pointHoveredLabel, iterator.get('hoverLabel'), null);

    var pointState = state ? hoverLabel : null;
    var pointNormal = pointLabel;

    var elementState = state ? source.hovered().labels() : null;
    var elementNormal = source.normal().labels();
    var elementStateTheme = state ? source.hovered().labels().themeSettings : null;
    var elementNormalTheme = source.normal().labels().themeSettings;

    var pointStateLabelsEnabled = pointState && goog.isDef(pointState['enabled']) ? pointState['enabled'] : null;
    var pointNormalLabelsEnabled = pointNormal && goog.isDef(pointNormal['enabled']) ? pointNormal['enabled'] : null;
    var elementStateLabelsEnabled = elementState && !goog.isNull(elementState.enabled()) ? elementState.enabled() : null;
    var elementNormalEnabled = elementNormal && !goog.isNull(elementNormal.enabled()) ? elementNormal.enabled() : null;

    draw = false;
    if (goog.isDefAndNotNull(pointStateLabelsEnabled)) {
      draw = pointStateLabelsEnabled;
    } else if (goog.isDefAndNotNull(pointNormalLabelsEnabled)) {
      draw = pointNormalLabelsEnabled;
    } else if (goog.isDefAndNotNull(elementStateLabelsEnabled)) {
      draw = elementStateLabelsEnabled;
    } else {
      draw = elementNormalEnabled;
    }

    if (draw) {
      label.enabled(true);

      label.state('labelOwnSettings', label.ownSettings, 0);
      label.state('pointState', /** @type {?Object} */ (pointState), 1);
      label.state('pointNormal', /** @type {?Object} */ (pointLabel), 2);

      label.state('elementState', elementState, 3);
      label.state('elementNormal', elementNormal, 4);

      label.state('elementStateTheme', elementStateTheme, 5);
      label.state('auto', label.autoSettings, 6);

      label.state('elementNormalTheme', elementNormalTheme, 7);
    } else {
      label.enabled(false);
    }
    label.draw();
  }
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.serialize = function() {
  var json = anychart.sankeyModule.Chart.base(this, 'serialize');

  json['type'] = this.getType();
  json['data'] = this.data().serialize();
  json['tooltip'] = this.tooltip().serialize();
  json['palette'] = this.palette().serialize();

  json['dropoff'] = this.dropoff().serialize();
  json['flow'] = this.flow().serialize();
  json['node'] = this.node().serialize();

  anychart.core.settings.serialize(this, anychart.sankeyModule.Chart.OWN_DESCRIPTORS, json);

  return {'chart': json};
};


/** @inheritDoc */
anychart.sankeyModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.sankeyModule.Chart.base(this, 'setupByJSON', config, opt_default);
  this.data(config['data'] || null);
  this.palette(config['palette']);

  if ('tooltip' in config)
    this.tooltip().setupInternal(!!opt_default, config['tooltip']);
  if ('dropoff' in config)
    this.dropoff().setupInternal(!!opt_default, config['dropoff']);
  if ('flow' in config)
    this.flow().setupInternal(!!opt_default, config['flow']);
  if ('node' in config) {
    this.node().setupInternal(!!opt_default, config['node']);
  }
  anychart.core.settings.deserialize(this, anychart.sankeyModule.Chart.OWN_DESCRIPTORS, config, opt_default);
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
  // common
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
