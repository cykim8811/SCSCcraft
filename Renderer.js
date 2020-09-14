
const textureLoader = new THREE.TextureLoader();

function loadTexture(path){
    return new Promise(function(resolve, reject){
        textureLoader.load(path, function(txt){
            // pixelated texture effect
            txt.magFilter = THREE.NearestFilter;
            txt.minFilter = THREE.LinearMipMapLinearFilter;
            resolve(txt);
        });
        setTimeout(reject, 500);
    });
}


class BlockRenderer{
    constructor(){
    }
    async init(onend){
        let grass_top = new THREE.TextureLoader().load("texture/grass_top.png");
        let rect_geometry = new THREE.PlaneGeometry(1, 1);
        this.grass_top_mat = new THREE.MeshPhongMaterial({ color: 0xffffff, map: grass_top });
        
        this.rect_plane = new THREE.Mesh(rect_geometry, this.grass_top_mat);

        this.rect_plane.rotation.y = 3;
        onend();
    }
    /*
            side    x   y   z
            0       0   +   0
            1       +   0   0
            2       0   0   +
            3       -   0   0
            4       0   0   -
            5       0   -   0
     */
}

class ChunkRenderer{
    constructor(map, chunk){
        this.map = map;
        this.scene = map.scene;
        this.chunk = chunk;
        this.pos_in_world = chunk.pos_in_world;
        this.chunk_size = chunk.chunk_size;
        this.meshes = [];
    }

    erase_chunk(){
        for (let m of this.meshes){
            this.scene.remove(m);
        }
        this.meshes = [];
    }

    draw_chunk(){
        for (let x = 0; x < this.chunk.chunk_size.width; x++){
            for (let z = 0; z < this.chunk.chunk_size.width; z++){
                for (let y = 0; y < this.chunk.chunk_size.height; y++){
                    this._draw_block(x, y, z);
                }
            }
        }
    }

    _draw_block(x, y, z){
        if (this.chunk.get_relative(x, y, z).id == 0) return;
        function getId(x){if (x) return x.id;}
        if (y >= (this.chunk_size.height - 1) || this.chunk.get_relative(x, y + 1, z).id == 0){
            let newMesh = this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y + 0.5, this.pos_in_world.z * this.chunk_size.width + z);
            newMesh.rotation.x = -Math.PI * 0.5;
        }
        if (y > 0 && this.chunk.get_relative(x, y - 1, z).id == 0){
            let newMesh = this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y - 0.5, this.pos_in_world.z * this.chunk_size.width + z);
            newMesh.rotation.x = Math.PI * 0.5;
        }
        if (getId(this.chunk.get_relative(x, y, z + 1)) == 0){
            let newMesh = this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y, this.pos_in_world.z * this.chunk_size.width + z + 0.5);
            newMesh.rotation.y = 0;
        }
        if (getId(this.chunk.get_relative(x - 1, y, z)) == 0){
            let newMesh = this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x - 0.5, y, this.pos_in_world.z * this.chunk_size.width + z);
            newMesh.rotation.y = -Math.PI * 0.5;
        }
        if (getId(this.chunk.get_relative(x, y, z - 1)) == 0){
            let newMesh = this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y, this.pos_in_world.z * this.chunk_size.width + z - 0.5);
            newMesh.rotation.y = -Math.PI * 1;
        }
        if (getId(this.chunk.get_relative(x + 1, y, z)) == 0){
            let newMesh = this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x + 0.5, y, this.pos_in_world.z * this.chunk_size.width + z);
            newMesh.rotation.y = -Math.PI * 1.5;
        }
    }

    _new_mesh(x, y, z){
        let mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshPhongMaterial({color: 0xffffff}));
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.meshes.push(mesh);
        this.scene.add(mesh);
        return mesh;
    }
}

class Renderer{
    constructor(engine){
        this.scene = new THREE.Scene();
        this.wgrenderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); // dev: alpha: false
        this.render_chunks = [];

        var t = this;
        this.blockRenderer = new BlockRenderer();
        this.blockRenderer.init(function(){
            t.scene.add(t.blockRenderer.rect_plane);
        });

        // Add Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.camera.rotation.order = "YXZ";
        this.camera.position.y = 0;
        this.camera.position.z = -2;
        this.camera.position.x = -2;
        this.camera.rotation.y = 4;

        // Add Shadow
        this.wgrenderer.shadowMap.enabled = true;
        this.wgrenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.wgrenderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.wgrenderer.domElement);
        this.wgrenderer.setClearColor(0x000000, 1);

        let amblight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(amblight);
        
        // Add Light
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(0, 80, 0);
        dirLight.target.position.set(0, 60, 5);
        dirLight.castShadow = true;/*
        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;*/
         
        this.scene.add(dirLight);
        this.scene.add(dirLight.target);
        
        this.engine = engine;

        this.render();
    }

    get_render_chunk(chunk){
        return this.render_chunks.find(x=>(x.chunk == chunk));
    }

    add_render_chunk(chunk){
        if (this.get_render_chunk(chunk)) return;
        let newcr = new ChunkRenderer(this, chunk);
        this.render_chunks.push(newcr);
        newcr.draw_chunk();
    }

    remove_render_chunk(chunk){
        let target = this.render_chunks.findIndex(x=>(x.chunk == chunk));
        if (target == -1) return;
        this.render_chunks[target].erase_chunk();
        this.render_chunks.splice(target, 1);
    }
    
    reset_render_chunk(){
        for (let target of this.render_chunks){
            target.erase_chunk();
        }
        this.render_chunks = [];
    }

    render(){
        var t = this;

        this.wgrenderer.render(this.scene, this.camera);
        requestAnimationFrame(function(){
            t.render();
        });
    }

    render_entities(){

    }
}
