import { redirect } from '@sveltejs/kit';
import { sql } from 'src/db/postgresql.server';

/**
 *
 * @param {string} d
 * @param {boolean} time
 * @returns {string}
 */

function dateFormat(d, time) {
	const date = new Date(d);

	if (time) {
		const formattedDate = date.toLocaleDateString('en-US');
		let hour = date.getHours() % 12;
		hour = hour ? hour : 12;
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const ampm = date.getHours() < 12 ? 'AM' : 'PM';

		return `${formattedDate} ${hour}:${minutes} ${ampm}`;
	} else {
		const formattedDate = date.toISOString();
		const month = Number(formattedDate.substring(5, 7));
		const day = Number(formattedDate.slice(8, 10));
		const year = formattedDate.substring(0, 4);

		return `${month}/${day}/${year}`;
	}
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	if (!locals.user) {
		redirect(301, '/Login');
	}

	const orgid = locals.user.orgid;
	let leads;
	let loadFailed = false;
	let leadActivity;

	try {
		leads = await sql`
			select 
				c.id as customer_id,
				c.first_name, 
				c.last_name, 
				c.date_of_birth, 
				c.email, 
				c.phone_1, 
				c.phone_2, 
				c.residence, 
				c.occupation,
				c.relationship, 
				c.prior_charges, 
				l.id as lead_id,
				l.finance_owner, 
				l.referral, 
				l.court, 
				l.case_number, 
				l.date_of_incident, 
				l.quote, 
				l.charges, 
				l.status, 
				l.reason_for_visit,
				l.current_attorney,
				l.next_court_date,
				l.next_court_reason,
				l.npr,
				l.financial_affidavit,
				l.archive
			from leads l 
			left join customers c on l.customer_id = c.id 
			where l.id = ${params.LeadID} and l.orgid = ${orgid}
			`.then((r) => r[0]);
	} catch (err) {
		console.log(err);
		loadFailed = true;
	}

	if (!leads) {
		redirect(301, '/Leads');
	}

	try {
		leadActivity =
			await sql`select id, created_at, type, text from activity where lead_id = ${params.LeadID}`;

		// console.log(leadActivity);
	} catch (err) {
		console.log(err);
		loadFailed = true;
	}

	const contact = {
		id: leads.customer_id,
		first_name: leads.first_name,
		last_name: leads.last_name,
		date_of_birth: leads.date_of_birth ? dateFormat(leads.date_of_birth, false) : '',
		email: leads.email,
		phone_1: leads.phone_1,
		phone_2: leads.phone_2,
		residence: leads.residence,
		occupation: leads.occupation,
		relationship: leads.relationship,
		prior_charges: leads.prior_charges
	};
	const lead = {
		id: leads.lead_id,
		finance_owner: leads.finance_owner,
		referral: leads.referral,
		court: leads.court,
		case_number: leads.case_number,
		date_of_incident: leads.date_of_incident ? dateFormat(leads.date_of_incident, false) : '',
		quote: leads.quote,
		charges: leads.charges,
		status: leads.status,
		reason_for_visit: leads.reason_for_visit,
		next_court_date: leads.next_court_date,
		next_court_reason: leads.next_court_reason,
		current_attorney: leads.current_attorney,
		npr: leads.npr,
		financial_affidavit: leads.financial_affidavit,
		archive: leads.archive
	};
	const activity = leadActivity.map((e) => {
		return {
			id: e.id,
			created_at: e.created_at,
			type: e.type,
			text: e.text,
			active: false,
			edit: false
		};
	});

	return { id: params.LeadID, contact, lead, activity };
}

export const actions = {
	newActivity: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData());
		const orgid = locals.user.orgid;
		const uid = locals.user.uid;
		let postActivity;
		const activity = {
			orgid,
			created_by: uid,
			lead_id: data.lead_id,
			type: data.type,
			text: data.text
		};

		try {
			postActivity = await sql`
			insert into activity ${sql(
				activity,
				'orgid',
				'created_by',
				'lead_id',
				'type',
				'text'
			)} returning *`;
		} catch (err) {
			console.log(err);
		}
	},
	editActivity: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData());
		const orgid = locals.user.orgid;
		const uid = locals.user.uid;
		let postActivity;
		const activity = {
			orgid,
			created_by: uid,
			lead_id: data.lead_id,
			type: data.type,
			text: data.text
		};

		try {
			postActivity = await sql`
			insert into activity ${sql(
				activity,
				'orgid',
				'created_by',
				'lead_id',
				'type',
				'text'
			)} returning *`;
		} catch (err) {
			console.log(err);
		}
	},
	deleteActivity: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		let postActivity;
		const id = data.id;

		try {
			postActivity = await sql`
			delete from activity where id = ${id} returning *`;
			console.log(`Deleted From Activity: ${JSON.stringify(postActivity)}`);
		} catch (err) {
			console.log(err);
		}
	}
};
