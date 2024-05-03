<script>
	import LeadCard from './LeadCard.svelte';

	/**@type {string}*/
	export let title;
	/**@type {string}*/
	export let containerName;
	/**@type {string}*/
	export let currentValue;
	export let pickedID;
	export let leadList;
	export let displayList;
</script>

<ul
	class="no-scrollbar mb-5 ml-auto mr-auto flex w-[95%] flex-col justify-start overflow-scroll rounded-lg bg-secondary pb-10 pt-10 text-xl font-semibold shadow-md shadow-gray-500 md:mb-0 md:ml-0 md:mr-0 md:h-[95%] md:w-1/5"

	on:drop={(e) => assignedDrop(e, containerName)}
	on:dragover={dragOver}
>
	<div class="flex justify-evenly">
		<div class="w-1/5" />
		<h4 class="text-center text-3xl md:text-2xl">{title}</h4>
		<div class="mb-auto mt-auto w-1/5 text-end">{currentValue}</div>
	</div>
	<div class="flex h-full flex-col pb-2">
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
