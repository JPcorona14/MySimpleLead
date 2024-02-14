import { redirect } from '@sveltejs/kit';
import { sql } from 'src/db/postgresql.server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (!locals?.user) {
		throw redirect(301, '/Login');
	}
	const orgid = locals.user.orgid;

	//List of Leads are pulled from the server to then generate the leads break out by card in each board
	const leads =
		await sql`select l.id, c.first_name, l.quote, l.charges, l.status, l.archive from leads l left join customers c on l.customer_id = c.id where l.orgid = ${orgid}`;

	//List of customers is pulled so that when a user attempts to add a new lead for an existing customer, the list is already generated.
	const customers =
		await sql`select id, first_name, last_name from customers where orgid = ${orgid}`;

	//This takes the leads and arranges the data to be easily used by each lead card.
	const leadList = leads.map((e) => {
		return {
			id: e.id,
			Name: e.first_name,
			Quote: e.quote,
			Charge: e.charges,
			Status: e.status,
			Archive: e.archive
		};
	});

	//Takes the list of customers and gets it ready for the drop down list
	const customerList = customers.map((e) => {
		return {
			id: e.id,
			Name: `${e.first_name} ${e.last_name}`
		};
	});

	return { leadList, customerList };
}

export const actions = {
	NewLead: async ({ request, locals }) => {
		const data = Object.fromEntries(await request.formData());
		const orgid = locals.user.orgid;
		const uid = locals.user.uid;
		const existingCustomer = data.existingCustomer === 'true' ? true : false;

		/**
		 * @typedef {object} NewCustomer
		 * @property {string} orgid
		 * @property {string} created_by
		 * @property {string} first_name
		 * @property {string} last_name
		 * @property {string} email
		 * @property {string} phone_1
		 * @property {string} phone_2
		 * @property {string} date_of_birth
		 * @property {string} occupation
		 * @property {string} residence
		 * @property {string} relationship
		 * @property {string} prior_charges
		 *
		 */

		/**@type {NewCustomer} */
		let addCustomer;
		let newCustomer;

		if (!existingCustomer) {
			newCustomer = {
				orgid,
				created_by: uid,
				first_name: data.first_name === '' ? null : data.first_name,
				last_name: data.last_name === '' ? null : data.last_name,
				email: data.email || null,
				phone_1: data.phone_1 || null,
				phone_2: data.phone_2 || null,
				date_of_birth: data.date_of_birth || null,
				occupation: data.occupation || null,
				residence: data.residence || null,
				relationship: data.relationship,
				prior_charges: data.prior_charges || null
			};

			try {
				addCustomer = await sql`insert into customers ${sql(
					newCustomer,
					'orgid',
					'created_by',
					'first_name',
					'last_name',
					'email',
					'phone_1',
					'phone_2',
					'date_of_birth',
					'occupation',
					'residence',
					'relationship',
					'prior_charges'
				)} returning *`;
			} catch (err) {
				//Need to have this return the data back and fill in the fields so the user doesn't have to enter them again
				//Need to also add in a pop up notification system to let the user know that the lead could not be enterred
				//Will also need to make it so that the field with the error shows what the error was about
				console.log(err.column_name);
				return { error: true, message: err.column_name, data };
			}
		}

		if (existingCustomer || addCustomer.length) {
			const newLead = {
				orgid: orgid,
				created_by: uid,
				customer_id: existingCustomer ? data.customerID : addCustomer[0].id,
				finance_owner: data.finance_owner || null,
				referral: data.referral || null,
				court: data.court || null,
				case_number: data.case_number || null,
				date_of_incident: data.date_of_incident || null,
				quote: data.quote || null,
				charges: data.charges || null,
				reason_for_visit: data.reason_for_visit || null,
				status: data.status
			};

			let addLead;
			try {
				addLead = await sql`insert into leads ${sql(
					newLead,
					'orgid',
					'created_by',
					'customer_id',
					'finance_owner',
					'referral',
					'court',
					'case_number',
					'date_of_incident',
					'quote',
					'charges',
					'reason_for_visit',
					'status'
				)} returning *`;
			} catch (err) {
				//Need to have this return the data back and fill in the fields so the user doesn't have to enter them again
				//Need to also add in a pop up notification system to let the user know that the lead could not be enterred
				//Will also need to make it so that the field with the error shows what the error was about
				console.log(err);
			}

			if (addLead.length) {
				const addActivity = await sql`
				insert into activity (
					orgID, 
					created_by, 
					lead_id, 
					type, 
					"text"
				) values (
					'TSL',
					1,
					${addLead[0].id},
					'Event',
					'Lead Created'
				) returning *`;

				console.log(addActivity);
			}
		}
	}
};
