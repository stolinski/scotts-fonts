<script lang="ts">
	let fonts: { name: string; size: number }[] = $state([]);
	let code = $state('');
	let text_area: HTMLTextAreaElement;

	async function loadFonts() {
		const response = await fetch('/fonts/list');
		const fonts_res = await response.json();
		for (const [name, size] of Object.entries(fonts_res)) {
			fonts.push({ name, size });
		}
	}

	async function loadWhitelist() {
		const response = await fetch('/whitelist');
		const whitelist = await response.json();
		text_area.value = whitelist.join('\\n');
	}

	async function updateWhitelist() {
		const whitelist = text_area.value.split('\\n');
		try {
			const res = await fetch('/whitelist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ domains: whitelist, code })
			});
			if (res.status === 200) {
				alert('Whitelist updated');
			} else {
				console.error('Failed to update whitelist', res.status);
			}
		} catch (e) {
			console.error('Failed to update whitelist', e);
		}
	}

	$effect(() => {
		loadWhitelist();
		loadFonts();
	});
</script>

<h1>Manage Whitelist</h1>
<div>
	<input type="text" placeholder="Access Code" bind:value={code} />
</div>
<textarea bind:this={text_area} id="whitelist" rows="10" cols="50"></textarea><br />
<button onclick={updateWhitelist}>Update Whitelist</button>
<h2>Available Fonts</h2>
<ul id="font-list">
	{#each fonts as font}
		<li>{font.name} ({font.size})</li>
	{/each}
</ul>
