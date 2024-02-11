import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	const data = await request.json();

	console.log(data);
	const activity =
		await sql`update activity set "type" = ${data.type}, "text" = ${data.text} where id = ${data.id} returning *`;

	console.log(activity);

	if (activity.length) {
		return new Response(JSON.stringify({ activity }), {
			status: 201
		});
	}
}
