
const fs = require("fs");

class World{
    constructor(){
        this.map = new MapManager();
        this.entities = new Array();
    }

    save(){
        this.map.save();
        for (let e of world.entities){
            e.save();
        }
    }
}

class Chunk{
    constructor(px, pz, chunk_size={width: 16, height: 256}, map){
        this.chunk_size = chunk_size;
        this.data = [];
        for (let x=0; x<chunk_size.width; x++){
            for (let z=0; z<chunk_size.width; z++){
                for (let y=0; y<chunk_size.height; y++){
                    this.data.push(0);
                }
            }
        }
        this.pos_in_world = {x: px, z: pz};
        this.map = map;
        this.cache = 10000;
    }

    pos_to_ind(x, y, z){
        if (y < 0 || y >= this.chunk_size.height){
            console.error("Try to access block out of y range");
            forerror();
        }
        return this.chunk_size.width * this.chunk_size.height * x
            + this.chunk_size.height * z
            + y;
    }

    set_relative(x, y, z, block){
        if (x >= 0 && x < this.chunk_size.width && z >= 0 && z < this.chunk_size.width){
            const pti = this.pos_to_ind(x, y, z);
            this.data[pti] = block;
            return true;
        }else{
            const rx = this.pos_in_world.x + Math.floor(x / this.chunk_size.width);
            const rz = this.pos_in_world.z + Math.floor(z / this.chunk_size.width);
            if (!this.map.isLoaded(rx, rz)){
                return false;
            }
            this.map.load_chunk(rx, rz).set_relative(x - Math.floor(x / this.chunk_size.width) * this.chunk_size.width, y, z - Math.floor(z / this.chunk_size.width) * this.chunk_size.width, block);
        }
    }

    get_relative(x, y, z){
        if (x >= 0 && x < this.chunk_size.width && z >= 0 && z < this.chunk_size.width){
            return this.data[this.pos_to_ind(x, y, z)];
        }else{
            const rx = Math.floor(x / this.chunk_size.width);
            const rz = Math.floor(z / this.chunk_size.width);
            if (!this.map.isLoaded(this.pos_in_world.x + rx, this.pos_in_world.z + rz)){
                return null;
            }
            return this.map.load_chunk(this.pos_in_world.x + rx, this.pos_in_world.z + rz).get_relative(x - rx * this.chunk_size.width, y, z - rz * this.chunk_size.width);
        }
    }
    
    loaded(){
        this.cache = this.cache * 1.5 + 10000;
    }
}


class ChunkLoader{
    constructor(map, chunk_size={width: 16, height: 256}){
        this.chunk_size = chunk_size;
        this.map = map;
    }

    load_chunk(px, pz){
        const files = fs.readdirSync("./map");
        const chunkFile = files.find(x=>x=="chunk_" + px + "_" + pz + ".txt");
        if (chunkFile){
            let new_chunk = new Chunk(px, pz, this.chunk_size, this.map);
            const fileData = fs.readFileSync("./map/chunk_" + px + "_" + pz + ".txt", "utf-8");
            new_chunk.data = JSON.parse(fileData);
            return new_chunk;
        }
        let new_chunk = new Chunk(px, pz, this.chunk_size, this.map);
        // Sample terrain

        /*
        for (let x=0; x<this.chunk_size.width; x++){
            for (let z=0; z<this.chunk_size.width; z++){
                let rx = this.chunk_size.width * px + x;
                let rz = this.chunk_size.width * pz + z;
                let r = Math.sqrt(Math.pow(rx, 2) + Math.pow(rz, 2));
                let h = 64 + ((Math.cos(rx / 8) * Math.cos(rz / 8) * 7) + Math.cos(Math.abs(Math.pow(r, 2)) / 1000) * 6) * Math.pow(1.03, -r/16);
                for (let y=0; y<h; y++){
                    let col = Math.floor(100 + (2 * (2 * Math.cos(rx / 128) + 2 * Math.sin(rz / 128) + 2 * Math.cos(y * rx / 500)))) % 8 + 1;
                    new_chunk.set_relative(x, y, z, col);
                }
            }
        }
        */
        for (let x=0; x<this.chunk_size.width; x++){
            for (let z=0; z<this.chunk_size.width; z++){
                let rx = this.chunk_size.width * px + x;
                let rz = this.chunk_size.width * pz + z;
                let r = Math.sqrt(Math.pow(rx, 2) + Math.pow(rz, 2));
                let h = 64;
                for (let y=0; y<h; y++){
                    let col = (Math.floor(Math.pow(r, 2) * y / 100) % 8) + 1;
                    new_chunk.set_relative(x, y, z, col);
                }
            }
        }
        this.save_chunk(new_chunk);
        return new_chunk;
    }
    
