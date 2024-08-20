<script>
	export let name;
	export let holder;
</script>

<li>
	<label for={name} hidden />
	<input {name} type="text" placeholder={holder} class="w-36 rounded-md border text-center" />
</li>
