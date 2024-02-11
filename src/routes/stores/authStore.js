import { writable } from 'svelte/store';
import { auth } from 'src/lib/firebase.client';
import {
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
	updateEmail,
	updatePassword
} from 'firebase/auth';

export const authStore = writable({
	isLoading: true,
	userLoaded: false,
	orgid: '',
	currentUser: ''
});

export const authHandlers = {
	/**
	 *
	 * @param {string} email
	 * @param {string} password
	 * @returns
	 */
	login: async (email, password) => {
		const login = await signInWithEmailAndPassword(auth, email, password);
		return login;
	},
	/**
	 *
	 * @param {string} email
	 * @param {string} password
	 * @returns
	 */
	signup: async (email, password) => {
		return await createUserWithEmailAndPassword(auth, email, password);
	},
	logout: async () => {
		return await signOut(auth);
	},
	/**
	 *
	 * @param {string} email
	 * @returns
	 */
	resetPassword: async (email) => {
		return await sendPasswordResetEmail;
	},
	/**
	 *
	 * @param {string} email
	 * @returns
	 */
	updateEmail: async (email) => {
		return await updateEmail(auth, email);
	},
	/**
	 *
	 * @param {string} password
	 * @returns
	 */
	updatePassword: async (password) => {
		return await updatePassword(auth, password);
	}
};
