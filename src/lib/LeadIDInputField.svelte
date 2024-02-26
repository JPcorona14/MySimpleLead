<script>
	import toast from 'svelte-french-toast';
	import FaRegCopy from 'svelte-icons/fa/FaRegCopy.svelte';

	/**@type {boolean}*/
	export let copyField = false;
	/**@type {number}*/
	export let fieldID;
	/**@type {string}*/
	export let fieldName;
	/**@type {string}*/
	export let order = '';
	/**@type {string}*/
	export let displayName;
	/**@type {string | null}*/
	export let currentValue;
	/**@type {"contact" | "lead"}*/
	export let fieldType;

	/**
	 *
	 * @param fieldValue {string}
	 */
	const updateCustomerField = async (fieldValue) => {
		const value = fieldValue === '' ? null : fieldValue;
		if (currentValue !== value) {
			try {
				fetch(
					fieldType === 'contact'
						? '/api/Leads/UpdateCustomerField'
						: fieldType === 'lead'
							? '/api/Leads/UpdateLeadField'
							: '',
					{
						method: 'POST',
						headers: {
							'content-type': 'application/json'
						},
						body: JSON.stringify({
							id: fieldID,
							fieldName,
							value
						})
					}
				)
					.then((r) => r.json())
					.then((res) => {
						console.log(res.message);
						currentValue = res.data[fieldName];
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
</script>

<li class={`mb-4 mt-2 flex w-full flex-col justify-start md:mb-2 md:w-1/2 md:flex-row ${order}`}>
	<label class="mb-1 text-2xl font-bold md:mb-0 md:w-2/5 md:text-xl" for={fieldName}
		>{displayName}:</label
	>
	{#if copyField}
		<div class="flex w-full md:w-1/2">
			<input
				name={fieldName}
				type="text"
				value={currentValue}
				class="w-full rounded-l-lg border pb-1 pl-2 pr-2 pt-1 text-end shadow-sm shadow-gray-300 md:w-3/4 md:text-start"
				placeholder="-"
				on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
				on:blur={(e) => updateCustomerField(e.target?.value)}
			/>
			<button
				type="button"
				on:click={() => {
					navigator.clipboard.writeText(currentValue);
					toast.success('Clipboard: ' + currentValue);
				}}
				class="w-1/4 rounded-r-lg bg-secondary text-white shadow-sm shadow-gray-300 hover:bg-secondary/75 active:scale-95"
				><div class="h-6"><FaRegCopy /></div></button
			>
		</div>
	{:else}
		<input
			name="occupation"
			type="text"
			value={currentValue}
			placeholder="-"
			class="w-full rounded-lg border pb-1 pl-2 pr-2 pt-1 text-end shadow-sm shadow-gray-300 md:w-1/2 md:text-start"
			on:keydown={(e) => (e.keyCode === 13 ? e.target?.blur() : '')}
			on:blur={(e) => updateCustomerField(e.target?.value)}
		/>
	{/if}
</li>
