<script>
	/** @type{string}*/
	export let field;
	export let fieldType;
</script>

<td class="flex justify-center"
	><div
		class="no-scrollbar mb-auto mt-auto flex h-fit min-h-8 w-36 justify-center overflow-scroll rounded-md border text-center"
	>
		{#if fieldType === 'input'}
			<input type="text" class="mb-auto mt-auto text-center" value={field ?? ''} />
		{:else if fieldType === 'textarea'}
			<textarea
				class="mb-auto mt-auto text-center"
				value={field ?? ''}
				on:change={(e) => (field = e.target.value)}
			/>
		{/if}
	</div></td
>
