
async function loadComputer(target){
    let textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load("texture/computer.png");
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    let materials = [];
    materials.push(new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture }));
    let planemat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    materials.push(planemat);
    materials.push(planemat);
    materials.push(planemat);
    materials.push(planemat);
    materials.push(planemat);
    let geo = new THREE.BoxGeometry(0.8, 0.8, 0.8, 1, 1, 1);
    let object = new THREE.Mesh(geo, materials);
    object.castShadow = true;
    object.receiveShadow = true;
    return object;
}

class ComputerEntity{
    constructor(computerId, pos, rot){
        this.entityType = "Computer";
        gameWorld.entities.push(this);
        this.object = null;
        this.computerId = computerId;
        this.init(pos, rot);
    }
    async init(pos, rot){
        this.object = await loadComputer();
        renderer.scene.add(this.object);
        this.object.position.set(pos.x, pos.y, pos.z);
        this.object.rotation.y = rot;
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
