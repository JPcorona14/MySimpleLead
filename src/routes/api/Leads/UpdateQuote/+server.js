import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	//Need to add a check if its a number field being passed in to account for it int he query being sent through the sql function
	const data = await request.json();

	const quote = data.quote;

	const updatedField = await sql`
	update leads 
	set quote = ${quote}
	where id = ${data.id}
	returning *
  `;

	if (updatedField.length) {
		return new Response(JSON.stringify({ message: `Quote updated to ${updatedField[0].quote}` }), {
			status: 201
		});
	}
}
