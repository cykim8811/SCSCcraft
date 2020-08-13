
// #include "MapManager.js";

var engine = new class{
    constructor(){
        this.map = mapManager;
        this.running = false;
        this.fps = 30;
    }

    run(){
        if (this.running) return false;
        this.running = true;
        this.tick(0);
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
