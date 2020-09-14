
// #include "MapManager.js";
// #include "PhysicsEngine.js"

class Engine{
    constructor(world){
        this.setting = {
            fps: 100,
            running: false
        };
        this.world = world;
        this.physics_engine = new PhysicsEngine({g: 9.8});
        this.subengines = [];
    }

    run(){
        if (this.setting.running) return false;
        this.setting.running = true;
        this.tick(0);
    }

    getBlock(position){
        return this.world.map.get_block(position.x, position.y, position.z);
    }

    setBlock(position, block){
        return this.world.map.set_block(position.x, position.y, position.z, block);
    }

    // Automatically calls itself while this.running == true
    tick(dT){
        for (let e of this.world.entities){
            this.physics_engine.run_entity(this.map, e, dT);
        }
        for (let subengine of this.subengines){
            subengine.tick(dT);
        }
        // Calling this function again
        setTimeout(function(self){
            if (self.setting.running){
                self.tick(1000 / self.setting.fps);
            }
        }, 1000 / this.setting.fps, this);
    }
};
