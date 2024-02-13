<script>
	import { goto } from '$app/navigation';
	import { authHandlers, authStore } from 'src/routes/stores/authStore';
	import toast, { Toaster } from 'svelte-french-toast';

	/**@type {string | null} */
	let email = null;
	/**@type {string | null} */
	let password = null;

	function getAuthErrorMessage(code) {
		switch (code) {
			case 'auth/email-already-in-use':
				return 'This email address is already in use by another account.';
			case 'auth/wrong-password':
				return 'Incorrect password. Please try again or use the "Forgot password?" option to reset it.';
			case 'auth/user-not-found':
				return 'No user found with this email address. Please check the email provided or sign up.';
			case 'auth/user-disabled':
				return 'This user account has been disabled. Please contact support for help.';
			case 'auth/too-many-requests':
				return 'We have detected too many requests from your device. Please take a break and try again later.';
			case 'auth/network-request-failed':
				return 'Network error. Please check your internet connection and try again.';
			case 'auth/invalid-email':
				return 'The email address is badly formatted. Please enter a valid email address.';
			case 'auth/operation-not-allowed':
				return 'Signing in with Email and Password is not enabled. Please contact support or try another sign-in method.';
			case 'auth/account-exists-with-different-credential':
				return 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
			case 'auth/auth-domain-config-required':
				return 'Authentication domain configuration is required. Please check your Firebase setup.';
			case 'auth/credential-already-in-use':
				return 'This credential is already associated with a different user account.';
			case 'auth/invalid-credential':
				return 'The provided credential is invalid. Please try again with a valid credential.';

			default:
				return 'An error occurred. Please try again.';
		}
	}

	const userSignIn = async () => {
		console.log('Login Function');
		if (!email || !password) {
			alert('Need Email and Password');
		} else if (email || password) {
			try {
				await authHandlers.login(email, password).then((r) => {
					fetch(`/api/User/PullUser`, {
						method: 'POST',
						headers: {
							'content-type': 'application/json'
						},
						body: JSON.stringify({
							uid: r.user.uid
						})
					})
						.then((a) => a.json())
						.then((res) => {
							//Need to set cookies here instead
							document.cookie =
								'test=helloWorld; path=/; max-age=' + 60 * 60 * 24 * 7 + '; SameSite=Lax';
							const date = new Date();
							date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
							document.cookie = `uid=${r.user.uid}; path=/; expires=${date}; SameSite=Lax`;
							document.cookie = `orgid=${res.orgid}; path=/; expires=${date}; SameSite=Lax`;

							// End of Setting cookies
							authStore.update((curr) => {
								return {
									...curr,
									isLoading: false,
									userLoaded: true,
									orgid: res.orgid,
									currentUser: res.uid
								};
							});
						})
						.finally(() => {
							if ($authStore.userLoaded) {
								goto(`/Leads`);
							}
						});
				});
				console.log('Finished logging in');
			} catch (err) {
				console.log(err);
				toast.error(getAuthErrorMessage(err.code));
			} finally {
			}
		} else {
			return alert('Unable to Login, please contact support');
		}
	};
</script>

<Toaster />
<div class="flex h-screen justify-center">
	<section class="mb-auto mt-auto flex flex-col rounded-lg bg-main shadow-md shadow-gray-500">
		<h1
			class="mb-10 ml-auto mr-auto mt-10 w-1/2 text-wrap text-center text-4xl font-semibold text-white"
		>
			My Simple Lead
		</h1>
		<form on:submit={userSignIn} class="ml-10 mr-10 flex flex-col text-center">
			<label for="email" class="text-2xl text-white md:text-base">Email</label>
			<input
				name="email"
				type="text"
				placeholder="Email"
				bind:value={email}
				class="h-8 rounded-md pl-2 pr-2 text-center md:h-6"
			/>
			<label for="password" class="mt-4 text-2xl text-white md:text-base">Password</label>
			<input
				name="password"
				type="password"
				bind:value={password}
				placeholder="Password"
				class="h-8 rounded-md pl-2 pr-2 text-center md:h-6"
			/>

			<button
				type="submit"
				class=" mb-5 ml-auto mr-auto mt-10 h-8 w-3/4 rounded-md bg-green-500 text-xl text-white md:h-6 md:text-base"
				>Login</button
			>
		</form>
		<a href="./Register" class=" mb-10 text-center text-white underline">Register</a>
	</section>
</div>
