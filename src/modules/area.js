goog.provide('anychart.modules.area');

goog.require('anychart.charts.Cartesian');
goog.require('anychart.core.cartesian.series.Area');
goog.require('anychart.core.cartesian.series.RangeArea');
goog.require('anychart.core.cartesian.series.RangeSplineArea');
goog.require('anychart.core.cartesian.series.RangeStepArea');
goog.require('anychart.core.cartesian.series.SplineArea');
goog.require('anychart.core.cartesian.series.StepArea');
goog.require('anychart.modules.base');


/**
 * Default area chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.area([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for area series.
 */
anychart.area = function(var_args) {
  var chart = new anychart.charts.Cartesian();

  chart.defaultSeriesType(anychart.enums.CartesianSeriesType.AREA);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart.area(arguments[i]);
  }

  chart.title().text('Chart Title').fontWeight('bold');

  chart.xAxis();
  chart.yAxis();

  chart.grid(0)
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.minorGrid()
      .evenFill('none')
      .oddFill('none')
      .stroke('black 0.075')
      .layout(anychart.enums.Layout.HORIZONTAL);

  chart.grid(1)
      .evenFill('none')
      .oddFill('none')
      .layout(anychart.enums.Layout.VERTICAL);

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.AREA] = anychart.area;


/**
 * Default area chart.<br/>
 * <b>Note:</b> Contains predefined settings for axes and grids.
 * @example
 * anychart.area([1.3, 2, 1.4], [1.1, 1.6, 1.3])
 *   .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Area chart data.
 * @return {anychart.charts.Cartesian} Chart with defaults for area series.
 * @deprecated Use anychart.area() instead.
 */
anychart.areaChart = anychart.area;

//exports
goog.exportSymbol('anychart.area', anychart.area);//doc|ex
goog.exportSymbol('anychart.areaChart', anychart.areaChart);//doc|ex
