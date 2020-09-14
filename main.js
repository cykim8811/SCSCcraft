
const gameWorld = new World();
const gameEngine = new Engine(gameWorld);
const renderer = new Renderer(gameEngine);
const player = new PlayerEngine(gameEngine, renderer);



for (let x = -3; x < 3; x++){
    for (let z = -3; z < 3; z++){
        renderer.add_render_chunk(gameEngine.world.map.load_chunk(x, z));
    }
}

renderer.camera.position.y = 85;
renderer.camera.rotation.y = 0;
renderer.camera.rotation.x = -Math.PI * 0.2;

gameEngine.run();
