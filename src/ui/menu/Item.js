goog.provide('anychart.ui.menu.Item');

goog.require('anychart.ui.menu.ItemRenderer');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.registry');



/**
 * Class representing an item in a menu.
 *
 * @param {goog.ui.ControlContent} content Text caption or DOM structure to
 *     display as the content of the item (use to add icons or styling to
 *     menus).
 * @param {*=} opt_model Data/model associated with the menu item.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper used for
 *     document interactions.
 * @param {anychart.ui.menu.ItemRenderer=} opt_renderer Optional renderer.
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
anychart.ui.menu.Item = function(content, opt_model, opt_domHelper, opt_renderer) {
  anychart.ui.menu.Item.base(this, 'constructor', content, opt_model, opt_domHelper,
      opt_renderer || anychart.ui.menu.ItemRenderer.getInstance());

  /**
   * Item is placed in a scrollable container.
   * @type {boolean}
   * @private
   */
  this.scrollable_ = false;

  this.setValue(opt_model);
};
goog.inherits(anychart.ui.menu.Item, goog.ui.MenuItem);
goog.tagUnsealableClass(anychart.ui.menu.Item);


/**
 * Get/set scrollable flag.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.ui.menu.Item}
 */
anychart.ui.menu.Item.prototype.scrollable = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.scrollable_ = opt_value;
    return this;
  } else {
    return this.scrollable_;
  }
};


/**
 * @suppress {accessControls}
 * @inheritDoc
 */
anychart.ui.menu.Item.prototype.render_ = function(opt_parentElement, opt_beforeNode) {
  // second check for anychart.ui.menu.Menu
  if (this.scrollable() && goog.isDef(this.getParent().getScrollableContainer)) {
    anychart.ui.menu.Item.superClass_.render_.call(this, this.getParent().getScrollableContainer(), opt_beforeNode);
    return;
  }
  anychart.ui.menu.Item.superClass_.render_.call(this, opt_parentElement, opt_beforeNode);
};


// Register a decorator factory function for anychart.ui.menu.Items.
goog.ui.registry.setDecoratorByClassName(anychart.ui.menu.ItemRenderer.CSS_CLASS,
    function() {
      // MenuItem defaults to using MenuItemRenderer.
      return new anychart.ui.menu.Item(null);
    });

