
// #include "MapManager.js";
// #include "PhysicsEngine.js"

class Engine{
    constructor(world){
        this.setting = {
            fps: 100,
            running: false
        };
        this.world = world;
        this.subengines = [];
    }

    run(){
        if (this.setting.running) return false;
        this.setting.running = true;
        this.tick();
    }

    // Automatically calls itself while this.running == true
    tick(){
        for (let e of this.world.entities){
            if (!e.prevTime){
                e.prevTime = Date.now();
            }
            e.tick(Date.now() - e.prevTime, this);
            e.prevTime = Date.now();
        }
        for (let subengine of this.subengines){
            if (!subengine.prevTime){
                subengine.prevTime = Date.now();
            }
            subengine.tick(Date.now() - subengine.prevTime, this);
            subengine.prevTime = Date.now();
        }
        // Calling this function again
        setTimeout(function(self){
            if (self.setting.running){
                self.tick(1000 / self.setting.fps);
            }
        }, 1000 / this.setting.fps, this);
    }
};
