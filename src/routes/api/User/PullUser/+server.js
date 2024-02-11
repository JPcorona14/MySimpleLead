import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	//Need to add a check if its a number field being passed in to account for it int he query being sent through the sql function
	const data = await request.json();

	const uid = data.uid;
	console.log(uid);

	const userDetail = await sql`
		select orgid, uid from users where uid = ${uid}
	  `;

	console.log(userDetail);

	if (userDetail.length) {
		return new Response(JSON.stringify({ orgid: userDetail[0].orgid, uid }), {
			status: 201
		});
	} else {
		return new Response(JSON.stringify({ message: 'Failed' }));
	}
}
