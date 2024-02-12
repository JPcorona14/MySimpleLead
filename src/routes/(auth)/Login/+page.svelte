<script>
	import { goto } from '$app/navigation';
	import { authHandlers, authStore } from 'src/routes/stores/authStore';

	/**@type {string | null} */
	let email = null;
	/**@type {string | null} */
	let password = null;

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
			} finally {
			}
		} else {
			return alert('Unable to Login, please contact support');
		}
	};
</script>

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
