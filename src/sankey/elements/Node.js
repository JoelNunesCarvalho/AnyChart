goog.provide('anychart.sankeyModule.elements.Node');
goog.require('anychart.sankeyModule.elements.VisualElement');



/**
 * Node element settings.
 * @extends {anychart.sankeyModule.elements.VisualElement}
 * @constructor
 */
anychart.sankeyModule.elements.Node = function(chart) {
  anychart.sankeyModule.elements.Node.base(this, 'constructor', chart);
};
goog.inherits(anychart.sankeyModule.elements.Node, anychart.sankeyModule.elements.VisualElement);
