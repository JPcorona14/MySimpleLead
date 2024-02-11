import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	//Need to add a check if its a number field being passed in to account for it int he query being sent through the sql function
	const data = await request.json();

	let updates;

	if (data.fieldName === 'date_of_birth') {
		//Need to convert Dat of Birth to proper format first
		const date = new Date(data.value);
		const dob = date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
		updates = {
			date_of_birth: dob
		};
	} else if (data.fieldName === 'relationship') {
		updates = {
			relationship: data.value === 'true' ? true : data.value === 'false' ? false : null
		};
	} else {
		updates = {
			[data.fieldName]: data.value
		};
	}

	const updatedField = await sql`
	update customers 
	set ${sql(updates, data.fieldName)}
	where id = ${data.id}
	returning *
  `;

	if (updatedField.length) {
		return new Response(
			JSON.stringify({
				message: `${data.fieldName} updated to ${data.value}`,
				data: updatedField[0]
			}),
			{
				status: 201
			}
		);
	}
}
