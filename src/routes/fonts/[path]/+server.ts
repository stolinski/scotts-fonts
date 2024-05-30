import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ request, platform, params }) => {
	console.log(`[LOGGING FROM /]: Request came from ${request.url}`);

	const origin = request.headers.get('Referer');
	const og = request.headers.get('Origin');
	console.log('refer', origin);
	console.log('og', og);

	const { SCOTTS_FONTS } = platform?.env || {};

	if (SCOTTS_FONTS) {
		const allowed = await is_allowed_domain(origin!, SCOTTS_FONTS);

		if (!allowed) {
			return new Response('Forbidden', { status: 403 });
		}

		const font = await SCOTTS_FONTS.get(params.path, 'arrayBuffer');

		if (!font) {
			return new Response('Font not found', { status: 404 });
		}

		// This is here because Safari doesn't reliably set the Origin header, referer has "/" at the end causing cors issues.
		const allow_origin = origin?.endsWith('/') ? origin.slice(0, -1) : origin;
		console.log('allow_origin', allow_origin);
		return new Response(font, {
			headers: {
				'Content-Type': 'font/woff2',
				'Cache-Control': 'public, max-age=31536000',
				'Access-Control-Allow-Origin': allow_origin!,
				'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		});
	}
	return new Response('Not Available', { status: 401 });
};

async function is_allowed_domain(url, SCOTTS_FONTS) {
	try {
		const domains = await SCOTTS_FONTS.get('domains');
		const domains_array = domains ? JSON.parse(domains) : [];
		if (!domains) {
			console.error('No allowed domains found');
			return false;
		}

		const allowed_domains = domains_array[0].split(',');
		const hostname = new URL(url).hostname;
		console.log('hostname', hostname);

		for (const domain of allowed_domains) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				return true;
			}
			// Check for wildcard match
			if (domain.includes('*')) {
				const wildcard_regex = new RegExp(`^${domain.replace(/\*/g, '.*')}$`);
				if (wildcard_regex.test(hostname)) {
					return true;
				}
			}
		}

		return false;
	} catch (error) {
		console.error('Invalid URL:', error);
		return false;
	}
}
