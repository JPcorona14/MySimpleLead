<script>
	import CallDirection from './CallDirection.svelte';
	import CallField from './CallField.svelte';
	import FaSave from 'svelte-icons/fa/FaSave.svelte';
	import GoTrashcan from 'svelte-icons/go/GoTrashcan.svelte';

	export let id;
	export let created;
	/**@type{string}*/
	export let fName;
	/**@type{string}*/
	export let lName;
	/**@type{string}*/
	export let phone;
	/**@type{string}*/
	export let rfc;
	/**@type{string}*/
	export let notes;
	export let callDirect = false;

	const date = new Date(created);
	const formattedDate = date.toLocaleDateString('en-US');
	let hour = date.getHours() % 12;
	hour = hour ? hour : 12;
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const ampm = date.getHours() < 12 ? 'AM' : 'PM';

	created = `${formattedDate} ${hour}:${minutes} ${ampm}`;

	const updateCall = () => {
		try {
			fetch('/api/Calls/Update', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id,
					fName,
					lName,
					phone,
					rfc,
					notes,
					callDirect
				})
			})
				.then((r) => r.json)
				.then((res) => console.log(res));
		} catch (err) {
			//@ts-ignore
			console.log(err.text);
		}
	};

	const deleteCall = () => {
		try {
			fetch('/api/Calls/Delete', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					id
				})
			})
				.then((r) => r.json)
				.then((res) => console.log(res));
		} catch (err) {
			//@ts-ignore
			console.log(err.text);
		}
	};
</script>

<tr class="mb-2 ml-10 mr-10 flex justify-between">
	<CallField field={created ?? ''} fieldType="input" />
	<div class="flex w-20 justify-center">
		<CallDirection bind:callD={callDirect} />
	</div>
	<CallField bind:field={fName} fieldType="input" />
	<CallField bind:field={lName} fieldType="input" />
	<CallField bind:field={phone} fieldType="input" />
	<CallField bind:field={rfc} fieldType="input" />
	<CallField bind:field={notes} fieldType="textarea" />
	<div class="flex justify-center">
		<button
			on:click={updateCall}
			class="mb-auto mt-auto h-8 rounded-md border bg-main pl-2 pr-2 text-white hover:bg-main/75 active:scale-95"
			><div class="h-4"><FaSave /></div></button
		>
		<button
			on:click={() => deleteCall()}
			class="mb-auto mt-auto h-8 rounded-md border bg-red-800 pl-2 pr-2 text-white hover:bg-red-800/75 active:scale-95"
		>
			<div class="h-4">
				<GoTrashcan />
			</div>
		</button>
	</div>
</tr>
