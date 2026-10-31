export function formatPath(p: string) {
  if(p === '/') return '/';
  if(p.endsWith("/")) {
    return p.slice(0, p.length - 1)
  }
  return p;
}

export function isPath(url: string, p: string) {
  return p === formatPath(url);
}
