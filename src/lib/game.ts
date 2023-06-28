import { BackgroundPlugin } from './bg';
import { ECS } from './ecs/engine';
import { defaultPlugins } from './ecs/plugins';
import { KeysToTrack } from './ecs/plugins/input';
import { LaserPlugin } from './laser';
import { physicsPlugin as PhysicsPlugin } from './physics';
import { PlayerPlugin as PlayerPlugin } from './player';
import { shipPlugin as ShipPlugin } from './ship';
import { sunPlugin as SunPlugin } from './sun';
import { uiPlugin as UiPlugin } from './ui';

export function createGame() {
	return new ECS()
		.insertPlugins(...defaultPlugins)
		.insertResource(new KeysToTrack(['w', 'a', 's', 'd', ' ']))
		.insertPlugins(PlayerPlugin, BackgroundPlugin, SunPlugin, PhysicsPlugin, ShipPlugin, UiPlugin, LaserPlugin);
}
