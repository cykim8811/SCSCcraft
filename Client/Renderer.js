
class TextureManager{
    constructor(){
        this.textureLoader = new THREE.TextureLoader();
        this.resources = [];
        const resourceCount = 8;
        for (let i=0; i<resourceCount; i++){
            let texture = this.textureLoader.load("texture/" + i + ".png");
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            this.resources.push(new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture }));
        }
        this.block = [];
        this.block.push([-1, -1, -1, -1, -1, -1]);
        this.block.push([0, 0, 0, 0, 0, 0]);
        this.block.push([1, 1, 1, 1, 1, 1]);
        this.block.push([2, 2, 2, 2, 2, 2]);
        this.block.push([3, 3, 3, 3, 3, 3]);
        this.block.push([4, 4, 4, 4, 4, 4]);
        this.block.push([5, 5, 5, 5, 5, 5]);
        this.block.push([6, 6, 6, 6, 6, 6]);
        this.block.push([7, 7, 7, 7, 7, 7]);

        this.rect_plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.resources[1][0]);
    }

    get_material(id, side){
        if (id <= 0 || id >= this.block.length){
            console.error("Invalid Block Id", id);
        }
        return this.resources[this.block[id][side]];
    }
}

class ChunkRenderer{
    constructor(renderer, chunk){
        this.renderer = renderer;
        this.scene = renderer.scene;
        this.chunk = chunk;
        this.pos_in_world = chunk.pos_in_world;
        this.chunk_size = chunk.chunk_size;
        this.meshes = [];

        this.merges = [];
        this.display = false;
    }

    erase_chunk(){
        for (let m of this.meshes){
            this.scene.remove(m);
        }
        this.meshes = [];
        this.display = false;
    }

    draw_chunk(){
        this.display = true;
        this._draw_chunk();
    }

    async _draw_chunk(){
        this.erase_chunk();
        this.merges = [];
        for (let x = 0; x < this.chunk.chunk_size.width; x++){
            for (let z = 0; z < this.chunk.chunk_size.width; z++){
                for (let y = 0; y < this.chunk.chunk_size.height; y++){
                    this._draw_block(x, y, z);
                }
            }
        }
        for (let merge of this.merges){
            var newMesh = new THREE.Mesh(merge.obj, merge.material);
            this.meshes.push(newMesh);
            newMesh.castShadow = true;
            newMesh.receiveShadow = true;
            this.scene.add(newMesh);
        }
    }

    enable(){
        this.display = true;
        for (let m of this.meshes){
            m.visible = true;
        }
    }

    disable(){
        this.display = false;
        this.display = true;
        for (let m of this.meshes){
            m.visible = false;
        }
    }

    _draw_block(x, y, z){
        let target = (this.chunk.get_relative(x, y, z));
        if (target == 0) return;
        if (y >= (this.chunk_size.height - 1) || (this.chunk.get_relative(x, y + 1, z) == 0)){
            this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y + 0.5, this.pos_in_world.z * this.chunk_size.width + z, -Math.PI * 0.5, 0, 0, target, 0);
        }
        if (y > 0 && (this.chunk.get_relative(x, y - 1, z) == 0)){
            this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y - 0.5, this.pos_in_world.z * this.chunk_size.width + z, Math.PI * 0.5, 0, 0, target, 5);
        }
        if ((this.chunk.get_relative(x, y, z + 1) == 0)){
            this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y, this.pos_in_world.z * this.chunk_size.width + z + 0.5, 0, 0, 0, target, 2);
        }
        if ((this.chunk.get_relative(x - 1, y, z) == 0)){
            this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x - 0.5, y, this.pos_in_world.z * this.chunk_size.width + z, 0, -Math.PI * 0.5, 0, target, 3);
        }
        if ((this.chunk.get_relative(x, y, z - 1) == 0)){
            this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x, y, this.pos_in_world.z * this.chunk_size.width + z - 0.5, 0, -Math.PI * 1, 0, target, 4);
        }
        if ((this.chunk.get_relative(x + 1, y, z) == 0)){
            this._new_mesh(this.pos_in_world.x * this.chunk_size.width + x + 0.5, y, this.pos_in_world.z * this.chunk_size.width + z, 0, -Math.PI * 1.5, 0, target, 1);
        }
    }

    _new_mesh(x, y, z, rx, ry, rz, block, side){
        let mat = this.renderer.textureManager.get_material(block, side);
        let mesh = this.renderer.textureManager.rect_plane;
        mesh.position.set(x, y, z);
        mesh.rotation.x = rx;
        mesh.rotation.y = ry;
        mesh.rotation.z = rz;
        let mergeMesh = this._find_merge_mesh(mat);
        mesh.updateMatrix();
        mergeMesh.obj.merge(mesh.geometry, mesh.matrix);
    }

    _find_merge_mesh(material){
        for (let m of this.merges){
            if (m.material == material){
                return m;
            }
        }
        let newMerge = {obj: new THREE.Geometry(), material: material};
        this.merges.push(newMerge);
        return newMerge;
    }
}

