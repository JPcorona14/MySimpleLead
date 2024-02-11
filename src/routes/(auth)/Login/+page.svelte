<script>
	import { goto } from '$app/navigation';
	import { checkLogin } from 'src/lib/CheckLogin';
	import { authHandlers, authStore } from 'src/routes/stores/authStore';
	import { onMount } from 'svelte';

	/**@type {string | null} */
	let email = null;
	/**@type {string | null} */
	let password = null;

	const userSignIn = async () => {
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
			} catch (err) {
				console.log(err.message);
			} finally {
			}
		} else {
			return alert('Unable to Login, please contact support');
		}
	};
</script>

<div class="flex justify-center h-screen">
	<section class="mt-auto mb-auto flex flex-col bg-main shadow-md shadow-gray-500 rounded-lg">
		<h1
			class="mt-10 mb-10 ml-auto mr-auto text-white text-4xl font-semibold text-wrap w-1/2 text-center"
		>
			My Simple Lead
		</h1>
		<form on:submit={userSignIn} class="flex flex-col ml-10 mr-10 text-center">
			<label for="email" class="text-white md:text-base text-2xl">Email</label>
			<input
				name="email"
				type="text"
				placeholder="Email"
				bind:value={email}
				class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
			/>
			<label for="password" class="text-white mt-4 md:text-base text-2xl">Password</label>
			<input
				name="password"
				type="password"
				bind:value={password}
				placeholder="Password"
				class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
			/>

			<button
				type="submit"
				class=" bg-green-500 text-white rounded-md mt-10 mb-5 w-3/4 ml-auto mr-auto md:h-6 h-8 md:text-base text-xl"
				>Login</button
			>
		</form>
		<a href="./Register" class=" text-white underline mb-10 text-center">Register</a>
	</section>
</div>
