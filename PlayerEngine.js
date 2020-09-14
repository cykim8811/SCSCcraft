
class PlayerEngine{
    constructor(engine){
        this.engine = engine;
        this.tick();
    }

    tick(){
        var tt = this;
        requestAnimationFrame(()=>tt.tick());
    }
}