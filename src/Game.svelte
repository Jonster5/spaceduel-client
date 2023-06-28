<script lang="ts">
	import { onMount } from 'svelte';
	import { createGame } from './lib/game';
	import { CanvasSettings } from './lib/ecs/plugins/graphics';
	import type { EventWriter } from './lib/ecs/engine';
	import { RemovePlayerEvent, SpawnPlayerEvent } from './lib/player';
	import { writable, type Writable } from 'svelte/store';
	import { UIData } from './lib/ui';

	let target: HTMLElement;

	let spawnPlayerEvent: EventWriter<SpawnPlayerEvent>;
	let removePlayerEvent: EventWriter<RemovePlayerEvent>;

	const game = createGame();

	const fps = writable(0);
	const ecount = writable(0);
	const view: Writable<'loading' | 'normal'> = writable('loading');

	onMount(() => {
		game.insertResource(
			new CanvasSettings({
				target,
				width: 3000,
				extraStyling: 'border-radius: 50%;',
			})
		)
			.insertResource(new UIData(view, fps, ecount))
			.run();

		spawnPlayerEvent = game.getEventWriter(SpawnPlayerEvent);
		removePlayerEvent = game.getEventWriter(RemovePlayerEvent);
	});
</script>

<div
	bind:this={target}
	class="target"
	style={`display: ${$view === 'normal'}`}
	on:click={() => spawnPlayerEvent.send()}
	on:keydown={() => {
		removePlayerEvent.send();
	}}
/>

<div>{$fps}</div>
<div>{$ecount}</div>

<style lang="scss">
	.target {
		height: 90vh;
		aspect-ratio: 1;

		z-index: -10;
		background: black;
		border-radius: 50%;
	}
</style>
