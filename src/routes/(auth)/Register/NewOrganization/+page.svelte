<script>
</script>

<form method="POST" class="flex flex-col ml-10 mr-10 text-center">
	<label for="orgid" class="text-white md:text-base text-2xl">Organization ID</label>
	<input
		name="orgid"
		type="text"
		placeholder="ID"
		class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
	/>
	<label for="Email" class="text-white md:text-base text-2xl">Email</label>
	<input
		name="Email"
		type="email"
		placeholder="Email"
		class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
	/>
	<label for="first_name" class="text-white md:text-base text-2xl mt-4">First Name</label>
	<input
		name="first_name"
		type="text"
		placeholder="First Name"
		class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
	/>
	<label for="last_name" class="text-white md:text-base text-2xl mt-4">Last Name</label>
	<input
		name="last_name"
		type="text"
		placeholder="Last Name"
		class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
	/>
	<label for="password" class="text-white mt-4 md:text-base text-2xl">Password</label>
	<input
		name="password"
		type="password"
		placeholder="Password"
		class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
	/>
	<label for="cPassword" class="text-white mt-4 md:text-base text-2xl">Confirm Password</label>
	<input
		name="cPassword"
		type="password"
		placeholder="Confirm Password"
		class="pl-2 pr-2 rounded-md md:h-6 h-8 text-center"
	/>
	<button
		type="submit"
		class=" bg-green-500 text-white rounded-md mt-8 mb-5 w-3/4 ml-auto mr-auto md:h-6 h-8 md:text-base text-xl"
		>Register</button
	>
	<a href="/Register/ExistingOrganization" class="text-white mb-5"
		>Register in Existing Organization</a
	>
</form>
