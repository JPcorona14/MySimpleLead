export const handle = async ({ event, resolve }) => {
	const orgid = event.cookies.get('orgid');
	const uid = event.cookies.get('uid');

	if (!orgid || !uid) {
		return await resolve(event);
	}

	if (orgid || uid) {
		event.locals.user = {
			orgid,
			uid
		};
	}

	const response = await resolve(event);

	return response;
};
