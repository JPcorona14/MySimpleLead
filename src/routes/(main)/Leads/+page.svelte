<script>
	import { fly } from 'svelte/transition';
	import LeadCard from './LeadCard.svelte';
	import FaUserPlus from 'svelte-icons/fa/FaUserPlus.svelte';
	export let data;
	let customerList = data.customerList
		.sort((a, b) => (a.Name.toUpperCase() < b.Name.toUpperCase() ? -1 : 1))
		.slice(0, 5);
	let leadList = data.leadList;
	let displayList = leadList;
	let toggleArchive = false;
	let toggleSearchExistingCustomer = false;
	let customerLoaded = false;
	let customerDetails = {
		id: 0,
		orgid: null,
		first_name: null,
		last_name: null,
		date_of_birth: null,
		email: null,
		phone_1: null,
		phone_2: null,
		relationship: null,
		residence: null,
		occupation: null,
		prior_charges: null
	};

	//Live should have newLead = false, newCustomer = true
	let newLead = false;
	let newCustomer = true;
	/** @type {number}*/
	let pickedID;

	//Styles for New Leads
	const nlULStyle = 'w-4/5 flex flex-col ml-auto mr-auto';
	const nlLIStyle = 'flex justify-between mt-2 h-10';
	const nlLabelStyle = 'text-white mt-auto mb-auto';
	const nlInputStyle = 'rounded-lg h-6 mt-auto mb-auto pl-2 pr-2';
	const nlInputCustomerLoaded =
		'rounded-lg h-6 mt-auto mb-auto pl-2 pr-2 bg-white/75 text-gray-500 pointer-events-none';

	/**
	 * @interface MyLead
	 * @property {number} id
	 * @property {string} Name
	 * @property {string} Quote
	 * @property {string} Charge
	 * @property {string} Status
	 */
	let leadItem = { id: 0, Name: '', Quote: '', Charge: '', Status: '' };

	//Leads
	const containerStyle =
		' bg-secondary md:h-[98%] rounded-lg md:w-1/5 w-[95%] md:ml-0 md:mr-0 ml-auto mr-auto flex flex-col justify-start pt-10 pb-10 shadow-gray-500 shadow-md text-xl font-semibold md:mb-0 mb-5';
	const containerTitleStyle = 'text-center md:text-2xl text-3xl';

	const showArchived = () => {
		if (!toggleArchive) {
			displayList = leadList.filter((e) => e.Archive === false);
		} else {
			displayList = leadList;
		}
	};

	/**
	 *
	 * @param {string} d
	 * @returns {string}
	 */
	function dateFormat(d) {
		const date = new Date(d);

		const formattedDate = date.toLocaleDateString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});

		return formattedDate;
	}

	/**
	 *
	 * @param {DragEvent} e
	 */
	const todoDragging = (e) => {
		const id = Number(e.target?.getAttribute('id'));
		pickedID = id;
		const lead = leadList.find((lead) => lead.id === id);
		if (lead) {
			leadItem = lead;
		}
	};

	/**
	 *
	 * @param {DragEvent} e
	 * @param {string} status
	 */
	const assignedDrop = (e, status) => {
		try {
			fetch('/api/Leads/UpdateLeadField', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id: pickedID,
					fieldName: 'status',
					value: status
				})
			});
		} catch (err /**@type {Error}*/) {
			console.log(err);
		}

		leadList = leadList.map((a) => {
			if (a.id === leadItem.id) {
				a.Status = status;
			}
			return a;
		});

		showArchived();
	};

	/**
	 *
	 * @param {DragEvent} e
	 */
	const dragOver = (e) => {
		e.preventDefault();
	};

	/**
	 * @param e {Event}
	 */
	const updateCustomerList = (e) => {
		const search = e.target.value;

		customerList = data.customerList.filter((a) =>
			a.Name.toLowerCase().includes(e.target.value.toLowerCase())
		);

		customerList = customerList
			.sort((a, b) => (a.Name.toUpperCase() < b.Name.toUpperCase() ? -1 : 1))
			.slice(0, 5);

		if (customerList[0].Name === search) {
			toggleSearchExistingCustomer = true;
		} else {
			toggleSearchExistingCustomer = false;
		}
	};

	/**@param e {Event}*/
	const pullExistingCustomer = () => {
		const id = customerList[0].id;

		try {
			fetch('/api/Leads/PullCustomer', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id
				})
			})
				.then((r) => r.json())
				.then((res) => {
					const customerData = res.customer.map((e) => {
						return { ...e, date_of_birth: dateFormat(e.date_of_birth) };
					});
					customerDetails = customerData[0];

					customerLoaded = true;
				});
		} catch (err /**@type {Error}*/) {
			console.log(err);
		}
	};

	const resetCustomer = () => {
		customerDetails = {
			id: 0,
			first_name: null,
			last_name: null,
			date_of_birth: null,
			email: null,
			phone_1: null,
			phone_2: null,
			relationship: null,
			residence: null,
			occupation: null,
			prior_charges: null
		};

		customerLoaded = false;
	};

	showArchived();
