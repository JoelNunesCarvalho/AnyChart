goog.provide('anychart.sankeyModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'sankey': {
    'nodePadding': 8,
    'nodeWidth': 24,
    'curveFactor': 0.33,
    'tooltip': {
      'titleFormat': '{%name}',
      'format': '{%Value}'
    },

    'node': {
      'normal': {
        'fill': anychart.core.defaultTheme.returnSourceColor,
        'stroke': 'none',
        'labels': {
          'enabled': true,
          'format': '{%name}',
          'fontColor': 'black',
          'fontSize': 10,
          'disablePointerEvents': true
        }
      },
      'hovered': {
        'fill': anychart.core.defaultTheme.returnSourceColor
      }
    },

    'flow': {
      'normal': {
        'fill': 'grey 0.3',
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
