
class PlayerEngine{
    constructor(engine, renderer){
        this.engine = engine;
        this.renderer = renderer;
        this.position = {x:0, y:0, z:0, set: function(x, y, z){this.x=x; this.y=y; this.z=z;}};
        this.velocity = {x: 0, y: 0, z: 0};
        window.addEventListener('mousemove', function(event) {
            if (document.pointerLockElement != null){
                renderer.camera.rotation.y -= event.movementX * player.sensitivity;
                renderer.camera.rotation.x = Math.min(1.57, (Math.max(-1.57, (renderer.camera.rotation.x - event.movementY / 200))));
            }
        }, false);
        
        this.pressed =  new Array(1000).fill(0);
        let pressed = this.pressed;
        window.addEventListener('keydown', onKeyDown, false);
        function onKeyDown(e) {
            if (editingdiv) return;
            pressed[e.keyCode] = 1;
        }
        window.addEventListener('keyup', onKeyUp, false);
        function onKeyUp(e) {
            if (editingdiv) return;
            pressed[e.keyCode] = 0;
        }
        engine.subengines.push(this);
        this.playerSize = 0.6;

        this.renderDist = {
            draw: 1.7,
            store: 4
        }
        this.spec3 = false;
        if (this.spec3){
            this.init();
        }
        this.walkbounce = 0;
        this.speed = 0.00015;
        this.sensitivity = 0.005;
        this.enableInput = true;
    }
    async init(){
        this.entityObject = await loadCharacter("char");
        renderer.scene.add(this.entityObject);
    }

