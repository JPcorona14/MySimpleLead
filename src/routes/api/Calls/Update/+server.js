import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	const data = await request.json();

	console.log(data);
	const task =
		await sql`update call_log set "first_name" = ${data.fName}, "last_name" = ${data.lName}, "phone" = ${data.phone}, "reason_for_call" = ${data.rfc}, "notes" = ${data.notes}, "call_direction" = ${data.callDirect} where id = ${data.id} returning *`;

	console.log(task);

	if (task.length) {
		return new Response(JSON.stringify({ task }), {
			status: 201
		});
	}
}