class Renderer{
    constructor(engine){
        let self = this;
        window.addEventListener("resize",
        function resizeCanvas() {
            let canvas = self.wgrenderer.domElement;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            self.guiCanvas.width = window.innerWidth;
            self.guiCanvas.height = window.innerHeight;
            self.camera.aspect = window.innerWidth / window.innerHeight;
            self.wgrenderer.setSize(window.innerWidth, window.innerHeight);
            self.camera.updateProjectionMatrix();
        }, false);
        this.scene = new THREE.Scene();
        this.wgrenderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); // dev: alpha: false
        this.render_chunks = [];

        var t = this;
        this.textureManager = new TextureManager();

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
        this.wgrenderer.domElement.style.position = "absolute";
        document.body.appendChild(this.wgrenderer.domElement);
        this.wgrenderer.setClearColor(0xd2e4f5, 1);

        // Add gui canvas
        this.guiCanvas = document.createElement("canvas");
        this.guiCanvas.width = this.wgrenderer.domElement.width;
        this.guiCanvas.height = this.wgrenderer.domElement.height;
        this.guiCanvas.style.position = "absolute";
        //this.guiCanvas.style.pointerEvents = "none";
        document.body.appendChild(this.guiCanvas);
        this.guiCtx = this.guiCanvas.getContext("2d");
        this.guiCtx.clearRect(0, 0, this.guiCanvas.width, this.guiCanvas.height);

        this.raycaster = new THREE.Raycaster();
        let de = this.guiCanvas;
        this.guiCanvas.addEventListener('click', function(evt){
            if (document.pointerLockElement != null){
                self.raycaster.setFromCamera({x:0, y:0}, self.camera);
                let intersects = self.raycaster.intersectObjects(self.scene.children);
                if (intersects.length != 0 && intersects[0].distance < 5){
                    let p = intersects[0].point;
                    let dx = Math.abs(Math.round(p.x - 0.5) - (p.x - 0.5));
                    let dy = Math.abs(Math.round(p.y - 0.5) - (p.y - 0.5));
                    let dz = Math.abs(Math.round(p.z - 0.5) - (p.z - 0.5));
                    let tbl = {x: 0, y: 0, z: 0};
                    let obl = {x: 0, y: 0, z: 0};
                    if (dx < dy && dx < dz){
                        tbl.x = Math.round(p.x + (self.camera.position.x - p.x < 0?1:-1) * 0.5);
                        tbl.y = Math.round(p.y);
                        tbl.z = Math.round(p.z);
                        obl.x = Math.round(p.x - (self.camera.position.x - p.x < 0?1:-1) * 0.5);
                        obl.y = Math.round(p.y);
                        obl.z = Math.round(p.z);
                    }
                    if (dy < dx && dy < dz){
                        tbl.x = Math.round(p.x);
                        tbl.y = Math.round(p.y + (self.camera.position.y - p.y < 0?1:-1) * 0.5);
                        tbl.z = Math.round(p.z);
                        obl.x = Math.round(p.x);
                        obl.y = Math.round(p.y - (self.camera.position.y - p.y < 0?1:-1) * 0.5);
                        obl.z = Math.round(p.z);
                    }
                    if (dz < dx && dz < dy){
                        tbl.x = Math.round(p.x);
                        tbl.y = Math.round(p.y);
                        tbl.z = Math.round(p.z + (self.camera.position.z - p.z < 0?1:-1) * 0.5);
                        obl.x = Math.round(p.x);
                        obl.y = Math.round(p.y);
                        obl.z = Math.round(p.z - (self.camera.position.z - p.z < 0?1:-1) * 0.5);
                    }
                    block_click(tbl, obl, evt, intersects[0]);
                }
            }else{
                de.requestPointerLock();
            }
        }, false);

