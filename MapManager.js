
// #include "Chunk.js";

class ChunkLoader{
    constructor(map, chunk_size={width: 16, height: 256}){
        this.chunk_size = chunk_size;
        this.map = map;
    }

    load_chunk(px, pz){
        let new_chunk = new Chunk(px, pz, this.chunk_size, this.map);
        // Sample terrain
        for (let x=0; x<this.chunk_size.width; x++){
            for (let z=0; z<this.chunk_size.width; z++){
                let rx = this.chunk_size.width * px + x;
                let rz = this.chunk_size.width * pz + z;
                let h = Math.cos(rx / 10) * Math.cos(rz / 10) * 32 + 48;
                for (let y=0; y<h; y++){
                    new_chunk.set_relative(x, y, z, {id: 1});
                }
            }
        }
        return new_chunk;
    }
    
    save_chunk(chnk){

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
        if (!this.isLoaded) return;
        this.chunk_loader.save_chunk(this.load_chunk(x, z));
    }

    remove_chunk(chnk){
        if (!this.isLoaded) return;
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
            y: Math.floor(y / this.chunk_size.width)
        };
        let relative_pos = {
            x: x - chunk_pos.x * this.chunk_size.width,
            y: y - chunk_pos.y * this.chunk_size.width,
            z: z
        };
        let current_chunk = this.load_chunk(chunk_pos.x, chunk_pos.z);
        current_chunk.set_relative(relative_pos.x, relative_pos.y, relative_pos.z, block);
    }

    get_block(x, y, z){
        let chunk_pos = {
            x: Math.floor(x / this.chunk_size.width),
            y: Math.floor(y / this.chunk_size.width)
        };
        let relative_pos = {
            x: x - chunk_pos.x * this.chunk_size.width,
            y: y - chunk_pos.y * this.chunk_size.width,
            z: z
        };
        let current_chunk = this.load_chunk(chunk_pos.x, chunk_pos.z);
        current_chunk.get_relative(relative_pos.x, relative_pos.y, relative_pos.z);
    }
}
