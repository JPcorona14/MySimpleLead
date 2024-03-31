<script lang="ts">
	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import type { DateRange } from 'bits-ui';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		type DateValue
	} from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import * as Popover from '$lib/components/ui/popover';

	import { fly } from 'svelte/transition';
	import LeadCard from './LeadCard.svelte';
	import FaUserPlus from 'svelte-icons/fa/FaUserPlus.svelte';
	import { onMount } from 'svelte';
	import toast, { Toaster } from 'svelte-french-toast';

	export let data;
	export let form;

	let customerList = data.customerList
		.sort((a, b) => (a.Name.toUpperCase() < b.Name.toUpperCase() ? -1 : 1))
		.slice(0, 5);
	let leadList = data.leadList;
	let displayList = leadList;
	let toggleArchive = false;
	let toggleSearchExistingCustomer = false;

	let customerLoaded: boolean = false;
	let newLeadsValue: number | string = 0;
	let contactedValue: number | string = 0;
	let quotedValue: number | string = 0;
	let wonValue: number | string = 0;
	let lostValue: number | string = 0;
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
	let leadDetails = {
		court: null,
		case_number: null,
		charges: null,
		date_of_incident: null,
		finance_owner: null,
		referral: null,
		reason_for_visit: null,
		quote: null,
		status: null
	};

	interface FailedFields {
		first_name: string | null;
		last_name: string | null;
		phone_1: string | null;
		phone_2: string | null;
	}
	let failedField: FailedFields = {
		first_name: null,
		last_name: null,
		phone_1: null,
		phone_2: null
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

	interface MyLead {
		id: number;
		Name: string;
		Quote: string;
		Charge: string;
		Status: string;
	}
	let leadItem: MyLead = { id: 0, Name: '', Quote: '', Charge: '', Status: '' };

	let today = data.dates;

	//Date Range Variables
	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});
	let value: DateRange | undefined = {
		start: new CalendarDate(today.year, today.month, today.day).subtract({ days: 45 }),
		end: new CalendarDate(today.year, today.month, today.day)
	};
	let startValue: DateValue | undefined = undefined;
	//End Date Range

	//Leads
	const containerStyle =
		'bg-secondary rounded-lg md:w-1/5 w-[95%] md:ml-0 md:mr-0 ml-auto mr-auto flex flex-col justify-start pt-5 pb-5 shadow-gray-500 shadow-md text-xl font-semibold md:mb-0 mb-5 overflow-scroll ';
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
	 * @param {number} num
	 */
	function formatNumberToCurrencyShort(num) {
		if (num < 1000) {
			// For numbers less than 1000, simply prepend the dollar sign
			return '$' + num;
		} else if (num % 1000) {
			// For numbers 1000 and above, divide by 1000 and format to one decimal place
			const dividedNum = num / 1000;
			return '$' + dividedNum.toFixed(1) + 'k';
		} else {
			const dividedNum = num / 1000;
			return '$' + dividedNum.toFixed(0) + 'k';
		}
	}

	const updateValue = () => {
		newLeadsValue = 0;
		contactedValue = 0;
		quotedValue = 0;
		wonValue = 0;
		lostValue = 0;

		displayList.forEach((e) => {
			switch (e.Status) {
				case 'New Lead':
					newLeadsValue = newLeadsValue + e.Quote;
					return;
				case 'Contacted':
					contactedValue = contactedValue + e.Quote;
					return;
				case 'Quoted':
					quotedValue = quotedValue + e.Quote;
					return;
				case 'Won':
					wonValue = wonValue + e.Quote;
					return;
				case 'Lost':
					lostValue = lostValue + e.Quote;
					return;
				default:
					return;
			}
		});

		newLeadsValue = formatNumberToCurrencyShort(newLeadsValue);
		contactedValue = formatNumberToCurrencyShort(contactedValue);
		quotedValue = formatNumberToCurrencyShort(quotedValue);
		wonValue = formatNumberToCurrencyShort(wonValue);
		lostValue = formatNumberToCurrencyShort(lostValue);
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

		customerLoaded = false;
	};

	const resetLead = () => {
		leadDetails = {
			court: null,
			case_number: null,
			charges: null,
			date_of_incident: null,
			finance_owner: null,
			referral: null,
			reason_for_visit: null,
			quote: null,
			status: null
		};
	};

	const resetErrors = () => {
		failedField = {
			first_name: null,
			last_name: null,
			phone_1: null,
			phone_2: null
		};
	};

	onMount(() => {
		if (form?.error) {
			switch (form?.message) {
				case 'first_name':
					failedField.first_name = 'Missing First Name';
					toast.error(failedField.first_name);
					break;
				case 'last_name':
					failedField.last_name = 'Missing Last Name';
					toast.error(failedField.last_name);
					break;
				case 'Phone 1':
					failedField.phone_1 = 'Phone Number 1 too long';
					toast.error(failedField.phone_1);
					break;
				case 'Phone 2':
					failedField.phone_2 = 'Phone Number 2 too long';
					toast.error(failedField.phone_2);
					break;
			}
			newLead = true;
			customerDetails = {
				id: form.data.id,
				orgid: form.data.orgid,
				first_name: form.data.first_name,
				last_name: form.data.last_name,
				date_of_birth: form.data.date_of_birth,
				email: form.data.email,
				phone_1: form.data.phone_1,
				phone_2: form.data.phone_2,
				relationship: form.data.relationship,
				residence: form.data.residence,
				occupation: form.data.occupation,
				prior_charges: form.data.prior_charges
			};

			console.log(customerDetails.relationship);

			leadDetails = {
				court: form.data.court,
				case_number: form.data.case_number,
				charges: form.data.charges,
				date_of_incident: form.data.date_of_incident,
				finance_owner: form.data.finance_owner,
				referral: form.data.referral,
				reason_for_visit: form.data.reason_for_visit,
				quote: form.data.quote,
				status: form.data.status
			};
		}

		if (form?.leadList) {
			leadList = form.leadList;
			displayList = leadList;

			const begin = new Date(form.dates.start.replace(/-/g, '/'));
			const ending = new Date(form.dates.end.replace(/-/g, '/'));

			value = {
				start: new CalendarDate(begin.getFullYear(), begin.getMonth() + 1, begin.getDate()),
				end: new CalendarDate(ending.getFullYear(), ending.getMonth() + 1, ending.getDate())
			};

			showArchived();
			updateValue();
		}
	});

	showArchived();
	updateValue();
