export function evaluateSelection(target, selected, allowed) {
  if (!allowed.has(selected)) return 'ignored';
  return selected === target ? 'correct' : 'wrong';
}
export function createOwner() {
  let generation = 0;
  return {next: () => ++generation, current: token => token === generation, dispose: () => { generation++; }};
}
export function clampView(view) {
  const scale = Math.max(1, Math.min(5, view.scale));
  const xMax = 180 * (scale - 1), yMax = 90 * (scale - 1);
  return {scale, x: Math.max(-xMax, Math.min(xMax, view.x)), y: Math.max(-yMax, Math.min(yMax, view.y))};
}
export function resetView() { return {scale: 1, x: 0, y: 0}; }