    tick(dT){
        dT = Math.min(dT, 30);
        const checkCollide = [
            {x: 0.5 * this.playerSize, y: 0.3, z: 0.5 * this.playerSize},
            {x: 0.5 * this.playerSize, y: 0.3, z: -0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: 0.3, z: 0.5 * this.playerSize},
            {x: -0.5 * this.playerSize, y: 0.3, z: -0.5 * this.playerSize},
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
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y) * this.speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y) * this.speed * dT;
        }
        if (this.pressed[68]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y + Math.PI * 1.5) * this.speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y + Math.PI * 1.5) * this.speed * dT;
        }
        if (this.pressed[65]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y + Math.PI * 0.5) * this.speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y + Math.PI * 0.5) * this.speed * dT;
        }
        if (this.pressed[83]){
            this.velocity.x -= Math.sin(this.renderer.camera.rotation.y + Math.PI * 1.0) * this.speed * dT;
            this.velocity.z -= Math.cos(this.renderer.camera.rotation.y + Math.PI * 1.0) * this.speed * dT;
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
            let pos = this.position;
            if (this.pressed[32]){
                let pos = this.position;
                if (this.engine.world.map.get_block(Math.round(pos.x + this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z + this.playerSize * 0.5)) != 0
                || this.engine.world.map.get_block(Math.round(pos.x + this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z - this.playerSize * 0.5)) != 0
                || this.engine.world.map.get_block(Math.round(pos.x - this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z + this.playerSize * 0.5)) != 0
                || this.engine.world.map.get_block(Math.round(pos.x - this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z - this.playerSize * 0.5)) != 0){
                    this.velocity.y = 0.011;
                }
            }
        }
        // X move
        let xmovable = true;
        let pos = this.position;
        for (let c of checkCollide){
            if (Math.round(pos.y + c.y + this.velocity.y * dT) < 0 || Math.round(pos.y + c.y + this.velocity.y * dT) >= this.engine.world.map.chunk_size.height) continue;
            if (this.engine.world.map.get_block(Math.round(pos.x + c.x + this.velocity.x * dT), Math.round(pos.y + c.y), Math.round(pos.z + c.z)) != 0){
                xmovable = false;
                break;
            }
        }
        if (xmovable || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y - 1.499), Math.round(pos.z))!=0
        || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y - 0.499), Math.round(pos.z))!=0
        || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y + 0.499), Math.round(pos.z))!=0){
            this.position.x += this.velocity.x * dT;
        }else{
            if (this.velocity.x > 0){
                this.position.x = this.position.x + (Math.ceil(this.position.x - 0.5) + 0.5 - this.playerSize * 0.5001 - this.position.x) * 0.2;
            }
            if (this.velocity.x < 0){
                this.position.x = this.position.x + (Math.floor(this.position.x + 0.5) - 0.5 + this.playerSize * 0.5001 - this.position.x) * 0.2;
            }
            this.velocity.x = 0;
        }
        // Z move
        let zmovable = true;
        pos = this.position;
        for (let c of checkCollide){
            if (Math.round(pos.y + c.y + this.velocity.y * dT) < 0 || Math.round(pos.y + c.y + this.velocity.y * dT) >= this.engine.world.map.chunk_size.height) continue;
            if (this.engine.world.map.get_block(Math.round(pos.x + c.x), Math.round(pos.y + c.y), Math.round(pos.z + c.z + this.velocity.z * dT)) != 0
            || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y - 0.499), Math.round(pos.z))!=0
            || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y + 0.499), Math.round(pos.z))!=0){
                zmovable = false;
                break;
            }
        }
        if (zmovable || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y - 1.499), Math.round(pos.z))!=0){
            this.position.z += this.velocity.z * dT;
        }else{
            if (this.velocity.z > 0){
                this.position.z = this.position.z + (Math.ceil(this.position.z - 0.5) + 0.5 - this.playerSize * 0.5001 - this.position.z) * 0.2;
            }
            if (this.velocity.z < 0){
                this.position.z = this.position.z + (Math.floor(this.position.z + 0.5) - 0.5 + this.playerSize * 0.5001 - this.position.z) * 0.2;
            }
            this.velocity.z = 0;
        }
        // Y move
        let ymovable = true;
        pos = this.position;
        for (let c of checkCollide){
            if (Math.round(pos.y + c.y + this.velocity.y * dT) < 0 || Math.round(pos.y + c.y + this.velocity.y * dT) >= this.engine.world.map.chunk_size.height) continue;
            if (this.engine.world.map.get_block(Math.round(pos.x + c.x), Math.round(pos.y + c.y + this.velocity.y * dT), Math.round(pos.z + c.z)) != 0){
                ymovable = false;
                break;
            }
        }
        if (ymovable){
            this.position.y += this.velocity.y * dT;
        }else{
            if (this.velocity.y > 0
                || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y - 0.499), Math.round(pos.z))!=0
                || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y + 0.499), Math.round(pos.z))!=0){
                this.position.y = Math.ceil(this.position.y - 0.5) + 0.5 - 0.499;
            }
            if (this.velocity.y < 0
                || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y - 0.499), Math.round(pos.z))!=0
                || this.engine.world.map.get_block(Math.round(pos.x), Math.round(pos.y + 0.499), Math.round(pos.z))!=0){
                this.position.y = Math.floor(this.position.y);
            }
            this.velocity.y = 0;
        }
        this.velocity.x *= Math.pow(0.0000000017, dT/1000);
        this.velocity.z *= Math.pow(0.0000000017, dT/1000);

        // Manage Chunk
        const pChunk = {x: Math.floor(this.position.x / this.engine.world.map.chunk_size.width), z: Math.floor(this.position.z / this.engine.world.map.chunk_size.width)}
        let newRenderChunkList = [];
        for (let dx = - Math.floor(this.renderDist.draw); dx < Math.ceil(this.renderDist.draw) + 1; dx++){
            for (let dz = - Math.floor(this.renderDist.draw); dz < Math.ceil(this.renderDist.draw) + 1; dz++){
                if (Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2)) <= this.renderDist.draw){
                    newRenderChunkList.push({x: pChunk.x + dx, z: pChunk.z + dz});
                }
            }
        }
        for (let c of this.renderer.render_chunks){
            let dist = Math.sqrt(
                Math.pow((c.pos_in_world.x + 0.5) - (this.position.x / c.chunk_size.width), 2) +
                Math.pow((c.pos_in_world.z + 0.5) - (this.position.z / c.chunk_size.width), 2)
            );
            if (dist > this.renderDist.store){
                this.renderer.remove_render_chunk(c.chunk);
                this.engine.world.map.remove_chunk(c.chunk);
                break; // To prevent for statement break
            }
            if (dist > this.renderDist.draw + 1){
                c.disable();
            }
            if (dist <= this.renderDist.draw){
                c.enable();
            }
            let cind = newRenderChunkList.findIndex(t=>(t.x == c.chunk.pos_in_world.x && t.z == c.chunk.pos_in_world.z));
            if (cind != -1){
                newRenderChunkList.splice(cind, 1);
            }
        }
        for (let c of newRenderChunkList){
            this.renderer.add_render_chunk(this.engine.world.map.load_chunk(c.x, c.z));
        }
        
        for (let e of this.engine.world.entities){
            if (!e.object) continue;
            let r = Math.sqrt(Math.pow(e.object.position.x - this.position.x, 2) + Math.pow(e.object.position.z - this.position.z, 2));
            if (r > this.renderDist.draw * this.engine.world.map.chunk_size.width){
                e.object.visible = false;
            }else{
                e.object.visible = true;
            }
            if (r < this.playerSize){
                let dy = this.position.y - e.object.position.y;
                if (Math.abs(dy) < 1.6){
                    let dx = this.position.x - e.object.position.x;
                    let dz = this.position.z - e.object.position.z;
                    let dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
                    this.velocity.x += (dx / 1) * 0.003;
                    this.velocity.z += (dz / 1) * 0.003;
                }
            }
        }
        if (this.spec3){
            this.renderer.camera.position.set(
                this.position.x + Math.cos(this.renderer.camera.rotation.y) * Math.cos(this.walkbounce/10) * 0.15 - Math.cos(-this.renderer.camera.rotation.x + Math.PI * 0) * Math.cos(-this.renderer.camera.rotation.y + Math.PI * 1.5) * 2.3,
                this.position.y - Math.pow(Math.cos(this.walkbounce/10) * 0.3, 2) - this.renderer.camera.rotation.x * 3,
                this.position.z + Math.sin(this.renderer.camera.rotation.y) * Math.cos(this.walkbounce/10) * 0.15 - Math.cos(-this.renderer.camera.rotation.x + Math.PI * 0) * Math.sin(-this.renderer.camera.rotation.y + Math.PI * 1.5) * 2.3
            );
            if (this.entityObject){
                this.entityObject.position.x = this.position.x;
                this.entityObject.position.y = this.position.y;
                this.entityObject.position.z = this.position.z;
                this.entityObject.rotation.y = this.renderer.camera.rotation.y + Math.PI;
            }
        }else{
            this.renderer.camera.position.set(
                this.position.x + Math.cos(this.renderer.camera.rotation.y) * Math.cos(this.walkbounce/10) * 0.15,
                this.position.y - Math.pow(Math.cos(this.walkbounce/10) * 0.3, 2),
                this.position.z + Math.sin(this.renderer.camera.rotation.y) * Math.cos(this.walkbounce/10) * 0.15
            );
        }
        if (this.engine.world.map.get_block(Math.round(pos.x + this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z + this.playerSize * 0.5)) != 0
        || this.engine.world.map.get_block(Math.round(pos.x + this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z - this.playerSize * 0.5)) != 0
        || this.engine.world.map.get_block(Math.round(pos.x - this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z + this.playerSize * 0.5)) != 0
        || this.engine.world.map.get_block(Math.round(pos.x - this.playerSize * 0.5), Math.round(pos.y - 1.51), Math.round(pos.z - this.playerSize * 0.5)) != 0){
            this.walkbounce += Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.z, 2)) * 200;
        }
        
        // Network
        send({
            type: "UpdatePosition",
            pos: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
            },
            rotation: {
                y: this.renderer.camera.rotation.y,
            },
        });
    }
}
