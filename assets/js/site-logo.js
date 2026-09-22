(function () {
  function drawLogo(canvas) {
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var cssH = 32;
    var cssW = 220;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var color = getComputedStyle(canvas).color || '#1d1d1f';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var cy = cssH / 2;
    var r = 13;
    var cx = r + 1;
    var stroke = 2.2;

    // Circle
    ctx.lineWidth = stroke;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // < / > inside circle (line strokes, matching circle weight)
    ctx.lineWidth = stroke;
    var s = 5.2;
    // <
    ctx.beginPath();
    ctx.moveTo(cx - 1.2, cy - s);
    ctx.lineTo(cx - s - 0.2, cy);
    ctx.lineTo(cx - 1.2, cy + s);
    ctx.stroke();
    // /
    ctx.beginPath();
    ctx.moveTo(cx + 2.6, cy - s);
    ctx.lineTo(cx - 2.2, cy + s);
    ctx.stroke();
    // >
    ctx.beginPath();
    ctx.moveTo(cx + 3.4, cy - s);
    ctx.lineTo(cx + s + 2.4, cy);
    ctx.lineTo(cx + 3.4, cy + s);
    ctx.stroke();

    // Wordmark
    ctx.font = '700 17px "Avenir Next Rounded", "Nunito", "Segoe UI Rounded", "Arial Rounded MT Bold", "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('The Intelliwise', cx + r + 10, cy + 0.5);
  }

  function paintAll() {
    document.querySelectorAll('canvas.site-logo').forEach(drawLogo);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintAll);
  } else {
    paintAll();
  }
  window.addEventListener('resize', paintAll);
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintAll);
  }
})();
