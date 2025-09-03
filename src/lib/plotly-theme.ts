export function getPlotlyCardLayout(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
    };
  }
  const style = getComputedStyle(document.documentElement);
  const card = style.getPropertyValue('--card').trim() || '#ffffff';
  return {
    paper_bgcolor: card,
    plot_bgcolor: card,
  };
}
