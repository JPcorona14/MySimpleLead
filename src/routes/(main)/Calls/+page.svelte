<script>
	import Separator from 'src/lib/Separator.svelte';
	import SeparatorThin from 'src/lib/SeparatorThin.svelte';
	import NewCallField from './NewCallField.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import CallRow from './CallRow.svelte';
	import CallHeader from './CallHeader.svelte';
	import CallDirection from './CallDirection.svelte';

	export let data;
	let calls = data.calls;
	let newCallDirection = false;
</script>

<section class="w-full">
	<!-- Title of Page -->
	<div class="mb-10 mt-10 flex w-full justify-center">
		<h1 class="text-center text-4xl font-bold">Call Log</h1>
	</div>

	<Separator />

	<!-- Add a New Call -->
	<form method="POST" action="?/NewCall" class="mb-10 mt-10 flex w-full justify-center pl-10 pr-10">
		<ul class="text-cen mb-auto mt-auto flex w-full justify-between pl-10 pr-10">
			<div class="flex w-10 justify-center">
				<CallDirection callD={newCallDirection} />
			</div>
			<NewCallField name="first_name" holder="First Name" />
			<NewCallField name="last_name" holder="Last Name" />
			<NewCallField name="phone" holder="Phone #" />
			<NewCallField name="reason_for_call" holder="Reason for Call" />
			<NewCallField name="notes" holder="Notes" />
		</ul>
		<button type="submit" class=" h-10 w-10 rounded-full bg-main text-white">
			<div class="m-auto h-5 w-5">
				<FaPlus />
			</div>
		</button>
	</form>

	<Separator />

	<!-- List Calls -->
	<table class="w-full">
		<tr class="mb-4 ml-10 mr-10 mt-4 flex justify-between">
			<CallHeader width="w-36" title="Date/Time" />
			<CallHeader width="w-16" title="Direction" />
			<CallHeader width="w-36" title="First Name" />
			<CallHeader width="w-36" title="Last Name" />
			<CallHeader width="w-36" title="Phone" />
			<CallHeader width="w-36" title="Reason for Call" />
			<CallHeader width="w-36" title="Notes" />
			<th> Update </th>
		</tr>
		{#each calls as call, i}
			<div>
				<CallRow
					id={call.id}
					created={call.created_at}
					fName={call.first_name}
					lName={call.last_name}
					phone={call.phone}
					rfc={call.reason_for_call}
					notes={call.notes}
					callDirect={call.call_direction}
				/>
				<!-- {#if i + 1 !== calls.length}
					<div class="mb-2" />
					<SeparatorThin />
					<div class="mb-2" />
				{/if} -->
			</div>
		{/each}
	</table>
</section>