</script>

<div
	class={`ml-auto mr-auto flex h-full w-[90%] flex-col justify-center md:ml-0 md:mr-0 md:w-full `}
>
	<section class="flex flex-col-reverse justify-between md:flex-row">
		<div class="mb-5 flex justify-center md:mb-10 md:w-1/3 md:justify-start">
			<div class="ml-2 mt-auto flex justify-center text-center text-2xl md:ml-14 md:text-base">
				<input
					name="archive"
					type="checkbox"
					class="mb-auto mt-auto h-10 w-5"
					on:click={() => {
						toggleArchive = !toggleArchive;
						showArchived();
					}}
				/>
				<label for="archive" class="mb-auto ml-2 mt-auto">Show Archive</label>
			</div>
		</div>
		<h1 class="mb-5 ml-auto mr-auto mt-5 text-center text-6xl font-semibold md:mt-24 md:w-1/3">
			Leads
		</h1>
		<div class="flex w-full pr-2 md:w-1/3 md:justify-end md:pr-16">
			<button
				on:click={() => (newLead = true)}
				class="ml-auto mt-10 flex h-16 w-16 justify-center rounded-full bg-main text-white shadow-md shadow-gray-500 md:mb-auto md:mt-auto"
			>
				<div class="mb-auto mt-auto h-8 w-8 pl-1 pt-1">
					<FaUserPlus />
				</div>
			</button>
		</div>
	</section>
	<section
		class="ml-auto mr-auto flex h-full w-full flex-col justify-start md:flex-row md:justify-evenly"
	>
		<!-- New Leads -->
		<ul class={containerStyle} on:drop={(e) => assignedDrop(e, 'New Lead')} on:dragover={dragOver}>
			<h4 class={containerTitleStyle}>New Leads</h4>
			<div class="flex h-full flex-col">
				{#each displayList as lead (lead.id)}
					{#if lead.Status === 'New Lead'}
						<LeadCard
							fName={lead.Name}
							quote={lead.Quote}
							charges={lead.Charge}
							leadID={`${lead.id}`}
							{todoDragging}
						/>
					{/if}
				{/each}
			</div>
		</ul>

		<!-- Contacted -->
		<ul
			class={`${containerStyle}`}
			on:drop={(e) => assignedDrop(e, 'Contacted')}
			on:dragover={dragOver}
		>
			<h4 class={containerTitleStyle}>Contacted</h4>
			<div class="flex h-full flex-col">
				{#each displayList as lead (lead.id)}
					{#if lead.Status === 'Contacted'}
						<LeadCard
							fName={lead.Name}
							quote={lead.Quote}
							charges={lead.Charge}
							leadID={`${lead.id}`}
							{todoDragging}
						/>
					{/if}
				{/each}
			</div>
		</ul>
		<!-- Quoted -->
		<ul
			class={`${containerStyle}`}
			on:drop={(e) => assignedDrop(e, 'Quoted')}
			on:dragover={dragOver}
		>
			<h4 class={containerTitleStyle}>Quoted</h4>
			<div class="flex h-full flex-col">
				{#each displayList as lead}
					{#if lead.Status === 'Quoted'}
						<LeadCard
							fName={lead.Name}
							quote={lead.Quote}
							charges={lead.Charge}
							leadID={`${lead.id}`}
							{todoDragging}
						/>
					{/if}
				{/each}
			</div>
		</ul>

		<!-- -------- -->
		<!-- Won/Lost -->
		<!-- -------- -->
		<container
			class="ml-auto mr-auto flex w-[95%] flex-col justify-between md:ml-0 md:mr-0 md:h-[98%] md:w-1/5"
		>
			<!-- --- -->
			<!-- Won -->
			<!-- --- -->
			<ul
				class="mb-5 flex h-96 flex-col justify-center overflow-hidden rounded-lg bg-main pt-10 text-xl font-semibold shadow-md shadow-gray-500 md:mb-0 md:h-[49%]"
				on:drop={(e) => assignedDrop(e, 'Won')}
				on:dragover={dragOver}
			>
				<h4 class="text-center text-3xl text-white md:text-2xl">Won</h4>
				<div class="no-scrollbar flex h-full flex-col overflow-y-scroll pb-10">
					{#each displayList as lead}
						{#if lead.Status === 'Won'}
							<LeadCard
								fName={lead.Name}
								quote={lead.Quote}
								charges={lead.Charge}
								leadID={`${lead.id}`}
								{todoDragging}
							/>
						{/if}
					{/each}
				</div>
			</ul>
			<!-- Lost -->
			<ul
				class="mb-5 flex flex-col justify-center overflow-hidden rounded-lg bg-bad pt-10 text-xl font-semibold shadow-md shadow-gray-500 md:mb-0 md:h-[49%]"
				on:drop={(e) => assignedDrop(e, 'Lost')}
				on:dragover={dragOver}
			>
				<h4 class="text-center text-3xl text-white md:text-2xl">Lost</h4>
				<div class="no-scrollbar flex h-full flex-col overflow-y-scroll pb-10">
					{#each displayList as lead}
						{#if lead.Status === 'Lost'}
							<LeadCard
								fName={lead.Name}
								quote={lead.Quote}
								charges={lead.Charge}
								leadID={`${lead.id}`}
								{todoDragging}
							/>
						{/if}
					{/each}
				</div>
			</ul>
		</container>
	</section>

	<!-- ------------------- -->
	<!-- Creating a New Lead -->
	<!-- ------------------- -->
	{#if newLead}
		<section
			in:fly={{ x: 1000, duration: 500 }}
			out:fly={{ x: 1000, duration: 500 }}
			class="no-scrollbar absolute right-0 top-0 h-full w-screen overflow-scroll bg-main md:w-96"
		>
			<div class="ml-4 mr-4 mt-10 flex justify-between">
				<div class="h-10 w-10"></div>
				<div class="text-center text-3xl font-bold text-white">New Lead</div>
				<button
					on:click={() => (newLead = false)}
					class="h-10 w-10 rounded-full bg-bad text-white hover:bg-bad/75 active:scale-95"
					><div>X</div></button
				>
			</div>
			<section class="flex flex-col justify-center">
				<div class="mb-5 ml-auto mr-auto mt-5 flex w-3/4 justify-center">
					<select
						on:change={(e) =>
							e.target.value === 'Existing' ? (newCustomer = false) : (newCustomer = true)}
						class="w-full rounded-lg pb-1 pt-1 text-center"
					>
						<option selected value="New">New Customer</option>
						<option value="Existing">Existing Customer</option>
					</select>
				</div>
				{#if !newCustomer}
					<div class="ml-auto mr-auto flex w-3/4 justify-center">
						<div class="flex rounded-lg bg-white">
							<input
								id="existingCust"
								type="text"
								list="customerNames"
								class="rounded-lg bg-white pb-1 pl-4 pt-1 text-start text-black"
								on:input={updateCustomerList}
							/>
							<datalist id="customerNames">
								{#each customerList as customer}
									<option id={customer.id}>{customer.Name}</option>
								{/each}
							</datalist>
							{#if !customerLoaded}
								<button
									on:click={pullExistingCustomer}
									class=" w-24 rounded-lg text-white {toggleSearchExistingCustomer
										? 'bg-good'
										: 'pointer-events-none bg-good/50'}">Select</button
								>
							{:else}
								<button
									type="button"
									on:click={resetCustomer}
									class="w-24 rounded-lg bg-bad text-white hover:bg-bad/75 active:scale-95"
									>Reset</button
								>
							{/if}
						</div>
					</div>
				{/if}
			</section>

			<form method="POST" action="?/NewLead" class="flex w-full flex-col justify-center">
				<section class="mt-10 text-center text-2xl font-bold text-white">
					Customer Information
				</section>
				<ul class={nlULStyle}>
					<li class="hidden">
						<label for="existingCustomer" />
						<input name="existingCustomer" value={customerLoaded} />
					</li>
					<li class="hidden">
						<label for="customerID" />
						<input name="customerID" value={customerDetails.id} />
					</li>
					<li class="hidden">
						<label for="orgID" />
						<input name="orgID" value={customerDetails.orgid} />
					</li>
					<li class={nlLIStyle}>
						<label for="first_name" class={nlLabelStyle}>First Name:</label>
						<input
							name="first_name"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.first_name ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="last_name" class={nlLabelStyle}>Last Name:</label>
						<input
							name="last_name"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.last_name ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="date_of_birth" class={nlLabelStyle}>DOB:</label>
						<input
							name="date_of_birth"
							type="date"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.date_of_birth ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="email" class={nlLabelStyle}>Email:</label>
						<input
							name="email"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.email ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="phone_1" class={nlLabelStyle}>Phone 1:</label>
						<input
							name="phone_1"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.phone_1 ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="phone_2" class={nlLabelStyle}>Phone 2:</label>
						<input
							name="phone_2"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.phone_2 ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="relationship" class={nlLabelStyle}>Relationship Status:</label>
						<select
							name="relationship"
							class={`${customerLoaded ? nlInputCustomerLoaded : nlInputStyle} text-center`}
						>
							<option value="null" selected={customerDetails.relationship === null ? true : false}
								>-</option
							>
							<option value="true" selected={customerDetails.relationship ? true : false}
								>Married</option
							>
							<option value="false" selected={!customerDetails.relationship ? true : false}
								>Single</option
							>
						</select>
					</li>
					<li class={nlLIStyle}>
						<label for="residence" class={nlLabelStyle}>Residence:</label>
						<input
							name="residence"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.residence ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="occupation" class={nlLabelStyle}>Occupation:</label>
						<input
							name="occupation"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.occupation ?? ''}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="prior_charges" class={nlLabelStyle}>Prior Charges:</label>
						<input
							name="prior_charges"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.prior_charges ?? ''}
						/>
					</li>
				</ul>

				<div class="mb-5 ml-auto mr-auto mt-5 h-1 w-3/4 rounded-lg bg-secondary"></div>
				<section class="text-center text-2xl font-bold text-white">Case Details</section>
				<ul class={nlULStyle}>
					<li class={nlLIStyle}>
						<label for="court" class={nlLabelStyle}>Court:</label>
						<input name="court" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="case_number" class={nlLabelStyle}>Case Number:</label>
						<input name="case_number" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="charges" class={nlLabelStyle}>Charges:</label>
						<input name="charges" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="date_of_incident" class={nlLabelStyle}>Date of Incident:</label>
						<input name="date_of_incident" type="date" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="finance_owner" class={nlLabelStyle}>Finance Owner:</label>
						<input name="finance_owner" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="referral" class={nlLabelStyle}>Referral:</label>
						<input name="referral" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="reason_for_visit" class={nlLabelStyle}>Reason for Visit:</label>
						<input name="reason_for_visit" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="quote" class={nlLabelStyle}>Quote:</label>
						<input name="quote" type="text" class={nlInputStyle} />
					</li>
					<li class={nlLIStyle}>
						<label for="status" class={nlLabelStyle}>Lead Status:</label>
						<select name="status" class={nlInputStyle}>
							<option value="New Lead" selected>New Lead</option>
							<option value="Contacted">Contacted</option>
							<option value="Quoted">Quoted</option>
							<option value="Won">Won</option>
							<option value="Lost">Lost</option>
						</select>
					</li>
				</ul>
				<div class="mb-16 mt-16 flex justify-center">
					<button class="h-8 w-3/4 rounded-lg bg-good text-white hover:bg-good/75 active:scale-95"
						>Submit</button
					>
				</div>
			</form>
		</section>
	{/if}
</div>

<style>
	.overflow-y-hidden {
		overflow-y: hidden !important;
	}
</style>
