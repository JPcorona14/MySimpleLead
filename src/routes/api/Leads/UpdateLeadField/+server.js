import { sql } from 'src/db/postgresql.server';

export async function POST({ request }) {
	//Need to add a check if its a number field being passed in to account for it int he query being sent through the sql function
	const data = await request.json();

	let updates;
	let isDate = false;

	if (data.fieldName === 'date_of_incident' || data.fieldName === 'next_court_date') {
		//Need to convert Dates to proper format first
		console.log(data.value);
		const date = new Date(data.value);
		const doi = date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});

		console.log(doi);
		updates = {
			[data.fieldName]: doi
		};
		isDate = true;
	} else {
		updates = {
			[data.fieldName]: data.value
		};
	}

	console.log(updates);

	let updatedField = await sql`
	update leads 
	set ${sql(updates, data.fieldName)}
	where id = ${data.id}
	returning *
  `;

	if (updatedField.length && isDate) {
		updatedField = updatedField.map((e) => {
			const date = new Date(e[data.fieldName]);

			const formattedDate = date.toISOString();
			const month = Number(formattedDate.substring(5, 7));
			const day = Number(formattedDate.slice(8, 10));
			const year = formattedDate.substring(0, 4);

			return { ...e, [data.fieldName]: `${month}/${day}/${year}` };
		});
	}

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
