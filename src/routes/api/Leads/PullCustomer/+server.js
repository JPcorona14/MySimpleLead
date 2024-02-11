import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	const data = await request.json();

	const customer = await sql`select * from customers where id = ${data.id}`;

	if (customer.length) {
		return new Response(JSON.stringify({ customer: customer }), {
			status: 201
		});
	}
}