    save_chunk(chnk){
        fs.writeFileSync("./map/chunk_" + chnk.pos_in_world.x + "_" + chnk.pos_in_world.z + ".txt", JSON.stringify(chnk.data));
    }
}

class MapManager{
    constructor(chunk_size={width: 16, height: 256}, chunk_loader=new ChunkLoader(this)){
        this.chunk_size = chunk_size;
        this.chunks = [];
        this.chunk_loader = chunk_loader;
    }

    isLoaded(x, z){
        for (let c of this.chunks){
            if (c.pos_in_world.x == x && c.pos_in_world.z == z){
                return true;
            }
        }
        return false;
    }

    load_chunk(x, z){
        for (let c of this.chunks){
            if (c.pos_in_world.x == x && c.pos_in_world.z == z){
                c.loaded(); // for cache
                return c;
            }
        }
        let new_chunk = this.chunk_loader.load_chunk(x, z);
        this.chunks.push(new_chunk);
        return new_chunk;
    }

    force_load_chunk(x, z){
        this.remove_chunk(this.load_chunk(x, z));
        let new_chunk = this.chunk_loader.load_chunk(x, z);
        this.chunks.push(new_chunk);
        return new_chunk;
    }

    save_chunk(x, z){
        if (!this.isLoaded(x, z)) return;
        this.chunk_loader.save_chunk(this.load_chunk(x, z));
    }

    remove_chunk(chnk){
        this.chunk_loader.save_chunk(chnk);
        for (let i=0; i<this.chunks.length; i++){
            if (this.chunks[i] == chnk){
                this.chunks.splice(i, 1);
                i--;
            }
        }
    }
    
    set_block(x, y, z, block){
        let chunk_pos = {
            x: Math.floor(x / this.chunk_size.width),
            z: Math.floor(z / this.chunk_size.width)
        };
        let relative_pos = {
            x: x - chunk_pos.x * this.chunk_size.width,
            y: y,
            z: z - chunk_pos.z * this.chunk_size.width,
        };
        let current_chunk = this.load_chunk(chunk_pos.x, chunk_pos.z);
        current_chunk.set_relative(relative_pos.x, relative_pos.y, relative_pos.z, block);
    }

    get_block(x, y, z){
        let chunk_pos = {
            x: Math.floor(x / this.chunk_size.width),
            z: Math.floor(z / this.chunk_size.width)
        };
        let relative_pos = {
            x: x - chunk_pos.x * this.chunk_size.width,
            y: y,
            z: z - chunk_pos.z * this.chunk_size.width
        };
        let current_chunk = this.load_chunk(chunk_pos.x, chunk_pos.z);
        return current_chunk.get_relative(relative_pos.x, relative_pos.y, relative_pos.z);
    }

    save(){
        console.log("[Save] Saved", this.chunks.length, "chunks");
        for (let ch of this.chunks){
            this.chunk_loader.save_chunk(ch);
        }
    }
}


class Engine{
    constructor(world){
        this.setting = {
            fps: 100,
            running: false
        };
        this.world = world;
        this.subengines = [];
    }

    run(){
        if (this.setting.running) return false;
        this.setting.running = true;
        this.tick(0);
    }

    getBlock(position){
        return this.world.map.get_block(position.x, position.y, position.z);
    }

    setBlock(position, block){
        return this.world.map.set_block(position.x, position.y, position.z, block);
    }

    // Automatically calls itself while this.running == true
    tick(dT){
        for (let e of this.world.entities){
            e.tick(dT, this)
        }
        for (let subengine of this.subengines){
            subengine.tick(dT, this);
        }
        // map cache control
        for (let ch of this.world.map.chunks){
            ch.cache -= dT;
            if (ch.cache < 0){
                this.world.map.remove_chunk(ch);
                break;
            }
        }
        // Calling this function again
        setTimeout(function(self){
            if (self.setting.running){
                self.tick(1000 / self.setting.fps);
            }
        }, 1000 / this.setting.fps, this);
    }
};


exports.World = World;
exports.Engine = Engine;
