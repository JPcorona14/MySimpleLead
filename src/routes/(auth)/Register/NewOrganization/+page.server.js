import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'src/db/postgresql.server.js';
import { authHandlers } from 'src/routes/stores/authStore.js';
import z from 'zod';

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
		orgID: z
			.string({ required_error: 'Organization ID is required' })
			.min(1, { message: 'Organization ID is required' })
			.max(32, { message: 'Organization ID is to Long' })
			.refine((val) => !/[ _!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/g.test(val), {
				message: 'Organization ID must only contain letters and numbers'
			}),
		username: z
			.string({ required_error: 'Username is required' })
			.min(1, { message: 'Username is required' })
			.max(32, { message: 'Username must be under 32 characters.' })
			.trim()
			.refine((val) => !/[ !@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/g.test(val), {
				message: 'Username may only have letters, numbers, and underscores'
			}),
		email: z
			.string({ required_error: 'Email is required' })
			.min(1, { message: 'Email is required' })
			.email({ message: 'Please ensure your email is in the proper format' })
			.refine((val) => checkEmail(val), {
				message: 'Email can not contain any special characters other than "@ + . _ -"'
			}),
		fName: z
			.string({ required_error: 'First Name is required' })
			.min(1, { message: 'First Name is required' })
			.max(64, { message: 'First Name can not be longer than 64 characters' })
			.trim()
			.refine((val) => checkString(val), {
				message: 'First name can not include any numbers or special characters'
			}),
		lName: z
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
		confirmPassword: z
			.string({ required_error: 'Confirmation Password is required' })
			.min(1, { message: 'Confirmation Password is required' })
			.max(24, { message: 'Confirmation Password must be under 24 characters' })
			.trim()
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'Confirmed password did not match password field',
				path: ['confirmPassword']
			});
		}
	});

export const actions = {
	default: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		const orgid = data.orgid;
		const first_name = data.first_name;
		const last_name = data.last_name;
		const email = data.Email;
		const password = data.password;
		const cPassword = data.cPassword;
		let userRegistration;
		let error;

		if (!email || !password) {
			return fail(301, { message: 'Need Email and Password' });
		} else if (password !== cPassword) {
			return fail(301, { message: 'Passwords do not match!' });
		} else if (email || password) {
			try {
				userRegistration = await authHandlers.signup(email, password);
				if (userRegistration.user) {
					const newUser = {
						orgid,
						first_name,
						last_name,
						email,
						uid: userRegistration.user.email,
						status: true
					};

					const savedUser = await sql`insert into users ${sql(newUser)} returning *`;
					console.log(savedUser);
				}
			} catch (err) {
				error = err.message;
				console.log(err.message);
			} finally {
				if (userRegistration?.operationType) {
					redirect(302, '/Login');
				} else if (error) {
					return { message: error };
				} else {
					return { message: 'Something went wrong but who knows what it is?!' };
				}
			}
		} else {
			return fail(301, { message: 'Something went wrong but who knows what it is?!' });
		}
	}
};
