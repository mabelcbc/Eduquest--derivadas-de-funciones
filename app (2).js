class GraphManager {
  constructor() {
    this.mainDiv = 'plotly-graph';
    this.xrDiv = 'xr-plotly-overlay';
    this.xRange = [-5.5, 5.5];
    this.yRange = [-6, 6];
  }

  render(state) {
    const { series, tangent, showFx, showDfx, showTangent } = state;
    const traces = [];
    if (showFx) traces.push({ x: series.xs, y: series.ysFx, mode: 'lines', name: 'f(x)', line: { color: '#00d4ff', width: 3 } });
    if (showDfx) traces.push({ x: series.xs, y: series.ysDfx, mode: 'lines', name: "f'(x)", line: { color: '#a3e635', width: 2.5, dash: 'dash' } });
    if (showTangent && tangent.valid) {
      traces.push({ x: tangent.xs, y: tangent.ys, mode: 'lines', name: 'Tangente', line: { color: '#f97316', width: 2.5 } });
      traces.push({ x: [tangent.x0], y: [tangent.y0], mode: 'markers', name: 'Punto', marker: { color: '#f97316', size: 11 } });
    }
    const layout = {
      paper_bgcolor: '#060d1f', plot_bgcolor: '#060d1f', font: { color: '#f8fafc', family: 'Inter' },
      margin: { t: 25, r: 20, b: 40, l: 45 },
      xaxis: { range: this.xRange, gridcolor: 'rgba(148,163,184,0.15)', zerolinecolor: 'rgba(0,212,255,0.5)' },
      yaxis: { range: this.yRange, gridcolor: 'rgba(148,163,184,0.15)', zerolinecolor: 'rgba(0,212,255,0.5)' },
      legend: { orientation: 'h', y: 1.12, x: 0.02, bgcolor: 'rgba(13,25,51,0.7)' }
    };
    Plotly.react(this.mainDiv, traces, layout, { responsive: true, displaylogo: false });
    this.renderMiniXR(traces);
  }

  renderMiniXR(traces) {
    const xrEl = document.getElementById(this.xrDiv);
    if (!xrEl) return;
    Plotly.react(this.xrDiv, traces, {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(6,13,31,0.65)',
      margin: { t: 5, r: 5, b: 20, l: 25 }, showlegend: false,
      xaxis: { range: this.xRange, tickfont: { size: 9, color: '#cbd5e1' } },
      yaxis: { range: this.yRange, tickfont: { size: 9, color: '#cbd5e1' } }
    }, { staticPlot: true });
  }

  pan(dx, dy) {
    this.xRange = [this.xRange[0] + dx, this.xRange[1] + dx];
    this.yRange = [this.yRange[0] + dy, this.yRange[1] + dy];
    Plotly.relayout(this.mainDiv, { 'xaxis.range': this.xRange, 'yaxis.range': this.yRange });
  }

  zoom(factor) {
    const xMid = (this.xRange[0] + this.xRange[1]) / 2, yMid = (this.yRange[0] + this.yRange[1]) / 2;
    const xHalf = Math.max(1.5, ((this.xRange[1] - this.xRange[0]) / 2) * factor);
    const yHalf = Math.max(1.5, ((this.yRange[1] - this.yRange[0]) / 2) * factor);
    this.xRange = [xMid - xHalf, xMid + xHalf];
    this.yRange = [yMid - yHalf, yMid + yHalf];
    Plotly.relayout(this.mainDiv, { 'xaxis.range': this.xRange, 'yaxis.range': this.yRange });
  }

  resetRange() {
    this.xRange = [-5.5, 5.5]; this.yRange = [-6, 6];
    Plotly.relayout(this.mainDiv, { 'xaxis.range': this.xRange, 'yaxis.range': this.yRange });
  }
}