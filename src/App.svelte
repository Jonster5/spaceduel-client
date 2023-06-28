<script lang="ts">
	import Game from './Game.svelte';
</script>

<main>
	<div class="game">
		<Game />
	</div>
</main>

<style lang="scss">
	main {
		display: flex;

		width: 100vw;
		height: 100vh;

		justify-content: center;
		align-items: center;
	}
</style>
