import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ platform }) => {
	const { keys } = await platform?.env.SCOTTS_FONTS.list();
	const fontKeys = keys.filter((key) => key.name !== 'domains' && key.name !== 'whitelist');
	const fonts = {};

	for (const key of fontKeys) {
		const font = await platform?.env.SCOTTS_FONTS.get(key.name, 'arrayBuffer');
		fonts[key.name] = font ? font.byteLength : 0; // or any other relevant info
	}

	return new Response(JSON.stringify(fonts), {
		headers: { 'Content-Type': 'application/json' }
	});
};
