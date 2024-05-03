import { redirect } from '@sveltejs/kit';
import { sql } from 'src/db/postgresql.server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	if (!locals.user) {
		redirect(301, '/Login');
	}
}
