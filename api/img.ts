export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const sz = url.searchParams.get('sz') ?? 'w200';

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response('Missing or invalid id', { status: 400 });
  }

  const driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`;

  try {
    const upstream = await fetch(driveUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Seazone/1.0)' },
    });

    if (!upstream.ok) {
      return new Response(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'CDN-Cache-Control': 'public, max-age=86400',
        'Vercel-CDN-Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
