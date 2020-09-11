
window.addEventListener("resize", resizeCanvas, false);
function resizeCanvas() {
    let canvas = renderer.wgrenderer.domElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.wgrenderer.setSize(window.innerWidth, window.innerHeight);
    renderer.camera.updateProjectionMatrix();
}

const craftEngine = new Engine();
const renderer = new Renderer(window, document, craftEngine);
