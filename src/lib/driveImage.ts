export function getDriveImageUrl(url: string | null | undefined, sz = 'w200'): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  return `/api/img?id=${match[1]}&sz=${sz}`;
}
