
// #include "MapManager.js";
// #include "PhysicsEngine.js"

const engine = new class{
    constructor(){
        this.map = mapManager;
        this.running = false;
        this.fps = 30;
        this.physics = new PhysicsEngine();
    }

    run(){
        if (this.running) return false;
        this.running = true;
        this.tick(0);
    }

    getBlock(position){
        return this.map.get_block(position.x, position.y, position.z);
    }

    setBlock(position, block){
        return this.map.set_block(position.x, position.y, position.z, block);
    }

    // Automatically calls itself while this.running == true
    tick(dT){

        // Calling this function again
        setTimeout(function(self){
            if (self.running){
                self.tick(1000 / self.fps);
            }
        }, 1000 / this.fps, this);
    }
};
