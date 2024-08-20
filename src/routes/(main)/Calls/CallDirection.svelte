<script>
	import MdCall from 'svelte-icons/md/MdCall.svelte';
	import MdCallMade from 'svelte-icons/md/MdCallMade.svelte';
	import MdCallReceived from 'svelte-icons/md/MdCallReceived.svelte';

	export let callD = false;
</script>

<div class="mb-auto mt-auto flex h-6">
	<div>
		<MdCall />
	</div>
	<li hidden>
		<label for="call_direction" />
		<input
			name="call_direction"
			type="toggle"
			value={callD}
			class="rounded-md border text-center"
		/>
	</li>
	<button type="button" on:click={() => (callD = !callD)} class=" relative -left-4 h-4">
		{#if callD}
			<MdCallMade />
		{:else}
			<MdCallReceived />
		{/if}
	</button>
</div>