</script>

<Toaster />
<div
	class="ml-auto mr-auto flex w-[90%] flex-col justify-start md:ml-0 md:mr-0 md:h-full md:w-full"
>
	<section
		class="mb-0 flex flex-col-reverse justify-between pb-4 md:h-[10%] md:min-h-36 md:flex-row"
	>
		<div class="mb-5 mt-auto flex flex-col justify-center md:mb-0 md:w-1/3 md:justify-start">
			<div
				class="flex justify-center text-center text-2xl md:ml-14 md:w-[300px] md:justify-between md:text-base"
			>
				<input
					name="archive"
					type="checkbox"
					class="order-2 mb-auto mt-auto h-10 w-5 md:ml-10"
					on:click={() => {
						toggleArchive = !toggleArchive;
						showArchived();
					}}
				/>
				<label for="archive" class="order-1 mb-auto mr-2 mt-auto font-bold md:ml-0"
					>Show Archive:</label
				>
			</div>
			<section class="ml-2 mr-2 md:ml-14 md:mr-14">
				<div class="mb-2 flex flex-col justify-center md:w-[300px] md:flex-row md:justify-between">
					<div class="ml-auto mr-auto text-xl font-bold md:ml-0 md:mr-0 md:pr-5 md:text-base">
						Create Date Range:
					</div>
					<form method="post" action="?/updateDateRange" class="ml-auto mr-auto md:ml-0 md:mr-0">
						<label for="start" hidden>Start</label>
						<input hidden type="text" name="start" value={value?.start} />
						<input hidden type="text" name="end" value={value?.end} />
						<button
							class={` ${value?.start && value?.end ? 'bg-good hover:bg-good/75' : 'pointer-events-none bg-good/50'} rounded-md pb-1 pl-10 pr-10 pt-1 text-white active:scale-95 md:pb-1 md:pl-2 md:pr-2 md:pt-1`}
							>Update</button
						>
					</form>
				</div>
				<div class="">
					<div class="grid gap-2">
						<Popover.Root openFocus>
							<Popover.Trigger asChild let:builder>
								<Button
									variant="outline"
									class={cn(
										'text-center text-lg font-normal md:w-[300px] md:justify-start md:text-left md:text-base',
										!value && 'text-muted-foreground'
									)}
									builders={[builder]}
								>
									<CalendarIcon class="mr-2 h-5 w-5 md:h-4 md:w-4" />
									{#if value && value.start}
										{#if value.end}
											{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
												value.end.toDate(getLocalTimeZone())
											)}
										{:else}
											{df.format(value.start.toDate(getLocalTimeZone()))}
										{/if}
									{:else if startValue}
										{df.format(startValue.toDate(getLocalTimeZone()))}
									{:else}
										Pick a date
									{/if}
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-auto p-2" align="center">
								<RangeCalendar
									bind:value
									bind:startValue
									placeholder={value?.start}
									initialFocus
									numberOfMonths={2}
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>
			</section>
		</div>
		<div class="flex flex-col justify-center">
			<h1
				class="mb-5 ml-auto mr-auto mt-5 text-center text-6xl font-semibold md:mb-0 md:mt-0 md:w-1/3"
			>
				Leads
			</h1>
		</div>
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
		class="mb-5 ml-auto mr-auto flex h-full w-full flex-col justify-start md:mb-0 md:h-[90%] md:min-h-[70%] md:flex-row md:justify-evenly"
	>
		<!-- New Leads -->
		<ul class={containerStyle} on:drop={(e) => assignedDrop(e, 'New Lead')} on:dragover={dragOver}>
			<div class="flex justify-evenly">
				<div class="w-1/5" />
				<h4 class={containerTitleStyle}>New Leads</h4>
				<div class="mb-auto mt-auto w-1/5 text-end font-normal">{newLeadsValue}</div>
			</div>
			<div class="flex flex-col">
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
			<div class="flex justify-evenly">
				<div class="w-1/5" />
				<h4 class={containerTitleStyle}>Contacted</h4>
				<div class="mb-auto mt-auto w-1/5 text-end font-normal">{contactedValue}</div>
			</div>
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
			<div class="flex justify-evenly">
				<div class="w-1/5" />
				<h4 class={containerTitleStyle}>Quoted</h4>
				<div class="mb-auto mt-auto w-1/5 text-end font-normal">{quotedValue}</div>
			</div>
			<div class="flex flex-col">
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
			class="ml-auto mr-auto flex w-[95%] flex-col justify-between md:ml-0 md:mr-0 md:w-1/5"
		>
			<!-- --- -->
			<!-- Won -->
			<!-- --- -->
			<ul
				class="mb-5 flex h-96 flex-col justify-center overflow-hidden rounded-lg bg-main pb-2 pt-5 text-xl font-semibold shadow-md shadow-gray-500 md:mb-0 md:h-[49%]"
				on:drop={(e) => assignedDrop(e, 'Won')}
				on:dragover={dragOver}
			>
				<div class="flex justify-evenly text-white">
					<div class="w-1/5" />
					<h4 class="text-center text-3xl text-white md:text-2xl">Won</h4>
					<div class="mb-auto mt-auto w-1/5 text-end font-normal">{wonValue}</div>
				</div>
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

			<!---------->
			<!-- Lost -->
			<!---------->
			<ul
				class="mb-24 flex flex-col justify-center overflow-hidden rounded-lg bg-bad pt-5 text-xl font-semibold shadow-md shadow-gray-500 md:mb-0 md:h-[49%]"
				on:drop={(e) => assignedDrop(e, 'Lost')}
				on:dragover={dragOver}
			>
				<div class="flex justify-evenly text-white">
					<div class="w-1/5" />
					<h4 class="text-center text-3xl text-white md:text-2xl">Lost</h4>
					<div class="mb-auto mt-auto w-1/5 text-end font-normal">{lostValue}</div>
				</div>
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
					on:click={() => {
						newLead = false;
						resetCustomer();
						resetLead();
						resetErrors();
					}}
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
					<!-- <label hidden for="created_at" />
					<input
						name=""
						hidden
						type="text"
						value={() => {
							const newDate = new Date();
							return newDate;
						}}
					/> -->
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
							value={customerDetails.first_name ?? null}
						/>
					</li>
					{#if failedField.first_name}
						<p class="-mt-2 pr-5 text-end text-red-600">{failedField.first_name}</p>
					{/if}
					<li class={nlLIStyle}>
						<label for="last_name" class={nlLabelStyle}>Last Name:</label>
						<input
							name="last_name"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.last_name ?? null}
						/>
					</li>
					{#if failedField.last_name}
						<p class="-mt-2 pr-5 text-end text-red-600">{failedField.last_name}</p>
					{/if}
					<li class={nlLIStyle}>
						<label for="date_of_birth" class={nlLabelStyle}>DOB:</label>
						<input
							name="date_of_birth"
							type="date"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.date_of_birth ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="email" class={nlLabelStyle}>Email:</label>
						<input
							name="email"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.email ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="phone_1" class={nlLabelStyle}>Phone 1:</label>
						<input
							name="phone_1"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.phone_1 ?? null}
						/>
					</li>
					{#if failedField.phone_1}
						<p class="-mt-2 pr-5 text-end text-red-600">{failedField.phone_1}</p>
					{/if}
					<li class={nlLIStyle}>
						<label for="phone_2" class={nlLabelStyle}>Phone 2:</label>
						<input
							name="phone_2"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.phone_2 ?? null}
						/>
					</li>
					{#if failedField.phone_2}
						<p class="-mt-2 pr-5 text-end text-red-600">{failedField.phone_2}</p>
					{/if}
					<li class={nlLIStyle}>
						<label for="relationship" class={nlLabelStyle}>Relationship Status:</label>
						<select
							name="relationship"
							class={`${customerLoaded ? nlInputCustomerLoaded : nlInputStyle} text-center`}
						>
							<option value="null" selected={customerDetails.relationship === 'null' ? true : false}
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
							value={customerDetails.residence ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="occupation" class={nlLabelStyle}>Occupation:</label>
						<input
							name="occupation"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.occupation ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="prior_charges" class={nlLabelStyle}>Prior Charges:</label>
						<input
							name="prior_charges"
							type="text"
							class={customerLoaded ? nlInputCustomerLoaded : nlInputStyle}
							value={customerDetails.prior_charges ?? null}
						/>
					</li>
				</ul>

				<div class="mb-5 ml-auto mr-auto mt-5 h-1 w-3/4 rounded-lg bg-secondary"></div>
				<section class="text-center text-2xl font-bold text-white">Case Details</section>
				<ul class={nlULStyle}>
					<li class={nlLIStyle}>
						<label for="court" class={nlLabelStyle}>Court:</label>
						<input
							name="court"
							type="text"
							class={nlInputStyle}
							value={leadDetails.court ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="case_number" class={nlLabelStyle}>Case Number:</label>
						<input
							name="case_number"
							type="text"
							class={nlInputStyle}
							value={leadDetails.case_number ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="charges" class={nlLabelStyle}>Charges:</label>
						<input
							name="charges"
							type="text"
							class={nlInputStyle}
							value={leadDetails.charges ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="date_of_incident" class={nlLabelStyle}>Date of Incident:</label>
						<input
							name="date_of_incident"
							type="date"
							class={nlInputStyle}
							value={leadDetails.date_of_incident ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="finance_owner" class={nlLabelStyle}>Finance Owner:</label>
						<input
							name="finance_owner"
							type="text"
							class={nlInputStyle}
							value={leadDetails.finance_owner ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="referral" class={nlLabelStyle}>Referral:</label>
						<input
							name="referral"
							type="text"
							class={nlInputStyle}
							value={leadDetails.referral ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="reason_for_visit" class={nlLabelStyle}>Reason for Visit:</label>
						<select
							name="reason_for_visit"
							value={leadDetails.reason_for_visit}
							class={nlInputStyle}
						>
							<option value={null} selected={leadDetails.reason_for_visit === null ? true : false}
								>-</option
							>
							<option
								value={'Vacation'}
								selected={leadDetails.reason_for_visit === 'Vacation' ? true : false}
								>Vacation</option
							>
							<option
								value={'Business'}
								selected={leadDetails.reason_for_visit === 'Business' ? true : false}
								>Business</option
							>
							<option
								value={'Prior Resident'}
								selected={leadDetails.reason_for_visit === 'Prior Resident' ? true : false}
								>Prior Resident</option
							>
							<option
								value={'Passing Through'}
								selected={leadDetails.reason_for_visit === 'Passing Through' ? true : false}
								>Passing Through</option
							>
						</select>
					</li>
					<li class={nlLIStyle}>
						<label for="quote" class={nlLabelStyle}>Quote:</label>
						<input
							name="quote"
							type="text"
							class={nlInputStyle}
							value={leadDetails.quote ?? null}
						/>
					</li>
					<li class={nlLIStyle}>
						<label for="status" class={nlLabelStyle}>Lead Status:</label>
						<select name="status" class={nlInputStyle}>
							<option value="New Lead" selected={leadDetails.status === 'New Lead' ? true : false}
								>New Lead</option
							>
							<option value="Contacted" selected={leadDetails.status === 'Contacted' ? true : false}
								>Contacted</option
							>
							<option value="Quoted" selected={leadDetails.status === 'Quoted' ? true : false}
								>Quoted</option
							>
							<option value="Won" selected={leadDetails.status === 'won' ? true : false}>Won</option
							>
							<option value="Lost" selected={leadDetails.status === 'Lost' ? true : false}
								>Lost</option
							>
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
