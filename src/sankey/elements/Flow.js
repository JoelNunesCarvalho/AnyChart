goog.provide('anychart.sankeyModule.elements.Flow');
goog.require('anychart.sankeyModule.elements.VisualElement');



/**
 * Flow element settings.
 * @extends {anychart.sankeyModule.elements.VisualElement}
 * @param {anychart.sankeyModule.Chart} chart
 * @constructor
 */
anychart.sankeyModule.elements.Flow = function(chart) {
  anychart.sankeyModule.elements.Flow.base(this, 'constructor', chart);
};
goog.inherits(anychart.sankeyModule.elements.Flow, anychart.sankeyModule.elements.VisualElement);
