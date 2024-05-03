<script lang="ts">
	// @ts-ignore
	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		toLocalTimeZone
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';

	import { fly } from 'svelte/transition';
	import FaList from 'svelte-icons/fa/FaList.svelte';
	import FaLevelUpAlt from 'svelte-icons/fa/FaLevelUpAlt.svelte';
	import { onMount } from 'svelte';
	import toast, { Toaster } from 'svelte-french-toast';
	import LeadIdInputField from '$lib/LeadIDInputField.svelte';
	import LeadIdDropDownField from 'src/lib/LeadIdDropDownField.svelte';
	export let data;

	const df = new DateFormatter('en-US', {
		dateStyle: 'short'
	});

	let taskDueDate: DateValue | undefined = undefined;
	let taskDueTime = '09:00';

	let tasks: {
		id: any;
		created_at: any;
		active: boolean;
		edit: boolean;
		text: string | any;
		completed: boolean;
		due: any;
		newDueDate: DateValue | undefined;
		dueDate: any | null;
		dueTime: any | null;
	}[] = data.task;

	let contact = data.contact;
	let lead = data.lead;
	let activity = data.activity.sort((a, b) => b.id - a.id);
	let newActivity = false;
	let newActivityValue = 'Note';
	let viewActivity = false;
	let isMobile = false;

	const contactFields = [
		{
			fieldName: 'first_name',
			displayName: 'First Name',
			copyField: true,
			order: 'order-1'
		},
		{
			fieldName: 'last_name',
			displayName: 'Last Name',
			copyField: true,
			order: 'md:order-3 order-2'
		},
		{
			fieldName: 'date_of_birth',
			displayName: 'Date of Birth',
			copyField: true,
			order: 'md:order-2 order-3'
		},
		{
			fieldName: 'occupation',
			displayName: 'Occupation',
			copyField: false,
			order: 'md:order-4 order-7'
		},
		{
			fieldName: 'email',
			displayName: 'Email',
			copyField: true,
			order: 'md:order-5 order-4'
		},
		{
			fieldName: 'residence',
			displayName: 'Residence',
			copyField: false,
			order: 'md:order-6 order-8'
		},
		{
			fieldName: 'phone_1',
			displayName: 'Phone 1',
			copyField: true,
			order: 'md:order-7 order-5'
		},
		{
			fieldName: 'phone_2',
			displayName: 'Phone 2',
			copyField: true,
			order: 'md:order-9 order-6'
		},
		{
			fieldName: 'prior_charges',
			displayName: 'Prior Charges',
			copyField: false,
			order: 'order-10'
		},
		{
			fieldName: 'relationship',
			displayName: 'Relationship',
			isDropDown: true,
			options: [
				{ name: '-', value: null },
				{ name: 'Married', value: true },
				{ name: 'Single', value: false }
			],
			order: 'order-9 md:order-8'
		}
	];

	let caseFields = [
		{ field: 'court', displayName: 'Court', order: 'order-1' },
		{ field: 'case_number', displayName: 'Case Number', copy: true, order: 'order-2' },
		{ field: 'finance_owner', displayName: 'Finance Owner', order: 'order-3' },
		{ field: 'referral', displayName: 'Referral', order: 'order-4' },
		{ field: 'date_of_incident', displayName: 'Incident Date', order: 'order-5' },
		{
			field: 'reason_for_visit',
			displayName: 'Reason for Visit',
			isDropDown: true,
			options: [
				{ name: '-', value: null },
				{ name: 'Vacation', value: 'Vacation' },
				{ name: 'Business', value: 'Business' },
				{ name: 'Prior Resident', value: 'Prior Resident' },
				{ name: 'Passing Through', value: 'Passing Through' }
			],
			order: 'order-6'
		},
		{ field: 'current_attorney', displayName: 'Current Attorney', order: 'order-7' },
		{ field: 'next_court_date', displayName: 'Next Court Date', order: 'order-8' },
		{ field: 'next_court_reason', displayName: 'Next Court Reason', order: 'order-9 md:order-10' },
		{ field: 'npr', displayName: 'NPR', order: 'order-10 md:order-9' },
		{ field: 'financial_affidavit', displayName: 'Financial Affidavit', order: 'order-11' }
	];

	const autoResize = (textarea) => {
		// Reset textarea height to auto (to shrink back when deleting text)
		textarea.style.height = 'auto';
		// Set the height to the scroll height to remove the scrollbar
		textarea.style.height = textarea.scrollHeight + 'px';
	};

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

	tasks = tasks.map((e) => {
		// Create Date and Time
		const createDate = new Date(e.created_at);
		const formattedCreateDate = createDate.toLocaleDateString('en-US');
		let createHour = createDate.getHours() % 12;
		createHour = createHour ? createHour : 12;
		const createMinute = createDate.getMinutes().toString().padStart(2, '0');
		const createAMPM = createDate.getHours() < 12 ? 'AM' : 'PM';
		const updatedCreateDateTime = `${formattedCreateDate} ${createHour}:${createMinute} ${createAMPM}`;

		// Due Date and Time
		const thisDueDate = new Date(e.due);
		const formattedDueDate = thisDueDate.toLocaleDateString('en-US');
		let dueHour = thisDueDate.getHours().toString() % '12';
		dueHour = dueHour ? dueHour.toString().padStart(2, '0') : '12';
		const dueMinute = thisDueDate.getMinutes().toString().padStart(2, '0');
		const dueAMPM = thisDueDate.getHours() < 12 ? 'AM' : 'PM';
		const updatedDueDateTime = `${formattedDueDate} ${dueHour}:${dueMinute} ${dueAMPM}`;

		// Due Date only for Pop Up calendar
		const calendarDueDate = df.format(thisDueDate);
		const calendarDueTime = `${dueAMPM === 'PM' ? (Number(dueHour) + 12).toString() : dueHour}:${dueMinute}`;

		return {
			...e,
			created_at: updatedCreateDateTime,
			due: updatedDueDateTime,
			newDueDate: undefined,
			dueDate: formattedDueDate,
			dueTime: calendarDueTime
		};
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
		const newData = Object.fromEntries(formData.entries());
		const currentActivity = activity[newData.i];

		if (currentActivity.text !== newData.text || currentActivity.type !== newData.type) {
			console.log(newData);
			try {
				fetch('/api/Leads/Activity/UpdateActivity', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: newData.activity_id,
						type: newData.type,
						text: newData.text
					})
				})
					.then((r) => r.json())
					.then((res) => {
						console.log(res);
						activity[newData.i].type = res.activity[0].type;
						activity[newData.i].text = res.activity[0].text;
					});
			} catch (err) {
				console.log(err);
			}
		} else {
			console.log('nothing to do');
		}

		activity[data.i].edit = false;
	};

	const editTaskCompleted = async (event) => {
		event?.preventDefault();
		const formData = new FormData(event?.target);
		const currentTask = Object.fromEntries(formData.entries());
		const index = Number(currentTask.index);

		try {
			await fetch('/api/Leads/Tasks/UpdateTaskCompleted', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id: tasks[index].id,
					completed: !tasks[index].completed
				})
			})
				.then((r) => r.json())
				.then((res) => {
					tasks[index].completed = res.task[0].completed;
				});
		} catch (err) {
			console.log(err);
		}
	};

	const editTaskDetails = async (event) => {
		event?.preventDefault();
		const formData = new FormData(event?.target);
		const currentTask = Object.fromEntries(formData.entries());
		const index = Number(currentTask.index);

		try {
			fetch('/api/Leads/Tasks/UpdateTaskDetails', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id: tasks[index].id,
					dueDate: currentTask.taskDate,
					dueTime: currentTask.taskTime,
					text: currentTask.text
				})
			})
				.then((r) => r.json())
				.then((res) => {
					console.log(res);
				});
		} catch (err) {
			console.log(err);
		}
	};

	onMount(() => {
		isMobile = window.innerWidth <= 850 ? true : false;
		// checkLogin($authStore.orgid);
		autoResize(document.getElementById('chargesTextArea'));
	});

	const copyAll = () => {
		//Start by copying the quote and charges to the clipboard
		let textBody = `Quoted: ${lead.quote ? formatter.format(lead.quote) : '-'} \n`;
		textBody += `Charges: ${lead.charges} \n`;

		for (let i = 0; i < contactFields.length; i++) {
			if (contact[contactFields[i].fieldName] && contactFields[i].displayName !== 'Relationship') {
				textBody +=
					contactFields[i].displayName + ': ' + contact[contactFields[i].fieldName] + '\n';
			}

			if (
				contactFields[i].displayName === 'Relationship' &&
				contact[contactFields[i].fieldName] !== null
			) {
				textBody +=
					contactFields[i].displayName +
					': ' +
					(contact[contactFields[i].fieldName] ? 'Married' : 'Single') +
					'\n';
			}
		}

		for (let i = 0; i < caseFields.length; i++) {
			if (lead[caseFields[i].field]) {
				textBody += caseFields[i].displayName + ': ' + lead[caseFields[i].field] + '\n';
			}
		}

		console.log(textBody);

		navigator.clipboard.writeText(textBody);
		toast.success('Clipboard: \n' + textBody);
	};
