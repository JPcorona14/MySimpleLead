<script>
	/**@typedef {Object} RelationshipOptions
	 * @property {string} name
	 * @property {boolean | null | string} value
	 */

	/**@type {"contact" | "lead"}*/
	export let fieldType;
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
	/**@type {RelationshipOptions[]}*/
	export let fieldOptions = [{ name: '', value: null }];

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
	<select
		name={fieldName}
		value={currentValue}
		class="w-full rounded-lg border pb-1 pl-2 pr-2 pt-1 text-end shadow-sm shadow-gray-300 md:w-1/2 md:text-start"
		on:change={(e) => updateCustomerField(e.target?.value)}
	>
		{#each fieldOptions as fieldOption}
			<option value={fieldOption.value} selected={fieldOption.value === currentValue ? true : false}
				>{fieldOption.name}</option
			>
		{/each}
	</select>
</li>
