import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'src/db/postgresql.server.js';
import { authHandlers } from 'src/routes/stores/authStore.js';
import z from 'zod';

/**
 * @typedef {Object} NewUser
 * @property {string} orgid
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} password
 * @property {string} cPassword
 * @property {string} uid
 * @property {boolean} status
 */

/** @param {string} str */
function checkString(str) {
	//Checks the string to ensure no numbers or special characters are included
	return /\d/.test(str) || /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]/.test(str) ? false : true;
}

/** @param {string} str */
function checkEmail(str) {
	//Checks the email to ensure the only special characters that are allowed are "@ + . - _"
	return !/[!#$%^&*()\=\[\]{};':"\\|,<>\/?]/.test(str);
}

/** @param {string} str */
function checkPassword(str) {
	//Checks for the criteria of the password to ensure it has 1 upper case letter, 1 lower case letter, 1 number, and 1 special character
	const upperCase = (str.match(/[A-Z]/g) || []).length;
	const letters = (str.match(/[a-z]/g) || []).length;
	const digits = (str.match(/\d/g) || []).length;
	const specialChar = (str.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

	if (upperCase < 1 || letters < 1 || digits < 1 || specialChar < 1 || str.length < 6) {
		return false;
	} else {
		return true;
	}
}

const registerUser = z
	.object({
		orgid: z.string({ required_error: 'Organization ID is required' }),
		email: z
			.string({ required_error: 'Email is required' })
			.min(1, { message: 'Email is required' })
			.email({ message: 'Please ensure your email is in the proper format' })
			.refine((val) => checkEmail(val), {
				message: 'Email can not contain any special characters other than "@ + . _ -"'
			}),
		first_name: z
			.string({ required_error: 'First Name is required' })
			.min(1, { message: 'First Name is required' })
			.max(64, { message: 'First Name can not be longer than 64 characters' })
			.trim()
			.refine((val) => checkString(val), {
				message: 'First name can not include any numbers or special characters'
			}),
		last_name: z
			.string({ required_error: 'Last Name is required' })
			.min(1, { message: 'Last Name is required' })
			.max(64, { message: 'Last Name can not be longer than 64 characters' })
			.trim()
			.refine((val) => checkString(val), {
				message: 'Last name can not include any numbers or special characters'
			}),
		password: z
			.string({ required_error: 'Password is required' })
			.min(1, { message: 'Password is required' })
			.max(24, { message: 'Password must be under 24 characters' })
			.trim()
			.refine((val) => checkPassword(val), {
				message: 'Password does not meet requirement'
			}),
		cPassword: z
			.string({ required_error: 'Confirmation Password is required' })
			.min(1, { message: 'Confirmation Password is required' })
			.max(24, { message: 'Confirmation Password must be under 24 characters' })
			.trim(),
		uid: z.string({ required_error: 'No UID loaded' }).default(''),
		status: z.boolean({ required_error: 'Status is Missing' }).default(false)
	})
	.superRefine(({ password, cPassword }, ctx) => {
		if (password !== cPassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'Confirmed password did not match password field',
				path: ['confirmPassword']
			});
		}
	});

export const actions = {
	registerUser: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		let userRegistration;
		let error;
		let postData;
		let accCreation = false;

		/** @type {NewUser} */
		let userAccount;

		try {
			userAccount = registerUser.parse(data);
			console.log('User Account Done');
		} catch (err) {
			console.log(err);
			const { fieldErrors: errors } = err.flatten();
			return fail(300, {
				error: errors,
				orgid: data.orgid,
				orgName: data.orgName,
				email: data.email,
				first_name: data.first_name,
				last_name: data.last_name,
				password: data.password,
				cPassword: data.cPassword
			});
		}

		try {
			userRegistration = await authHandlers.signup(userAccount.email, userAccount.password);
			if (userRegistration.user) {
				userAccount.uid = userRegistration.user.uid;
				userAccount.status = true;

				const savedUser =
					await sql`insert into users ${sql(userAccount, 'orgid', 'first_name', 'last_name', 'email', 'uid', 'status')} returning *`;
				console.log(savedUser);
				accCreation = true;
			}
		} catch (err) {
			error = err.message;
			console.log(err.message);
		} finally {
			if (accCreation) {
				redirect(302, '/Login');
			} else if (error) {
				return { message: error };
			} else {
				return { message: 'Something went wrong but who knows what it is?!', postData };
			}
		}
	},
	searchOrg: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		let postData;
		try {
			postData = await sql`select orgid, name from organizations where orgid = ${data.orgid}`;
			return { message: 'Success', orgid: postData[0].orgid, orgName: postData[0].name };
		} catch (err) {
			return { message: 'Failed to pull from database', postData };
		}
	}
};
