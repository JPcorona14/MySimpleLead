import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	const data = await request.json();

	// console.log(data);
	const task =
		await sql`update task set "completed" = ${data.completed} where id = ${data.id} returning *`;

	// console.log(task);

	if (task.length) {
		return new Response(JSON.stringify({ task }), {
			status: 201
		});
	}
}
