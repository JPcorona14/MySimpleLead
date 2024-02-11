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
	class="bg-white text-lg border rounded-lg w-5/6 ml-auto mr-auto mt-2 shadow-gray-500 shadow-md"
	on:click={() => goto(`./Leads/${leadID}`)}
>
	<ul class="flex justify-between flex-col h-full p-4 pb-2 overflow-hidden">
		<li class="flex flex-wrap justify-between h-1/3">
			<div class="text-black font-bold">{fName}</div>
			<div class=" text-green-600">{quote ? `$${quote}` : '-'}</div>
		</li>
		<li class="text-black font-normal pt-2 text-start text-wrap">
			{charges}
		</li>
	</ul>
</button>
