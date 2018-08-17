goog.provide('anychart.sankeyModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'sankey': {
    'nodePadding': 20,
    'nodeWidth': '12%',
    'curveFactor': 0.33,
    'tooltip': {
      'titleFormat': '{%name}',
      'format': '{%Value}'
    },

    'node': {
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        /**
         * @this {*}
         * @return {*}
         */
        'stroke': function() {
          return this['conflict'] ? '2 red' : 'none';
        },
        'labels': {
          'enabled': true,
          'format': '{%name}',
          'fontColor': 'black',
          'fontSize': 14,
          'disablePointerEvents': true
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnDarkenSourceColor
      }
    },

    'flow': {
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor50,
        'stroke': 'none',
        'labels': {
          'enabled': false,
          'disablePointerEvents': true,
          'fontColor': '#000',
          'padding': 0
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnDarkenSourceColor,
        'labels': {
          'enabled': true
        }
      }
    },

    'dropoff': {
      'normal': {
        'fill': {
          'angle': -90,
          'keys': [
            {'color': 'red', 'offset': 0},
            {'color': 'white', 'offset': 1}
          ]
        },
        'stroke': 'none',
        'labels': {
          'enabled': false,
          'disablePointerEvents': true,
          'fontColor': '#000',
          'padding': 0
        }
      },
      'hovered': {
        'labels': {
          'enabled': true
        }
      }
    }
  }
});
