
class Renderer{
    constructor(_window, _document){
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(_window.innerWidth, _window.innerHeight);
        _document.body.appendChild(this.renderer.domElement);
        //_document.addEventListener('keydown', ~~);
        this.renderer.setClearColor(0x000000, 1);
    }
}
