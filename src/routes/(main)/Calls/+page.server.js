import { redirect } from '@sveltejs/kit';
import { sql } from 'src/db/postgresql.server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	if (!locals.user) {
		redirect(301, '/Login');
	}

	const orgid = locals.user.orgid;

	let calls = await sql`select * from call_log where orgid = ${orgid}`;

	return { calls };
}

export const actions = {
	NewCall: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData());
		const callPost = {
			orgid: locals.user.orgid,
			created_by: locals.user.uid,
			first_name: data.first_name ?? null,
			last_name: data.last_name ?? null,
			phone: data.phone,
			reason_for_call: data.reason_for_call ?? null,
			notes: data.notes ?? null,
			call_direction: data.call_direction === 'true' ? true : false
		};
		let addCall;

		try {
			addCall = await sql`insert into call_log ${sql(
				callPost,
				'orgid',
				'created_by',
				'first_name',
				'last_name',
				'phone',
				'reason_for_call',
				'notes',
				'call_direction'
			)} returning *`;
		} catch (err) {
			console.log(err);
			return { error: true, message: err.column_name, data };
		}
	}
};
