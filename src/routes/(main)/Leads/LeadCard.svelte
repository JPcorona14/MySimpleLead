<script>
	import { goto } from '$app/navigation';

	/** @type {string}*/
	export let fName;
	/** @type {string}*/
	export let quote;
	/** @type {string}*/
	export let charges = '';
	/** @type {string}*/
	export let leadID = '';

	/** @type {any} */
	export let todoDragging;

	/**
	 *
	 * @param {DragEvent} event
	 */
	const dragHandler = (event) => {
		if (todoDragging) {
			todoDragging(event);
		}
	};
</script>

<button
	id={leadID}
	draggable="true"
	on:drag={todoDragging}
	class="ml-auto mr-auto mt-2 w-5/6 rounded-lg border bg-white text-lg shadow-md shadow-gray-500"
	on:click={() => goto(`./Leads/${leadID}`)}
>
	<ul class="flex h-full flex-col justify-between overflow-hidden p-4 pb-2 text-sm">
		<li class="flex h-1/3 flex-wrap justify-between">
			<div class="font-bold text-black">{fName}</div>
			<div class=" text-green-600">{quote ? `$${quote}` : '-'}</div>
		</li>
		<li class="text-wrap pt-2 text-start font-normal text-black">
			{charges}
		</li>
	</ul>
</button>
