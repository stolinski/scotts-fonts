import { CODE } from '$env/static/private';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ platform }) => {
	const whitelist = (await platform?.env.SCOTTS_FONTS.get('domains')) || '[]';
	return new Response(whitelist, {
		headers: { 'Content-Type': 'application/json' }
	});
};
export const POST: RequestHandler = async ({ platform, request }) => {
	const { domains, code } = (await request.json()) as { domains: string[]; code: string };
	if (!domains) {
		return new Response('Bad Request', { status: 400 });
	}

	if (code !== CODE) {
		return new Response('Access Code Invalid', { status: 401 });
	}

	await platform?.env.SCOTTS_FONTS.put('domains', JSON.stringify(domains));
	return new Response('Whitelist updated', { status: 200 });
};
