var palette, stage, index, count;
function load() {
  index;
  count = 12;

  stage = acgraph.create('100%', '100%', 'container');
  palette = new anychart.utils.ColorPalette();
  palette.listen('invalidated', function() {
    stage.removeChildren();
    draw();
  });
  draw();

  palette.colorAt(0, 'green');
  palette.colors(['red', 'green', 'blue']);
}

function draw() {
  for (index = 0; index <= count; index++) {
    var rect = stage.rect(40 * index, 40, 30, 30);
    rect.fill(palette.colorAt(index));
  }
}

