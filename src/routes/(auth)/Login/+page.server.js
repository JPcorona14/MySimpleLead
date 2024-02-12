import { redirect } from '@sveltejs/kit';
import z from 'zod';

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

const registerUser = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.min(1, { message: 'Email is required' })
		.email({ message: 'Please ensure your email is in the proper format' })
		.refine((val) => checkEmail(val), {
			message: 'Email can not contain any special characters other than "@ + . _ -"'
		}),

	password: z
		.string({ required_error: 'Password is required' })
		.min(1, { message: 'Password is required' })
		.max(24, { message: 'Password must be under 24 characters' })
		.trim()
		.refine((val) => checkPassword(val), {
			message: 'Password does not meet requirement'
		})
});

export const load = async ({ locals }) => {
	console.log(locals.user);
	if (locals.user) {
		redirect(301, '/Leads');
	}
};

// export const actions = {
// 	default: async ({ request }) => {
// 		const data = Object.fromEntries(await request.formData());
// 		/**@type {string} */
// 		const email = data.email.toString();
// 		/**@type {string} */
// 		const password = data.password.toString();
// 		let userLogin;

// 		if (!email || !password) {
// 			return fail(301, { message: 'Need Email and Password' });
// 		} else if (email || password) {
// 			try {
// 				userLogin = await authHandlers.login(email, password);
// 			} catch (err) {
// 				console.log(err.message);
// 			} finally {
// 				if (userLogin?.operationType) redirect(301, '/test/Leads');
// 			}
// 		} else {
// 			return fail(301, { message: 'Unable to Login, please contact support' });
// 		}
// 	}
// };
