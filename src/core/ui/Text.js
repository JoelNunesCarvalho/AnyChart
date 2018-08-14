goog.provide('anychart.core.ui.Text');
goog.require('anychart.math.Rect');


/**
 * @constructor
 */
anychart.core.ui.Text = function() {
  this.renderer = acgraph.getRenderer();
  this.text_ = '';
  this.style_ = {};
  this.baseLine = 0;
};


/**
 * Text.
 * @param {string} value
 */
anychart.core.ui.Text.prototype.text = function(value) {
  this.text_ = value;
};


/**
 * Style object.
 * @param {Object} value
 */
anychart.core.ui.Text.prototype.style = function(value) {
  this.style_ = value;
};


/**
 * Creating DOM element.
 */
anychart.core.ui.Text.prototype.createDom = function() {
  this.domElement = this.renderer.createTextElement();
};


/**
 * Render to container
 * @param {Element} element
 */
anychart.core.ui.Text.prototype.renderTo = function(element) {
  element.appendChild(this.getDomElement());
};


/**
 * Setting position.
 * @param {number} x
 * @param {number} y
 */
anychart.core.ui.Text.prototype.setPosition = function(x, y) {
  var dom = this.getDomElement();

  if (goog.isDef(x))
    dom.setAttribute('x', x);
  if (goog.isDef(y))
    dom.setAttribute('y', y + this.baseLine);
};


/**
 * Returns text DOM element.
 * @return {Element}
 */
anychart.core.ui.Text.prototype.getDomElement = function() {
  if (!this.domElement)
    this.createDom();

  return this.domElement;
};


/**
 * Applying settings.
 */
anychart.core.ui.Text.prototype.applySettings = function() {
  var style = this.style_;
  var dom = this.getDomElement();

  if (!goog.object.isEmpty(style)) {
    var cssString = '';
    if (style['fontStyle']) {
      cssString += 'font-style: ' + style['fontStyle'] + ';';
    }

    if (style['fontVariant']) {
      cssString += 'font-variant: ' + style['fontVariant'] + ';';
    }

    if (style['fontFamily']) {
      cssString += 'font-family: ' + style['fontFamily'] + ';';
    }

    if (style['fontSize']) {
      cssString += 'font-size: ' + style['fontSize'] + ';';
    }

    if (style['fontWeight']) {
      cssString += 'font-weight: ' + style['fontWeight'] + ';';
    }

    if (style['letterSpacing']) {
      cssString += 'letter-spacing: ' + style['letterSpacing'] + ';';
    }

    if (style['fontDecoration']) {
      cssString += 'text-decoration: ' + style['fontDecoration'] + ';';
    }

    if (style['fontColor']) {
      cssString += 'fill: ' + style['fontColor'] + ';';
    }

    if (style['fontOpacity']) {
      cssString += 'opacity: ' + style['fontOpacity'] + ';';
    }

    dom.style.cssText = cssString;
  }
  dom.textContent = this.text_;
};


/**
 * Getting bounds.
 * @return {anychart.math.Rect}
 */
anychart.core.ui.Text.prototype.getBounds = function() {
  if (!this.bounds_) {
    var dom = this.getDomElement();
    var bbox = dom['getBBox']();

    this.bounds_ = new anychart.math.Rect(bbox.x, -bbox.y, bbox.width, bbox.height);
    this.baseLine = -bbox.y;
  }
  return this.bounds_;
};