<script>
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import GoThreeBars from 'svelte-icons/go/GoThreeBars.svelte';
	import { authHandlers } from '$stores/authStore';
	import { goto } from '$app/navigation';

	let menuActive = false;
	let isMobile = false;

	//Logged In
	const optionStyle = 'ml-auto mr-auto mb-3 md:text-xl text-3xl text-white no-underline pt-1 pb-1';
	const selected = 'bg-select w-full text-center shadow-md';
	let currentURL = '';

	onMount(() => {
		currentURL = window.location.href;
		isMobile = window.innerWidth <= 850 ? true : false;
	});

	const logOut = async () => {
		try {
			await authHandlers.logout();
		} catch (err) {
			console.log(err);
		}
		document.cookie = `orgid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		document.cookie = `uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		goto('/Login');
	};
	//Test
</script>

{#if isMobile}
	<section class="flex h-[full] flex-col">
		{#if menuActive}
			<div
				in:fly={{ x: -1000, duration: 500 }}
				out:fly={{ x: -1000, duration: 500 }}
				class="absolute flex h-screen w-full flex-col justify-start border border-none bg-main text-white shadow-md shadow-gray-500 md:ml-2 md:mt-2 md:w-44 md:rounded-lg"
			>
				<div class="flex w-full justify-end">
					<button
						on:click={() => (menuActive = false)}
						class=" mr-5 mt-5 h-12 w-12 rounded-full bg-bad/75 shadow-md shadow-gray-900">X</button
					>
				</div>
				<div class="flex flex-col">
					<h2 class="mb-5 ml-auto mr-auto mt-10 text-5xl font-bold">Menu</h2>

					<a
						href={`/Dashboard`}
						hidden
						class={`${optionStyle} ${currentURL.includes('/Dashboard') ? selected : ''} transform `}
						on:click={() => {
							menuActive = false;
							currentURL = '/Dashboard';
						}}>Dashboard</a
					>
					<a
						href={`/Leads`}
						class={`${optionStyle} ${currentURL.includes('/Leads') ? selected : ''} transition-transform`}
						on:click={() => {
							menuActive = false;
							currentURL = '/Leads';
						}}>Leads</a
					>
					<a
						href={`/Contacts`}
						hidden
						class={`${optionStyle} ${currentURL.includes('/Contacts') ? selected : ''} transition-transform`}
						on:click={() => {
							menuActive = false;
							currentURL = '/Contacts';
						}}>Contacts</a
					>
					<a
						href={`/Reports`}
						hidden
						class={`${optionStyle} ${currentURL.includes('/Reports') ? selected : ''}`}
						on:click={() => {
							menuActive = false;
							currentURL = '/Reports';
						}}>Reports</a
					>
				</div>
				<div class="mb-10 mt-auto flex flex-col text-center">
					<a
						href={`/Settings`}
						hidden
						class={`${optionStyle} ${currentURL.includes('/Settings') ? selected : ''} transform`}
						on:click={() => {
							menuActive = false;
							currentURL = '/Settings';
						}}>Settings</a
					>
					<a
						href={`/UserProfile`}
						hidden
						class={`${optionStyle} ${currentURL.includes('/UserProfile') ? selected : ''} transform`}
						on:click={() => {
							menuActive = false;
							currentURL = '/UserProfile';
						}}>User Profile</a
					>
					<button
						class={`${optionStyle} ${currentURL.includes('/Logout') ? selected : ''} transform`}
						on:click={() => {
							logOut();
							menuActive = false;
							currentURL = '/Login';
						}}>Logout</button
					>
				</div>
			</div>
		{:else}
			<div>
				<button
					on:click={() => (menuActive = true)}
					class="absolute left-8 top-10 flex h-16 w-16 justify-center rounded-full bg-main text-white shadow-md shadow-gray-500"
				>
					<div class="mb-auto mt-auto h-10 w-10">
						<GoThreeBars />
					</div>
				</button>
			</div>
			<div class="max-w-screen flex justify-center md:max-w-screen-lg">
				<slot />
			</div>
		{/if}
	</section>

	<!-- --------------------------- -->
	<!-- This is the desktop version -->
	<!-- --------------------------- -->
{:else}
	<section class="flex h-screen pb-5">
		<div
			class="flex w-44 min-w-24 flex-col justify-start border border-none bg-main text-white shadow-md shadow-gray-500 md:ml-2 md:mt-2 md:rounded-lg"
		>
			<div class="flex flex-col">
				<h2 class="mb-5 ml-auto mr-auto mt-10 text-2xl font-bold">Menu</h2>

				<a
					href={`/Dashboard`}
					hidden
					class={`${optionStyle} ${currentURL.includes('/Dashboard') ? selected : ''} transform`}
					on:click={() => {
						menuActive = false;
						currentURL = '/Dashboard';
					}}>Dashboard</a
				>
				<a
					href={`/Calls`}
					class={`${optionStyle} ${currentURL.includes('/Calls') ? selected : ''} transform`}
					on:click={() => {
						menuActive = false;
						currentURL = '/Calls';
					}}>Calls</a
				>
				<a
					href={`/Leads`}
					class={`${optionStyle} ${currentURL.includes('/Leads') ? selected : ''} transition-transform`}
					on:click={() => {
						menuActive = false;
						currentURL = '/Leads';
					}}>Leads</a
				>
				<a
					href={`/Contacts`}
					hidden
					class={`${optionStyle} ${currentURL.includes('/Contacts') ? selected : ''} transition-transform`}
					on:click={() => {
						menuActive = false;
						currentURL = '/Contacts';
					}}>Contacts</a
				>
				<a
					href={`/Reports`}
					hidden
					class={`${optionStyle} ${currentURL.includes('/Reports') ? selected : ''}`}
					on:click={() => {
						menuActive = false;
						currentURL = '/Reports';
					}}>Reports</a
				>
			</div>
			<div class="mb-10 mt-auto flex flex-col text-center">
				<a
					href={`/Settings`}
					hidden
					class={`${optionStyle} ${currentURL.includes('/Settings') ? selected : ''} transform`}
					on:click={() => {
						menuActive = false;
						currentURL = '/Settings';
					}}>Settings</a
				>
				<a
					href={`/UserProfile`}
					hidden
					class={`${optionStyle} ${currentURL.includes('/UserProfile') ? selected : ''} transform`}
					on:click={() => {
						menuActive = false;
						currentURL = '/UserProfile';
					}}>User Profile</a
				>
				<button
					class={`${optionStyle} ${currentURL.includes('/Logout') ? selected : ''} transform`}
					on:click={() => {
						logOut();
						menuActive = false;
						currentURL = '/Login';
					}}>Logout</button
				>
			</div>
		</div>

		<slot />
	</section>
{/if}
