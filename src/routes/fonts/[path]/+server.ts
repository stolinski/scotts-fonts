import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ request, platform, params }) => {
	console.log(`[LOGGING FROM /hello]: Request came from ${request.url}`);

	const origin = request.headers.get('Origin');
	const { SCOTTS_FONTS } = platform?.env || {};

	if (SCOTTS_FONTS) {
		const allowed = await isAllowedDomain(origin!, SCOTTS_FONTS);

		if (!allowed) {
			return new Response('Forbidden', { status: 403 });
		}

		const font = await SCOTTS_FONTS.get(params.path, 'arrayBuffer');

		if (!font) {
			return new Response('Font not found', { status: 404 });
		}

		return new Response(font, {
			headers: {
				'Content-Type': 'font/woff2',
				'Cache-Control': 'public, max-age=31536000',
				'Access-Control-Allow-Origin': origin!,
				'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		});
	}
	return new Response('Not Available', { status: 401 });
};

async function isAllowedDomain(url: string, SCOTTS_FONTS: KVNamespace) {
	try {
		const allowedDomains = JSON.parse((await SCOTTS_FONTS.get('domains')) || '[]') as string[];
		const { hostname } = new URL(url);

		return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
	} catch (error) {
		console.error('Invalid URL:', error);
		return false;
	}
}
