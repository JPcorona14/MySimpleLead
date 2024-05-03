<script lang="ts">
	interface Activity {
		id: number;
		created_at: string | null;
		type: string | null;
		active: Boolean | null;
		edit: Boolean | null;
		text: string | null;
	}
	export let currentActivity: Activity;
	export let index: number;

	const editActivity = async (event: Event) => {
		event?.preventDefault();
		const formData = new FormData(event?.target);
		const data = Object.fromEntries(formData.entries());

		if (currentActivity.text !== data.text) {
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
					});
			} catch (err) {
				console.log(err);
			}
		} else {
			console.log('nothing to do');
		}

		currentActivity.edit = false;
	};
</script>

<li
	on:mouseenter={() => (currentActivity.type !== 'Event' ? (currentActivity.active = true) : '')}
	on:mouseleave={() => (currentActivity.type !== 'Event' ? (currentActivity.active = false) : '')}
	id={currentActivity.id.toString()}
	class="mb-4 ml-4 mr-4 rounded-lg bg-white p-4 shadow-md shadow-gray-500"
>
	{#if !currentActivity.edit}
		<div class="flex justify-between">
			<div class="font-bold">{currentActivity.type}:</div>
			<div class=" italic">{currentActivity.created_at}</div>
		</div>

		<p class=" whitespace-pre-line">{currentActivity.text}</p>
	{:else}
		<form on:submit|preventDefault={editActivity} class="flex flex-col justify-center">
			<label for="i" hidden />
			<input name="i" value={index} hidden />
			<label for="activity_id" hidden />
			<input name="activity_id" value={currentActivity.id} hidden />
			<div class="w-full text-center font-bold">{currentActivity.created_at}</div>
			<label for="type" hidden />
			<select name="type" class="ml-auto mr-auto">
				<option
					value="Call"
					selected={currentActivity.type === 'Call' ? true : false}
					class="font-bold">Call</option
				>
				<option
					value="Document"
					selected={currentActivity.type === 'Document' ? true : false}
					class="font-bold">Document</option
				>
				<option
					value="Email"
					selected={currentActivity.type === 'Email' ? true : false}
					class="font-bold">Email</option
				>
				<option
					value="Note"
					selected={currentActivity.type === 'Note' ? true : false}
					class="font-bold">Notes</option
				>
			</select>

			<textarea
				name="text"
				placeholder="Type here..."
				class="min-h-24 w-full rounded-md border p-1"
				value={currentActivity.text}
			/>
			<button
				type="submit"
				class="mb-2 mt-2 w-full rounded-md bg-good pb-1 pt-1 text-white shadow-md shadow-gray-500 active:scale-95"
				>Save</button
			>
		</form>
	{/if}
	{#if currentActivity.active || currentActivity.edit}
		<div class="mb-1 mt-2 flex justify-around">
			<form method="POST" action="?/editActivity" class="w-2/5">
				<label for="id" hidden />
				<input name="id" value={a.id} hidden />
				{#if currentActivity.edit}
					<button
						type="button"
						on:click={() => {
							currentActivity.edit = false;
							currentActivity.type = currentActivity.type;
							currentActivity.text = currentActivity.text;
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
				<input name="id" value={currentActivity.id} hidden />
				<button
					class="h-full w-full rounded-md bg-bad pb-1 pt-1 text-white shadow-md shadow-gray-500"
					>Delete</button
				>
			</form>
		</div>
	{/if}
</li>
