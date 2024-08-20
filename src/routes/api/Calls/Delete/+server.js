import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	const data = await request.json();

	// console.log(data);
	const removed = await sql`DELETE FROM call_log WHERE id = ${data.id} returning *`;

	console.log(removed);

	if (removed.length) {
		return new Response(JSON.stringify({ removed }), {
			status: 201
		});
	}
}
