import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	const data = await request.json();
	const newData = {
		id: data.id,
		due: `${data.dueDate} ${data.dueTime}`,
		text: data.text
	};

	// console.log(data);
	const task =
		await sql`update task set due = ${newData.due}, "text" = ${newData.text} where id = ${newData.id} returning *`;

	// console.log(task);

	if (task.length) {
		return new Response(JSON.stringify({ task }), {
			status: 201
		});
	}
}
