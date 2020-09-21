
async function loadCharacter(target){
    let mtlloader = new THREE.MTLLoader();
    mtlloader.setResourcePath("./models/");
    mtlloader.setPath("./models/")
    let material = await new Promise(function(res, rej){mtlloader.load(target + ".mtl", res);});
    material.preload();
    let objloader = new THREE.OBJLoader();
    objloader.setMaterials(material);
    objloader.setPath("./models/");
    let object = await new Promise(function(res, rej){objloader.load(target + ".obj", res);});
    object.children[0].geometry.center();
    object.children[0].position.y = -0.45;
    return object;
}

class PlayerEntity{
    constructor(){
        this.velocity = {x: 0, y: 0, z: 0};
        gameWorld.entities.push(this);
        this.object = null;
        this.name = "";
        this.init();
    }
    async init(){
        this.object = await loadCharacter("char");
        this.object.scale.set(1.2, 1.2, 1.2);
        renderer.scene.add(this.object);
    }
    tick(dT){

    }
    remove(){
        let ind = gameWorld.entities.findIndex(x=>(x==this));
        if (ind != -1){
            gameWorld.entities.splice(ind, 1);
        }
        renderer.scene.remove(this.object);
    }
}