        // Add Light
        let amblight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(amblight);
        
        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.dirLight.position.set(0, 80, 0);
        this.dirLight.target.position.set(5, 70, 15);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;
        this.dirLight.shadow.camera.left = -70;
        this.dirLight.shadow.camera.right = 70;
        this.dirLight.shadow.camera.top = 70;
        this.dirLight.shadow.camera.bottom = -70;
         
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);
        
        this.engine = engine;

        this.render();
    }

    get_render_chunk(chunk){
        return this.render_chunks.find(x=>(x.chunk == chunk));
    }

    get_render_chunk_pos(x, z){
        return this.render_chunks.find(t=>(t.pos_in_world.x == x && t.pos_in_world.z == z));
    }

    async add_render_chunk(chunkPromise){
        let chunk = await chunkPromise;
        if (this.get_render_chunk(chunk)) return null;
        let newcr = new ChunkRenderer(this, chunk);
        for (let target of this.render_chunks){
            if ((Math.abs(newcr.pos_in_world.x - target.pos_in_world.x) + Math.abs(newcr.pos_in_world.z - target.pos_in_world.z)) == 1){
                target.draw_chunk();
            }
        }
        this.render_chunks.push(newcr);
        newcr.draw_chunk();
        return newcr;
    }

    update_chunks(){
        for (let target of this.render_chunks){
            target.draw_chunk();
        }
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
        this.dirLight.position.set(this.camera.position.x - 15, this.camera.position.y + 50, this.camera.position.z - 30);
        this.dirLight.target.position.set(this.camera.position.x, this.camera.position.y + 30, this.camera.position.z);
        this.wgrenderer.render(this.scene, this.camera);

        const width = this.guiCanvas.width;
        const height = this.guiCanvas.height;
        this.guiCtx.clearRect(0, 0, width, height);
        this.guiCtx.clearRect(0, 0, this.guiCanvas.width, this.guiCanvas.height);
        this.guiCtx.strokeStyle = "#FFFFFF";
        this.guiCtx.lineWidth = 2;
        this.guiCtx.beginPath();
        this.guiCtx.moveTo(this.guiCanvas.width * 0.5, this.guiCanvas.height * 0.5 - 9);
        this.guiCtx.lineTo(this.guiCanvas.width * 0.5, this.guiCanvas.height * 0.5 + 9);
        this.guiCtx.moveTo(this.guiCanvas.width * 0.5 - 9, this.guiCanvas.height * 0.5);
        this.guiCtx.lineTo(this.guiCanvas.width * 0.5 + 9, this.guiCanvas.height * 0.5);
        this.guiCtx.stroke();

        // Draw Names
        this.guiCtx.fillStyle = "#555";
        this.guiCtx.textAlign = "center";
        for (let e of this.engine.world.entities){
            if (!e.name) continue;
            if (!e.object) continue;
            let v = new THREE.Vector3().copy(e.object.position);
            v.add(new THREE.Vector3(0, 0.7, 0));
            let proj = v.project(this.camera);
            if (proj.z > 1) continue;
            let nx = (proj.x + 1) * width * 0.5;
            let ny = (-proj.y + 1) * height * 0.5;
            this.guiCtx.font = (7000 * (1 - proj.z)) + "px Arial";
            this.guiCtx.fillText(e.name, nx, ny);
        }

        requestAnimationFrame(function(){
            t.render();
        });
    }

    render_entities(){

    }
}