</script>

<Toaster />
<div class="flex h-full w-[95%] flex-col md:w-full md:flex-row md:pl-10">
	{#if !viewActivity}
		<section class="md:w-3/4">
			<section
				class="mb-10 mt-10 flex flex-col-reverse justify-between md:mt-10 md:flex-row md:flex-wrap"
			>
				<div class="md:flex-[1]">
					<a
						href="../Leads"
						class=" ml-10 hidden h-12 w-12 justify-center rounded-full bg-main text-3xl text-white no-underline shadow-md shadow-gray-500 hover:bg-main/75 active:scale-95 md:visible md:flex"
						><div class="mb-auto mt-auto">&lt;</div></a
					>
				</div>
				<div class="mt-5 flex flex-col md:mt-0 md:min-w-96 md:flex-[2]">
					<h1 class="text-center text-5xl font-bold">{contact.first_name} {contact.last_name}</h1>
					<textarea
						id="chargesTextArea"
						on:input={(e) => autoResize(document.getElementById('chargesTextArea'))}
						placeholder="-"
						rows="1"
						on:keydown={(e) => (e.keyCode === 13 && !e.shiftKey ? e.target?.blur() : '')}
						on:blur={(e) => updateLeadField('charges', e.target?.value)}
						value={lead.charges}
						class="no-scrollbar ml-auto mr-auto mt-5 w-full resize-none whitespace-pre-line text-wrap rounded-lg border-none pb-1 pl-2 pr-2 pt-1 text-center text-2xl"
					/>

					<button
						on:click={() => updateLeadField('archive', !lead.archive)}
						class={`${lead.archive ? 'bg-main' : 'bg-bad'} ml-auto mr-auto mt-10 h-10 w-48 rounded-lg text-xl font-bold text-white shadow-md shadow-gray-500`}
						>{lead.archive ? 'Restore' : 'Archive'}</button
					>
				</div>
				<div class="mb-auto flex flex-col justify-start md:mr-10 md:w-12 md:flex-[1]">
					<div class="mb-5 flex justify-end">
						<select
							class="ml-auto mr-auto mt-0 w-1/2 rounded-lg border border-none bg-main p-1 pl-5 pr-5 text-center text-2xl font-bold text-white shadow-md shadow-gray-500 md:mr-0 md:mt-10 md:w-fit lg:mt-0"
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
							class="bg-transparent text-center text-2xl italic md:text-end"
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

			<section class="pb-auto flex h-16 justify-end">
				<div class="">
					<button
						on:click={copyAll}
						class="h-10 w-24 rounded-lg bg-good text-xl font-bold text-white shadow-md shadow-gray-500"
						>Share</button
					>
				</div>
			</section>

			<!-- ------------------ -->
			<!-- Client Information -->
			<!-- - - - Start - - -  -->
			<!-- ------------------ -->
			<section class="flex">
				<div class="w-full">
					<section class="w-full">
						<div
							class="w-full rounded-lg bg-main pb-2 pt-2 text-center text-2xl font-bold text-white shadow-md shadow-gray-500"
						>
							Client Information
						</div>
						<div class="flex justify-center text-xl md:mt-4 md:w-full">
							<ul class="ml-auto mr-auto flex w-full flex-row flex-wrap justify-center">
								{#each contactFields as item, index}
									{#if item.isDropDown}
										<LeadIdDropDownField
											fieldID={contact.id}
											fieldType="contact"
											fieldName={item.fieldName}
											displayName={item.displayName}
											bind:currentValue={contact[item.fieldName]}
											fieldOptions={item.options}
											order={item.order}
										/>
									{:else}
										<LeadIdInputField
											copyField={item.copyField}
											fieldID={contact.id}
											fieldType="contact"
											fieldName={item.fieldName}
											displayName={item.displayName}
											bind:currentValue={contact[item.fieldName]}
											order={item.order}
										/>
									{/if}
								{/each}
							</ul>
						</div>
					</section>
					<!-- ------------------ -->
					<!-- Client Information -->
					<!-- - - - End - - -  -->
					<!-- ------------------ -->

					<!-- ------------------ -->
					<!-- Case Information -->
					<!-- - - - Start - - -  -->
					<!-- ------------------ -->
					<section>
						<div
							class="mt-10 w-full rounded-lg bg-main pb-2 pt-2 text-center text-2xl font-bold text-white shadow-md shadow-gray-500"
						>
							Case Details
						</div>
						<div class="m-5 flex justify-center text-xl md:ml-auto md:mr-auto md:w-full">
							<ul class="ml-auto mr-auto flex w-full flex-wrap md:justify-center">
								{#each caseFields as item, index}
									{#if item.isDropDown}
										<LeadIdDropDownField
											fieldType="lead"
											fieldID={lead.id}
											fieldName={item.field}
											displayName={item.displayName}
											bind:currentValue={lead[item.field]}
											fieldOptions={item.options}
											order={item.order}
										/>
									{:else}
										<LeadIdInputField
											copyField={item?.copy}
											fieldID={lead.id}
											fieldType={'lead'}
											fieldName={item.field}
											displayName={item.displayName}
											bind:currentValue={lead[item.field]}
											order={item.order}
										/>
									{/if}
								{/each}
							</ul>
						</div>
					</section>
					<!-- ------------------ -->
					<!-- Case Information -->
					<!-- - - - End - - -  -->
					<!-- ------------------ -->

					<!-- ------------------ -->
					<!-- ----Documents----- -->
					<!-- - - - Start - - -  -->
					<!-- ------------------ -->
					<!-- <section>
						<div
							class="mt-10 w-full rounded-lg bg-main pb-2 pt-2 text-center text-2xl font-bold text-white shadow-md shadow-gray-500"
						>
							Documents
						</div>
					</section> -->
					<!-- ------------------ -->
					<!-- ----Documents----- -->
					<!-- - - - End - - -  -->
					<!-- ------------------ -->
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
			class={`h-full md:visible md:relative md:flex md:w-1/4 md:min-w-[300px] md:p-4`}
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
					<li class="m-1 flex justify-center">
						<button
							on:click={() => filterActivity('X')}
							class="mb-2 mt-4 w-3/4 rounded-lg bg-bad pb-1 pl-2 pr-2 pt-1 text-white shadow-md shadow-gray-500 hover:bg-bad/75 active:scale-95 md:mb-0 md:mt-0 md:w-fit"
							>X</button
						>
					</li>
				</ul>

				<!-- Set Task -->

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
				<ul class="w-full md:text-sm">
					{#if newActivity}
						<form method="POST" action="?/newActivity">
							<li class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500">
								<div class="flex justify-between">
									<label for="lead_id" hidden />
									<input name="lead_id" value={data.id} hidden />
									<label for="type" hidden />
									<select name="type" bind:value={newActivityValue}>
										<option value="Call" class="font-bold">Call</option>
										<option value="Email" class="font-bold">Email</option>
										<option value="Note" selected class="font-bold">Notes</option>
										<option value="Task" class="font-bold">Task</option>
									</select>
									<button
										id="submitNote"
										class="mb-2 w-1/3 rounded-lg bg-good pb-1 pt-1 font-bold text-white hover:bg-good/75 active:scale-95"
										>Save</button
									>
								</div>

								<!-- Set New Task -->
								<!-- Start -->
								{#if newActivityValue === 'Task'}
									<div class="w-full rounded-md">
										<label for="taskDate" hidden />
										<input name="taskDate" bind:value={taskDueDate} hidden />
										<div class="mb-2 mt-2 flex justify-between">
											<div class="w-1/2">
												<Popover.Root openFocus>
													<Popover.Trigger asChild let:builder>
														<Button
															variant="outline"
															class={cn(
																'w-full justify-start border-none pl-2 text-left font-normal shadow-none',
																!taskDueDate && 'text-muted-foreground'
															)}
															builders={[builder]}
														>
															<CalendarIcon class="mr-2 h-4 w-4" />
															{taskDueDate
																? df.format(taskDueDate.toDate(getLocalTimeZone()))
																: 'Select a date'}
														</Button>
													</Popover.Trigger>
													<Popover.Content class="w-auto p-0">
														<Calendar bind:value={taskDueDate} initialFocus />
													</Popover.Content>
												</Popover.Root>
											</div>
											<div class="flex w-1/2 min-w-24 justify-center rounded-lg hover:bg-gray-100">
												<label for="taskTime" hidden />
												<input
													name="taskTime"
													type="time"
													placeholder={taskDueTime}
													bind:value={taskDueTime}
													class="bg-transparent"
												/>
											</div>
										</div>
									</div>
								{/if}
								<!-- End -->

								<lable for="text" hidden />
								<textarea
									id="newCommentTextArea"
									name="text"
									placeholder="Type here..."
									rows="2"
									on:input={() => autoResize(document.getElementById('newCommentTextArea'))}
									on:keypress={(e) => {
										if (e.keyCode === 13 && !e.shiftKey) {
											e.target.blur();
											const submitNote = document.getElementById('submitNote');
											submitNote.click();
										}
									}}
									class="min-h-14 w-full p-1"
								/>
							</li>
						</form>
					{/if}

					<!-- List Task -->

					{#each tasks as task, index}
						<li
							on:mouseenter={() => (task.active = true)}
							on:mouseleave={() => (task.active = false)}
							id={task.id}
							class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500"
						>
							<!-- ---------------- -->
							<!-- Task View - Base -->
							<!-- ---------------- -->
							{#if !task.edit}
								<div class="flex flex-col justify-between">
									{#if task.completed}
										<div
											class="mb-2 border-b border-t bg-secondary text-center text-base font-bold"
										>
											Task Completed
										</div>
									{:else}
										<div
											class="mb-2 border-b border-t bg-secondary text-center text-base font-bold"
										>
											Task
										</div>
									{/if}
									<div class="flex justify-between">
										<div class="font-bold">Created:</div>
										<div class="">{task.created_at}</div>
									</div>
									<div class="flex justify-between">
										<div class="font-bold">Due:</div>
										<div class="">{task.due}</div>
									</div>
								</div>

								<p class=" whitespace-pre-line">{task.text}</p>

								<!-- ----------------------- -->
								<!-- Task - Completed Button -->
								<!-- ----------------------- -->
								{#if !task.completed}
									<form on:submit|preventDefault={editTaskCompleted} class="m-2">
										<label for="id" hidden />
										<input name="id" value={task.id} hidden />
										<label for="index" hidden />
										<input name="index" value={index} hidden />
										<label for="completed" hidden />
										<input name="completed" value={task.completed} hidden />
										<button
											class="h-full w-full scale-100 transform rounded-md bg-main pb-1 pt-1 font-bold text-white shadow-md shadow-gray-500 transition-transform duration-100 active:scale-95"
											>Done</button
										>
									</form>
								{/if}

								<!-- --------------------- -->
								<!-- Task View - Edit Mode -->
								<!-- --------------------- -->
							{:else}
								<form
									on:submit|preventDefault={editTaskDetails}
									class="flex flex-col justify-center"
								>
									<label for="i" hidden />
									<input name="i" value={index} hidden />
									<label for="activity_id" hidden />
									<input name="activity_id" value={task.id} hidden />

									<div class="mb-2 border-b border-t bg-secondary text-center text-base font-bold">
										Task
									</div>

									<div class="flex justify-between">
										<div class="font-bold">Created:</div>
										<div class="">{task.created_at}</div>
									</div>
									<div class="flex flex-col">
										<div class="font-bold">Due:</div>
										<div class="w-full rounded-md">
											<label for="taskDate" hidden />
											<input name="taskDate" bind:value={taskDueDate} hidden />
											<div class="mb-2 mt-2 flex justify-between">
												<div class="w-1/2">
													<Popover.Root openFocus>
														<Popover.Trigger asChild let:builder>
															<Button
																variant="outline"
																class={cn(
																	'w-full justify-start border-none pl-2 text-left font-normal shadow-none',
																	!taskDueDate && 'text-muted-foreground'
																)}
																builders={[builder]}
															>
																<CalendarIcon class="mr-2 h-4 w-4" />
																{task.newDueDate
																	? df.format(task.newDueDate.toDate(getLocalTimeZone()))
																	: task.dueDate
																		? task.dueDate
																		: 'Select a date'}
															</Button>
														</Popover.Trigger>
														<Popover.Content class="w-auto p-0">
															<Calendar bind:value={task.newDueDate} initialFocus />
														</Popover.Content>
													</Popover.Root>
												</div>
												<div
													class="flex w-1/2 min-w-24 justify-center rounded-lg hover:bg-gray-100"
												>
													<label for="taskTime" hidden />
													<input
														name="taskTime"
														type="time"
														placeholder={task.dueTime}
														bind:value={task.dueTime}
														class="bg-transparent"
													/>
												</div>
											</div>
										</div>
									</div>

									<label for="text" hidden />
									<textarea
										name="text"
										placeholder="Type here..."
										class="min-h-24 w-full rounded-md border p-1"
										value={task.text}
									/>
									<button
										type="submit"
										class="mb-2 mt-2 w-full transform rounded-md bg-good pb-1 pt-1 text-white shadow-md shadow-gray-500 transition-all duration-500 active:scale-95"
										>Save</button
									>
								</form>
							{/if}
							{#if task.completed && task.edit}
								<form class="m-2" on:submit|preventDefault={editTaskCompleted}>
									<label for="id" hidden />
									<input name="id" value={task.id} hidden />
									<label for="index" hidden />
									<input name="index" value={index} hidden />
									<label for="completed" hidden />
									<input name="completed" value={task.completed} hidden />
									<button
										class="h-full w-full scale-100 transform rounded-md bg-main/75 pb-1 pt-1 font-bold text-white shadow-md shadow-gray-500 transition-transform duration-100 active:scale-95"
										>Mark Incomplete</button
									>
								</form>
							{/if}
							{#if task.active || task.edit}
								<div class="mb-1 mt-2 flex justify-around">
									<form method="POST" action="?/editActivity" class="w-2/5">
										<label for="id" hidden />
										<input name="id" value={task.id} hidden />
										{#if task.edit}
											<button
												type="button"
												on:click={() => {
													task.edit = false;
													task.text = task.text;
												}}
												class="h-full w-full rounded-md bg-orange-500 pb-1 pt-1 text-white shadow-md shadow-gray-500"
												>Cancel</button
											>
										{:else}
											<button
												type="button"
												on:click={() => (task.edit = true)}
												class="h-full w-full rounded-md bg-good pb-1 pt-1 text-white shadow-md shadow-gray-500"
												>Edit</button
											>
										{/if}
									</form>
									<form method="POST" action="?/deleteActivity" class="w-2/5">
										<label for="id" hidden />
										<input name="id" value={task.id} hidden />
										<button
											class="h-full w-full rounded-md bg-bad pb-1 pt-1 text-white shadow-md shadow-gray-500"
											>Delete</button
										>
									</form>
								</div>
							{/if}
						</li>
					{/each}

					<!-- List Past Activity -->

					{#each activity as a, index}
						<!-- <Activities currentActivity={act} {index} /> -->
						<li
							on:mouseenter={() => (a.type !== 'Event' ? (a.active = true) : '')}
							on:mouseleave={() => (a.type !== 'Event' ? (a.active = false) : '')}
							id={a.id}
							class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500"
						>
							{#if !a.edit}
								<div class="flex justify-between">
									<div class="font-bold">{a.type}:</div>
									<div class=" italic">{a.created_at}</div>
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

	/* input[type='time']::-webkit-calendar-picker-indicator {
		background: transparent;
	} */
</style>
