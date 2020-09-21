
class World{
    constructor(){
        this.map = new MapManager();
        this.entities = new Array();
    }

    add_entity(e){
        this.entities.push(e);
    }

    remove_entity(e){
        let index = this.entities.findIndex(x=>(x==e));
        if (index != -1){
            this.entities.splice(index, 1);
        }
    }
}