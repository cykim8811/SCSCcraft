
class BlockRenderer{
    constructor(){
        let textureLoader = new THREE.TextureLoader();
        let grass_top = textureLoader.load("texture/grass_top.png");
        grass_top.magFilter = THREE.NearestFilter;
        grass_top.minFilter = THREE.LinearMipMapLinearFilter;
        let grass_bottom = THREE.ImageUtils.loadTexture("texture/grass_bottom.png");
        //grass_bottom.magFilter = THREE.NearestFilter;
        //grass_bottom.minFilter = THREE.LinearMipMapLinearFilter;
        let grass_side = textureLoader.load("texture/grass_side.png");
        grass_side.magFilter = THREE.NearestFilter;
        grass_side.minFilter = THREE.LinearMipMapLinearFilter;
        let rect_geometry = new THREE.PlaneGeometry(1, 1);
        this.grass_top_mat = new THREE.MeshPhongMaterial({ color: 0xffffff, map: grass_top });
        this.grass_side_mat = new THREE.MeshPhongMaterial({ color: 0xffffff, map: grass_side });
        this.grass_bottom_mat = new THREE.MeshPhongMaterial({ color: 0xffffff, map: grass_bottom});
        
        this.rect_plane = new THREE.Mesh(rect_geometry, this.grass_bottom_mat);
        this.rect_plane.rotation.y = 3;
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

}

class Renderer{
    constructor(engine){
        this.scene = new THREE.Scene();
        this.wgrenderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

        this.blockRenderer = new BlockRenderer();
        this.scene.add(this.blockRenderer.rect_plane);

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
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(0, 0, 0);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
         
        this.scene.add(dirLight);
        this.scene.add(dirLight.target);
        
        this.engine = engine;

        this.render();
    }

    render(){
        requestAnimationFrame(()=>this.render);
        this.wgrenderer.render(this.scene, this.camera);
    }

    render_blocks(){
        
    }

    render_entities(){

    }
}
