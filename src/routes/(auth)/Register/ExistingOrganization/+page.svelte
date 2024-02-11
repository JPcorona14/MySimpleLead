<script>
	export let form;
</script>

{#if !form?.orgid}
	<form method="POST" action="?/searchOrg" class="flex flex-col ml-10 mr-10 text-center">
		<label for="orgid" class="text-white mt-4 md:text-base text-2xl">Organization ID</label>
		<input
			name="orgid"
			type="text"
			placeholder="-"
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
		/>
		<button
			type="submit"
			class=" bg-green-500 text-white rounded-md mt-8 mb-5 w-3/4 ml-auto mr-auto md:h-6 h-8 md:text-base text-xl"
			>Confirm Org</button
		>
	</form>
{:else if form?.orgid}
	<form method="POST" action="?/registerUser" class="flex flex-col ml-10 mr-10 text-center">
		<div class="hidden">
			<label for="orgid" class="text-white md:text-base text-2xl" />
			<input
				name="orgid"
				type="text"
				value={form?.orgid}
				class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center pointer-events-none bg-white/75 text-gray-500"
			/>
			<label for="orgName" class="text-white md:text-base text-2xl mt-4">Email</label>
		</div>
		<label for="orgName" class="text-white md:text-base text-2xl">Organization</label>
		<input
			name="orgName"
			type="text"
			value={form?.orgName}
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center pointer-events-none bg-white/75 text-gray-500"
		/>
		<label for="email" class="text-white md:text-base text-2xl mt-4">Email</label>
		<input
			name="email"
			type="email"
			placeholder="Email"
			value={form?.email ?? null}
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
		/>
		{#if form?.error?.email}
			<p class=" text-red-600">{form.error.email[0]}</p>
		{/if}
		<label for="first_name" class="text-white md:text-base text-2xl mt-4">First Name</label>
		<input
			name="first_name"
			type="text"
			placeholder="First Name"
			value={form?.first_name ?? null}
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
		/>
		{#if form?.error?.first_name}
			<p class=" text-red-600">{form.error.first_name[0]}</p>
		{/if}
		<label for="last_name" class="text-white md:text-base text-2xl mt-4">Last Name</label>
		<input
			name="last_name"
			type="text"
			autocomplete="family-name"
			placeholder="Last Name"
			value={form?.last_name ?? null}
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
		/>
		{#if form?.error?.last_name}
			<p class=" text-red-600">{form.error.last_name[0]}</p>
		{/if}
		<label for="password" class="text-white mt-4 md:text-base text-2xl">Password</label>
		<input
			name="password"
			autocomplete="off"
			type="password"
			placeholder="Password"
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
		/>
		{#if form?.error?.password}
			<p class=" text-red-600">{form.error.password[0]}</p>
		{/if}
		<label for="cPassword" class="text-white mt-4 md:text-base text-2xl">Confirm Password</label>
		<input
			name="cPassword"
			type="password"
			autocomplete="off"
			placeholder="Confirm Password"
			class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
		/>
		{#if form?.error?.cPassword}
			<p class=" text-red-600">{form.error.cPassword[0]}</p>
		{/if}
		<button
			type="submit"
			class=" bg-green-500 text-white rounded-md mt-8 mb-5 w-3/4 ml-auto mr-auto md:h-6 h-8 md:text-base text-xl"
			>Register</button
		>
		<a href="/Register/NewOrganization" class="text-white mb-5">Register with New Organization</a>
	</form>
{/if}
