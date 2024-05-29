import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ request, platform, params }) => {
	console.log(`[LOGGING FROM /hello]: Request came from ${request.url}`);

	const origin = request.headers.get('Referer');

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
