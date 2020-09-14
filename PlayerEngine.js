
class PlayerEngine{
    constructor(engine, renderer){
        this.engine = engine;
        this.renderer = renderer;
        this.velocity = {x: 0, y: 0, z: 0};
        window.addEventListener('mousemove', function(event) {
            renderer.camera.rotation.y -= event.movementX / 200;
            renderer.camera.rotation.x = Math.min(1.57, (Math.max(-1.57, (renderer.camera.rotation.x - event.movementY / 200))));
        }, false);
        
        this.pressed =  new Array(1000).fill(0);
        let pressed = this.pressed;
        window.addEventListener('keydown', onKeyDown, false);
        function onKeyDown(e) {
            pressed[e.keyCode] = 1;
        }
        window.addEventListener('keyup', onKeyUp, false);
        function onKeyUp(e) {
            pressed[e.keyCode] = 0;
        }
        engine.subengines.push(this);
        this.playerSize = 0.6;

        this.renderDist = {
            draw: 4,
            store: 10
        }
    }

    tick(dT){
        const speed = 0.00015;
        const checkCollide = [
            {x: 0.5 * this.playerSize, y: 0.5, z: 0.5 * this.playerSize},
            {x: 0.5 * this.playerSize, y: 0.5, z: -0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: 0.5, z: 0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: 0.5, z: -0.5 * this.playerSize},
            {x: 0.5 * this.playerSize, y: -0.5, z: 0.5 * this.playerSize},
            {x: 0.5 * this.playerSize, y: -0.5, z: -0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: -0.5, z: 0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: -0.5, z: -0.5 * this.playerSize},
            {x: 0.5 * this.playerSize, y: -1.5, z: 0.5 * this.playerSize},
            {x: 0.5 * this.playerSize, y: -1.5, z: -0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: -1.5, z: 0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: -1.5, z: -0.5 * this.playerSize},
        ];
        // Player Movement
        if (this.pressed[87]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y) * speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y) * speed * dT;
        }
        if (this.pressed[68]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y + Math.PI * 1.5) * speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y + Math.PI * 1.5) * speed * dT;
        }
        if (this.pressed[65]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y + Math.PI * 0.5) * speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y + Math.PI * 0.5) * speed * dT;
        }
        if (this.pressed[83]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y + Math.PI * 1.0) * speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y + Math.PI * 1.0) * speed * dT;
        }
        // Player Vertical Movement
        const mode = 0;
        if (mode == 1){
            if (this.pressed[16]){
                this.velocity.y -= 1 * dT;
            }
            if (this.pressed[32]){
                this.velocity.y += 1 * dT;
            }
        }
        if (mode == 0){
            this.velocity.y -= 0.000055 * dT;
            let xmovable = true;
            let pos = this.renderer.camera.position;
            if (this.pressed[32]){
                let pos = this.renderer.camera.position;
                if (getId(this.engine.world.map.get_block(Math.round(pos.x + this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z + this.playerSize * 0.5))) != 0
                || getId(this.engine.world.map.get_block(Math.round(pos.x + this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z - this.playerSize * 0.5))) != 0
                || getId(this.engine.world.map.get_block(Math.round(pos.x - this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z + this.playerSize * 0.5))) != 0
                || getId(this.engine.world.map.get_block(Math.round(pos.x - this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z - this.playerSize * 0.5))) != 0){
                    this.velocity.y = 0.011;
                }
            }
        }
        function getId(x){if (x) return x.id; else return null;}
        // X move
        let xmovable = true;
        let pos = this.renderer.camera.position;
        for (let c of checkCollide){
            if (Math.round(pos.y + c.y + this.velocity.y * dT) < 0 || Math.round(pos.y + c.y + this.velocity.y * dT) >= this.engine.world.map.chunk_size.height) continue;
            if (getId(this.engine.world.map.get_block(Math.round(pos.x + c.x + this.velocity.x * dT), Math.round(pos.y + c.y), Math.round(pos.z + c.z))) != 0){
                xmovable = false;
                break;
            }
        }
        if (xmovable){
            this.renderer.camera.position.x += this.velocity.x * dT;
        }else{
            if (this.velocity.x > 0){
                this.renderer.camera.position.x = Math.ceil(this.renderer.camera.position.x - 0.5) + 0.5 - this.playerSize * 0.5001;
            }
            if (this.velocity.x < 0){
                this.renderer.camera.position.x = Math.floor(this.renderer.camera.position.x + 0.5) - 0.5 + this.playerSize * 0.5001;
            }
            this.velocity.x = 0;
        }
        // Z move
        let zmovable = true;
        pos = this.renderer.camera.position;
        for (let c of checkCollide){
            if (Math.round(pos.y + c.y + this.velocity.y * dT) < 0 || Math.round(pos.y + c.y + this.velocity.y * dT) >= this.engine.world.map.chunk_size.height) continue;
            if (getId(this.engine.world.map.get_block(Math.round(pos.x + c.x), Math.round(pos.y + c.y), Math.round(pos.z + c.z + this.velocity.z * dT))) != 0){
                zmovable = false;
                break;
            }
        }
        if (zmovable){
            this.renderer.camera.position.z += this.velocity.z * dT;
        }else{
            if (this.velocity.z > 0){
                this.renderer.camera.position.z = Math.ceil(this.renderer.camera.position.z - 0.5) + 0.5 - this.playerSize * 0.5001;
            }
            if (this.velocity.z < 0){
                this.renderer.camera.position.z = Math.floor(this.renderer.camera.position.z + 0.5) - 0.5 + this.playerSize * 0.5001;
            }
            this.velocity.z = 0;
        }
        // Y move
        let ymovable = true;
        pos = this.renderer.camera.position;
        for (let c of checkCollide){
            if (Math.round(pos.y + c.y + this.velocity.y * dT) < 0 || Math.round(pos.y + c.y + this.velocity.y * dT) >= this.engine.world.map.chunk_size.height) continue;
            if (getId(this.engine.world.map.get_block(Math.round(pos.x + c.x), Math.round(pos.y + c.y + this.velocity.y * dT), Math.round(pos.z + c.z))) != 0){
                ymovable = false;
                break;
            }
        }
        if (ymovable){
            this.renderer.camera.position.y += this.velocity.y * dT;
        }else{
            if (this.velocity.y > 0){
                this.renderer.camera.position.y = Math.ceil(this.renderer.camera.position.y - 0.5) + 0.5 - 0.5001;
            }
            if (this.velocity.y < 0){
                this.renderer.camera.position.y = Math.floor(this.renderer.camera.position.y);
            }
            this.velocity.y = 0;
        }
        this.velocity.x *= Math.pow(0.98, dT);
        this.velocity.z *= Math.pow(0.98, dT);

        // Manage Chunk
        const pChunk = {x: Math.floor(this.renderer.camera.position.x / this.engine.world.map.chunk_size.width), z: Math.floor(this.renderer.camera.position.z / this.engine.world.map.chunk_size.width)}
        let newRenderChunkList = [];
        for (let dx = - this.renderDist.draw; dx < this.renderDist.draw + 1; dx++){
            for (let dz = - this.renderDist.draw; dz < this.renderDist.draw + 1; dz++){
                if (Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2)) <= this.renderDist.draw){
                    newRenderChunkList.push({x: pChunk.x + dx, z: pChunk.z + dz});
                }
            }
        }
        for (let c of this.renderer.render_chunks){
            let dist = Math.sqrt(
                Math.pow((c.pos_in_world.x + 0.5) - (this.renderer.camera.position.x / c.chunk_size.width), 2) +
                Math.pow((c.pos_in_world.z + 0.5) - (this.renderer.camera.position.z / c.chunk_size.width), 2)
            );
            if (dist > this.renderDist.store){
                this.renderer.remove_render_chunk(c.chunk);
                break; // To prevent for statement break
            }
            if (dist > this.renderDist.draw + 1){
                c.disable();
            }
            if (dist <= this.renderDist.draw){
                c.enable();
            }
        }
        for (let c of newRenderChunkList){
            this.renderer.add_render_chunk(this.engine.world.map.load_chunk(c.x, c.z));
        }

        this.renderer.guiCtx.clearRect(0, 0, this.renderer.guiCanvas.width, this.renderer.guiCanvas.height);
        this.renderer.guiCtx.strokeStyle = "#FFFFFF";
        this.renderer.guiCtx.lineWidth = 2;
        this.renderer.guiCtx.beginPath();
        this.renderer.guiCtx.moveTo(this.renderer.guiCanvas.width * 0.5, this.renderer.guiCanvas.height * 0.5 - 9);
        this.renderer.guiCtx.lineTo(this.renderer.guiCanvas.width * 0.5, this.renderer.guiCanvas.height * 0.5 + 9);
        this.renderer.guiCtx.moveTo(this.renderer.guiCanvas.width * 0.5 - 9, this.renderer.guiCanvas.height * 0.5);
        this.renderer.guiCtx.lineTo(this.renderer.guiCanvas.width * 0.5 + 9, this.renderer.guiCanvas.height * 0.5);
        this.renderer.guiCtx.stroke();
    }
}
