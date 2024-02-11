import { authStore } from 'src/routes/stores/authStore';
import { auth } from './firebase.client';
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';

/**
 *
 * @param {string} orgid
 */
export const checkLogin = async (orgid) => {
	auth.onAuthStateChanged((user) => {
		if (user) {
			authStore.update((curr) => {
				return { ...curr, isLoading: false, userLoaded: true, currentUser: user.uid, orgid };
			});
			console.log('User Found');
		} else {
			console.log('No User Found');
			goto('/Login');
		}
	});
};
