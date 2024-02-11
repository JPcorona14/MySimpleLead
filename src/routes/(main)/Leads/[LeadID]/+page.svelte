<script>
	// @ts-ignore
	import { fly } from 'svelte/transition';
	import FaList from 'svelte-icons/fa/FaList.svelte';
	import FaLevelUpAlt from 'svelte-icons/fa/FaLevelUpAlt.svelte';
	import { onMount } from 'svelte';
	import { checkLogin } from 'src/lib/CheckLogin.js';
	import { authStore } from 'src/routes/stores/authStore.js';
	export let data;
	let contact = data.contact;
	let lead = data.lead;
	let activity = data.activity.sort((a, b) => b.id - a.id);
	let newActivity = false;
	let viewActivity = false;
	let isMobile = false;

	onMount(() => {
		isMobile = window.innerWidth <= 850 ? true : false;
		checkLogin($authStore.orgid);
	});

	const listStyle = 'mt-2 md:mb-2 mb-4 md:w-1/2 w-full flex md:flex-row flex-col justify-start';
	const labelStyle = 'md:w-2/5 font-bold md:text-xl text-2xl md:mb-0 mb-1';
	const inputStyle =
		'border rounded-lg pl-2 pr-2 pt-1 pb-1 md:w-1/2 w-full shadow-sm shadow-gray-300 text-end md:text-start';
	const filterBtnStyle =
		'bg-main text-white pl-2 pt-1 pb-1 pr-2 rounded-lg hover:bg-main/75 active:scale-95 shadow-md shadow-gray-500 md:w-fit w-3/4 md:ml-0 md:mr-0 ml-auto mr-auto';

	activity = activity.map((e) => {
		const date = new Date(e.created_at);
		const formattedDate = date.toLocaleDateString('en-US');
		let hour = date.getHours() % 12;
		hour = hour ? hour : 12;
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const ampm = date.getHours() < 12 ? 'AM' : 'PM';

		const updateTime = `${formattedDate} ${hour}:${minutes} ${ampm}`;

		return { ...e, created_at: updateTime };
	});

	/** @param {string} filt*/
	const filterActivity = (filt) => {
		activity = data.activity.sort((a, b) => b.id - a.id);
		activity = activity.map((e) => {
			const date = new Date(e.created_at);
			const formattedDate = date.toLocaleDateString('en-US');
			let hour = date.getHours() % 12;
			hour = hour ? hour : 12;
			const minutes = date.getMinutes().toString().padStart(2, '0');
			const ampm = date.getHours() < 12 ? 'AM' : 'PM';

			const updateTime = `${formattedDate} ${hour}:${minutes} ${ampm}`;

			return { ...e, created_at: updateTime };
		});

		if (filt !== 'X') {
			activity = activity.filter((a) => a.type === filt);
		}
	};

	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
		minimumFractionDigits: 0
	});

	/**
	 * @param {string} amount
	 */
	const updateQuote = async (amount) => {
		const quote = Number(amount.replace(/[^0-9.]+/g, ''));

		if (lead.quote !== quote) {
			try {
				fetch('/api/Leads/UpdateQuote', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: Number(data.id),
						quote
					})
				})
					.then((r) => r.json())
					.then((res) => {
						lead.quote = quote;
					});
			} catch (err) {
				// @ts-ignore
				console.log(err.text);
			}
		}
	};

	/**
	 *
	 * @param fieldName {string}
	 * @param value {any}
	 */
	const updateCustomerField = async (fieldName, fieldValue) => {
		const value = fieldValue === '' ? null : fieldValue;
		if (contact[fieldName] !== value) {
			try {
				fetch('/api/Leads/UpdateCustomerField', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: Number(contact.id),
						fieldName,
						value
					})
				})
					.then((r) => r.json())
					.then((res) => {
						console.log(res.message);
						contact[fieldName] = res.data[fieldName];
					});
			} catch (err /** @type {Error}*/) {
				if (err instanceof Error) {
					console.error(err.message);
					throw err; // Optionally rethrow the error
				} else {
					console.error('Unknown error:', err);
					throw new Error('An unknown error occurred');
				}
			}
		}
	};

	/**
	 *
	 * @param fieldName {string}
	 * @param value {any}
	 */
	const updateLeadField = async (fieldName, fieldValue) => {
		const value = fieldValue === '' ? null : fieldValue;
		if (lead[fieldName] !== value) {
			try {
				fetch('/api/Leads/UpdateLeadField', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: Number(data.id),
						fieldName,
						value
					})
				})
					.then((r) => r.json())
					.then((res) => {
						console.log(res.message);
						lead[fieldName] = value;
					});
			} catch (err /** @type {Error}*/) {
				if (err instanceof Error) {
					console.error(err.message);
					throw err; // Optionally rethrow the error
				} else {
					console.error('Unknown error:', err);
					throw new Error('An unknown error occurred');
				}
			}
		}
	};

	/**
	 *
	 * @param {event} event
	 */
	const editActivity = async (event) => {
		event?.preventDefault();
		const formData = new FormData(event?.target);
		const data = Object.fromEntries(formData.entries());
		const currentActivity = activity[data.i];

		if (currentActivity.text !== data.text || currentActivity.type !== data.type) {
			console.log(data);
			try {
				fetch('/api/Leads/Activity/UpdateActivity', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: data.activity_id,
						type: data.type,
						text: data.text
					})
				})
					.then((r) => r.json())
					.then((res) => {
						console.log(res);
						activity[data.i].type = res.activity[0].type;
						activity[data.i].text = res.activity[0].text;
					});
			} catch (err) {
				console.log(err);
			}
		} else {
			console.log('nothing to do');
		}

		activity[data.i].edit = false;
	};
