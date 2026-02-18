// Computes a sensible basename for GitHub Pages and other subpath deployments.
// If you deploy under https://<user>.github.io/<repo>/, basename becomes '/<repo>'.
export function computeBasename(): string {
  const { hostname, pathname } = window.location
  if (hostname.endsWith('github.io')) {
    const parts = pathname.split('/').filter(Boolean)
    return parts.length > 0 ? `/${parts[0]}` : ''
  }
  return ''
}