</script>

<div class="flex h-full w-[95%] flex-col md:w-full md:flex-row md:pl-10">
	{#if !viewActivity}
		<section class="md:w-3/4">
			<section class="mb-10 mt-10 flex flex-col-reverse justify-between md:mt-10 md:flex-row">
				<a
					href="../Leads"
					class=" ml-10 hidden h-12 w-12 justify-center rounded-full bg-main text-3xl text-white no-underline shadow-md shadow-gray-500 hover:bg-main/75 active:scale-95 md:visible md:flex"
					><div class="mb-auto mt-auto">&lt;</div></a
				>
				<div class="mt-5 flex flex-col md:mt-0">
					<h1 class="text-center text-5xl font-bold">{contact.first_name} {contact.last_name}</h1>
					<h3 class="mt-5 text-wrap text-center text-2xl">{lead.charges}</h3>
					<button
						on:click={() => updateLeadField('archive', !lead.archive)}
						class={`${lead.archive ? 'bg-main' : 'bg-bad'} ml-auto mr-auto mt-10 h-10 w-48 rounded-lg text-xl font-bold text-white`}
						>{lead.archive ? 'Restore' : 'Archive'}</button
					>
				</div>
				<div class="mb-auto flex flex-col justify-start md:mr-10 md:w-12">
					<div class="mb-5 flex justify-end">
						<select
							class="ml-auto mr-auto w-1/2 rounded-lg border bg-main p-1 pl-5 pr-5 text-center text-2xl font-bold text-white md:w-fit"
							on:change={(e) => updateLeadField('status', e.target?.value)}
						>
							<option value="New Lead" selected={lead.status === 'New Lead' ? true : false}
								>New Lead</option
							>
							<option value="Contacted" selected={lead.status === 'Contacted' ? true : false}
								>Contacted</option
							>
							<option value="Quoted" selected={lead.status === 'Quoted' ? true : false}
								>Quoted</option
							>
							<option value="Won" selected={lead.status === 'Won' ? true : false}>Won</option>
							<option value="Lost" selected={lead.status === 'Lost' ? true : false}>Lost</option>
						</select>
					</div>
					<div class="flex justify-center md:justify-end md:pr-2">
						<input
							on:keydown={(e) => (e.keyCode == 13 ? e.target?.blur() : '')}
							on:blur={(e) => updateQuote(e.target?.value)}
							class="text-center text-2xl italic md:text-end"
							placeholder="-"
							value={lead.quote ? formatter.format(lead.quote) : ''}
						/>
					</div>
				</div>
				<div class="flex w-full justify-end md:hidden">
					<button
						on:click={() => (viewActivity = true)}
						class="mb-5 mr-4 h-16 w-16 rounded-full bg-main text-white shadow-md shadow-gray-500"
						><div class="ml-auto mr-auto h-8 w-8"><FaList /></div></button
					>
				</div>
			</section>
			<section class="flex">
				<div class="w-full">
					<section class="w-full">
						<div
							class="w-full rounded-lg bg-main pb-2 pt-2 text-center text-2xl font-bold text-white shadow-md shadow-gray-500"
						>
							Client Information
						</div>
						<form class="m-10 flex text-xl md:w-full md:justify-center">
							<ul
								class="flex w-full flex-col md:ml-auto md:mr-auto md:w-3/4 md:flex-row md:flex-wrap"
							>
								<li class={listStyle}>
									<label class={labelStyle} for="first_name">First Name:</label>
									<input
										name="first_name"
										type="text"
										value={contact.first_name}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('first_name', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="date_of_birth">Date of Birth:</label>
									<input
										name="date_of_birth"
										type="text"
										value={contact.date_of_birth}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('date_of_birth', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="last_name">Last Name:</label>
									<input
										name="last_name"
										type="text"
										value={contact.last_name}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('last_name', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="occupation">Occupation:</label>
									<input
										name="occupation"
										type="text"
										value={contact.occupation}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('occupation', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="email">Email:</label>
									<input
										name="email"
										type="text"
										value={contact.email}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('email', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="residence">Residence:</label>
									<input
										name="residence"
										type="text"
										value={contact.residence}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('residence', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="phone_1">Phone 1:</label>
									<input
										name="phone_1"
										type="text"
										value={contact.phone_1}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('phone_1', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="relationship">Relationship:</label>
									<select
										name="relationship"
										value={contact.relationship}
										class={inputStyle}
										on:change={(e) => updateCustomerField('relationship', e.target?.value)}
									>
										<option value={null} selected={contact.relationship === null ? true : false}
											>-</option
										>
										<option value={true} selected={contact.relationship ? true : false}
											>Married</option
										>
										<option value={false} selected={!contact.relationship ? true : false}
											>single</option
										>
									</select>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="phone_2">Phone 2:</label>
									<input
										name="phone_2"
										type="text"
										value={contact.phone_2}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('phone_2', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="prior_charges">Prior Charges:</label>
									<input
										name="prior_charges"
										type="text"
										value={contact.prior_charges}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateCustomerField('prior_charges', e.target?.value)}
									/>
								</li>
							</ul>
						</form>
					</section>
					<section>
						<div
							class="mt-20 w-full rounded-lg bg-main pb-2 pt-2 text-center text-2xl font-bold text-white shadow-md shadow-gray-500"
						>
							Case Details
						</div>
						<form class="m-10 flex justify-center text-xl md:w-full">
							<ul class="ml-auto mr-auto flex w-full flex-wrap md:w-3/4">
								<li class={listStyle}>
									<label class={labelStyle} for="court">Court:</label>
									<input
										name="court"
										type="text"
										value={lead.court}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('court', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="quote">Quote:</label>
									<input
										name="quote"
										type="text"
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateQuote(e.target?.value)}
										placeholder="-"
										value={lead.quote ? formatter.format(lead.quote) : ''}
										class={inputStyle}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="case_number">Case Number:</label>
									<input
										name="case_number"
										type="text"
										value={lead.case_number}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('case_number', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="finance_owner">Finance Owner:</label>
									<input
										name="finance_owner"
										type="text"
										value={lead.finance_owner}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('finance_owner', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="charges">Charges:</label>
									<textarea
										name="charges"
										value={lead.charges}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('charges', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="referral">Referral:</label>
									<input
										name="referral"
										type="text"
										value={lead.referral}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('referral', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="date_of_incident">Incident Date:</label>
									<input
										name="date_of_incident"
										type="text"
										value={lead.date_of_incident}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('date_of_incident', e.target?.value)}
									/>
								</li>
								<li class={listStyle}>
									<label class={labelStyle} for="reason_for_visit">Reason for Visit:</label>
									<input
										name="reason_for_visit"
										type="text"
										value={lead.reason_for_visit}
										class={inputStyle}
										on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
										on:blur={(e) => updateLeadField('reason_for_visit', e.target?.value)}
									/>
								</li>
							</ul>
						</form>
					</section>
				</div>
			</section>
		</section>
	{/if}

	<!-- Activity Section -->
	{#if isMobile && viewActivity}
		<section
			in:fly={{ x: 1000, duration: 500 }}
			out:fly={{ x: 1000, duration: 500 }}
			class=" absolute right-0 top-0 h-fit min-h-screen w-full bg-teal-100"
		>
			<div class="ml-5 mt-5 h-fit">
				<button
					on:click={() => (viewActivity = false)}
					class="h-8 w-14 rounded-full bg-main text-white"
				>
					<div class="h-6 rotate-[270deg]"><FaLevelUpAlt /></div>
				</button>
			</div>
			<div
				class=" ml-4 mr-4 mt-5 h-fit rounded-lg bg-main text-center text-xl font-bold text-white shadow-md shadow-gray-500 md:mt-10"
			>
				Activity
			</div>

			<!-- Filters Start -->
			<ul class="flex h-fit flex-col justify-center p-4 md:flex-row md:flex-wrap">
				<li class="m-1 flex justify-center">
					<button on:click={() => filterActivity('Note')} class={filterBtnStyle}>Notes</button>
				</li>
				<li class="m-1 flex justify-center">
					<button on:click={() => filterActivity('Call')} class={filterBtnStyle}>Calls</button>
				</li>
				<li class="m-1 flex justify-center">
					<button on:click={() => filterActivity('Email')} class={filterBtnStyle}>Emails</button>
				</li>
				<!-- <li class="m-1 flex justify-center">
					<button
						on:click={() => filterActivity('Document')}
						class={filterBtnStyle}
						>Documents</button
					>
				</li> -->
				<li class="m-1 flex justify-center">
					<button
						on:click={() => filterActivity('X')}
						class="mb-2 mt-4 w-3/4 rounded-lg bg-bad pb-1 pl-2 pr-2 pt-1 text-white shadow-md shadow-gray-500 hover:bg-bad/75 active:scale-95 md:mb-0 md:mt-0 md:w-fit"
						>X</button
					>
				</li>
			</ul>

			<!-- Add New Activity Button -->
			<button on:click={() => (newActivity = !newActivity)} class="mb-4 h-fit w-full rounded-lg">
				<div
					class=" {newActivity
						? 'bg-bad hover:bg-bad/75'
						: 'bg-main hover:bg-main/75'} ml-10 mr-10 rounded-lg pb-1 pt-1 text-white shadow-md shadow-gray-500 active:scale-95"
				>
					{newActivity ? 'Cancel' : '+ Activity'}
				</div>
			</button>
			<ul class="h-full w-full">
				{#if newActivity}
					<form method="POST" action="?/newActivity">
						<li class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500">
							<div class="flex justify-between">
								<label for="lead_id" hidden />
								<input name="lead_id" value={data.id} hidden />
								<label for="type" hidden />
								<select name="type">
									<option value="Call" class="font-bold">Call</option>
									<option value="Document" class="font-bold">Document</option>
									<option value="Email" class="font-bold">Email</option>
									<option value="Note" selected class="font-bold">Notes</option>
								</select>
								<button
									id="submitNote"
									class="mb-2 w-1/3 rounded-lg bg-good pb-1 pt-1 font-bold text-white hover:bg-good/75 active:scale-95"
									>Save</button
								>
							</div>
							<lable for="text" hidden />
							<textarea
								name="text"
								placeholder="Type here..."
								on:keypress={(e) => {
									if (e.keyCode === 13 && !e.shiftKey) {
										e.target.blur();
										const submitNote = document.getElementById('submitNote');
										submitNote.click();
									}
								}}
								class="min-h-14 w-full"
							/>
						</li>
					</form>
				{/if}

				<!-- List Past Activity -->
				<div class="h-full">
					{#each activity as a}
						<li class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500">
							<div class="flex justify-between">
								<div class="font-bold">{a.type}:</div>
								<div>{a.created_at}</div>
							</div>
							<p class=" whitespace-pre-line">{a.text}</p>
						</li>
					{/each}
				</div>
			</ul>
		</section>
	{:else if !isMobile && !viewActivity}
		<div
			in:fly={{ x: 1000, duration: 500 }}
			out:fly={{ x: 1000, duration: 500 }}
			class={`h-full md:visible md:relative md:flex md:w-1/4 md:p-4`}
		>
			<section
				class="no-scrollbar h-full w-full overflow-scroll rounded-lg border bg-gray-100 shadow-md shadow-gray-500"
			>
				<div class="ml-5 mt-5 md:hidden">
					<button
						on:click={() => (viewActivity = false)}
						class="h-8 w-14 rounded-full bg-main text-white"
					>
						<div class="h-6 rotate-[270deg]"><FaLevelUpAlt /></div>
					</button>
				</div>
				<div
					class=" ml-4 mr-4 mt-5 rounded-lg bg-main text-center text-xl font-bold text-white shadow-md shadow-gray-500 md:mt-10"
				>
					Activity
				</div>

				<!-- Filters Start -->
				<ul class="flex flex-col justify-center p-4 md:flex-row md:flex-wrap">
					<li class="m-1 flex justify-center">
						<button on:click={() => filterActivity('Note')} class={filterBtnStyle}>Notes</button>
					</li>
					<li class="m-1 flex justify-center">
						<button on:click={() => filterActivity('Call')} class={filterBtnStyle}>Calls</button>
					</li>
					<li class="m-1 flex justify-center">
						<button on:click={() => filterActivity('Email')} class={filterBtnStyle}>Emails</button>
					</li>
					<!-- <li class="m-1 flex justify-center">
					<button
						on:click={() => filterActivity('Document')}
						class={filterBtnStyle}
						>Documents</button
					>
				</li> -->
					<li class="m-1 flex justify-center">
						<button
							on:click={() => filterActivity('X')}
							class="mb-2 mt-4 w-3/4 rounded-lg bg-bad pb-1 pl-2 pr-2 pt-1 text-white shadow-md shadow-gray-500 hover:bg-bad/75 active:scale-95 md:mb-0 md:mt-0 md:w-fit"
							>X</button
						>
					</li>
				</ul>

				<!-- Add New Activity Button -->
				<button on:click={() => (newActivity = !newActivity)} class="mb-4 w-full rounded-lg">
					<div
						class=" {newActivity
							? 'bg-bad hover:bg-bad/75'
							: 'bg-main hover:bg-main/75'} ml-10 mr-10 rounded-lg pb-1 pt-1 text-white shadow-md shadow-gray-500 active:scale-95"
					>
						{newActivity ? 'Cancel' : '+ Activity'}
					</div>
				</button>
				<ul class="w-full">
					{#if newActivity}
						<form method="POST" action="?/newActivity">
							<li class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500">
								<div class="flex justify-between">
									<label for="lead_id" hidden />
									<input name="lead_id" value={data.id} hidden />
									<label for="type" hidden />
									<select name="type">
										<option value="Call" class="font-bold">Call</option>
										<option value="Document" class="font-bold">Document</option>
										<option value="Email" class="font-bold">Email</option>
										<option value="Note" selected class="font-bold">Notes</option>
									</select>
									<button
										id="submitNote"
										class="mb-2 w-1/3 rounded-lg bg-good pb-1 pt-1 font-bold text-white hover:bg-good/75 active:scale-95"
										>Save</button
									>
								</div>
								<lable for="text" hidden />
								<textarea
									name="text"
									placeholder="Type here..."
									on:keypress={(e) => {
										if (e.keyCode === 13 && !e.shiftKey) {
											e.target.blur();
											const submitNote = document.getElementById('submitNote');
											submitNote.click();
										}
									}}
									class="min-h-14 w-full"
								/>
							</li>
						</form>
					{/if}

					<!-- List Past Activity -->
					{#each activity as a, index}
						<li
							on:mouseenter={() => (a.type !== 'Event' ? (a.active = true) : '')}
							on:mouseleave={() => (a.type !== 'Event' ? (a.active = false) : '')}
							id={a.id}
							class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500"
						>
							{#if !a.edit}
								<div class="flex justify-between">
									<div class="font-bold">{a.type}:</div>
									<div>{a.created_at}</div>
								</div>

								<p class=" whitespace-pre-line">{a.text}</p>
							{:else}
								<form on:submit|preventDefault={editActivity} class="flex flex-col justify-center">
									<label for="i" hidden />
									<input name="i" value={index} hidden />
									<label for="activity_id" hidden />
									<input name="activity_id" value={a.id} hidden />
									<div class="w-full text-center font-bold">{a.created_at}</div>
									<label for="type" hidden />
									<select name="type" class="ml-auto mr-auto">
										<option
											value="Call"
											selected={a.type === 'Call' ? true : false}
											class="font-bold">Call</option
										>
										<option
											value="Document"
											selected={a.type === 'Document' ? true : false}
											class="font-bold">Document</option
										>
										<option
											value="Email"
											selected={a.type === 'Email' ? true : false}
											class="font-bold">Email</option
										>
										<option
											value="Note"
											selected={a.type === 'Note' ? true : false}
											class="font-bold">Notes</option
										>
									</select>

									<textarea
										name="text"
										placeholder="Type here..."
										class="min-h-24 w-full rounded-md border p-1"
										value={a.text}
									/>
									<button
										type="submit"
										class="mb-2 mt-2 w-full rounded-md bg-good pb-1 pt-1 text-white shadow-md shadow-gray-500 active:scale-95"
										>Save</button
									>
								</form>
							{/if}
							{#if a.active || a.edit}
								<div class="mb-1 mt-2 flex justify-around">
									<form method="POST" action="?/editActivity" class="w-2/5">
										<label for="id" hidden />
										<input name="id" value={a.id} hidden />
										{#if a.edit}
											<button
												type="button"
												on:click={() => {
													a.edit = false;
													a.type = a.type;
													a.text = a.text;
												}}
												class="h-full w-full rounded-md bg-orange-500 pb-1 pt-1 text-white shadow-md shadow-gray-500"
												>Cancel</button
											>
										{:else}
											<button
												type="button"
												on:click={() => (a.edit = true)}
												class="h-full w-full rounded-md bg-good pb-1 pt-1 text-white shadow-md shadow-gray-500"
												>Edit</button
											>
										{/if}
									</form>
									<form method="POST" action="?/deleteActivity" class="w-2/5">
										<label for="id" hidden />
										<input name="id" value={a.id} hidden />
										<button
											class="h-full w-full rounded-md bg-bad pb-1 pt-1 text-white shadow-md shadow-gray-500"
											>Delete</button
										>
									</form>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		</div>
	{/if}
</div>

<style>
	.overflow-y-hidden {
		overflow-y: hidden !important;
	}
</style>
