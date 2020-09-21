
// #include "Chunk.js";

class ChunkLoader{
    constructor(map, chunk_size={width: 16, height: 256}){
        this.chunk_size = chunk_size;
        this.map = map;
    }

    async load_chunk(px, pz){
        let new_chunk = new Chunk(px, pz, this.chunk_size, this.map);
        // Fetch from server
        new_chunk.data = await request({
            type: "ChunkRequest",
            x: px,
            z: pz,
        });
        new_chunk.loaded = true;
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

        this.loading_chunk = [];
    }

    isLoaded(x, z){
        for (let c of this.chunks){
            if (c.pos_in_world.x == x && c.pos_in_world.z == z){
                return true;
            }
        }
        return false;
    }

    async load_chunk(x, z){
        let loading = this.loading_chunk.find(t=>(t.x==x&&t.z==z));
        if (loading){
            await new Promise(function(res, rej){loading.onend.push(res);});
        }
        let getchunk = this.get_chunk(x, z);
        if (getchunk != null) return getchunk;
        this.loading_chunk.push({x:x, z:z, onend: []});
        let new_chunk = await this.chunk_loader.load_chunk(x, z);
        this.chunks.push(new_chunk);
        loading = this.loading_chunk.findIndex(t=>(t.x==x&&t.z==z));
        if (loading != -1){
            for (let ll of this.loading_chunk[loading].onend){
                ll();
            }
            this.loading_chunk.splice(loading, 1);
        }
        return new_chunk;
    }

    async force_load_chunk(x, z){
        this.remove_chunk(await this.load_chunk(x, z));
        let new_chunk = await this.chunk_loader.load_chunk(x, z);
        this.chunks.push(new_chunk);
        return new_chunk;
    }

    get_chunk(x, z){
        for (let c of this.chunks){
            if (c.pos_in_world.x == x && c.pos_in_world.z == z){
                return c;
            }
        }
        return null;
    }

    save_chunk(x, z){
        if (!this.isLoaded(x, z)){
            return;
        }
        (async function(self){
            self.chunk_loader.save_chunk(await self.load_chunk(x, z));
        })(this);
    }

    remove_chunk(chnk){
        if (!this.isLoaded(chnk.pos_in_world.x, chnk.pos_in_world.z)) return;
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
        (async function(self){
            let current_chunk = await self.load_chunk(chunk_pos.x, chunk_pos.z);
            current_chunk.set_relative(relative_pos.x, relative_pos.y, relative_pos.z, block);
        })(this);
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
        let current_chunk = this.get_chunk(chunk_pos.x, chunk_pos.z);
        if (current_chunk == null) return null;
        return current_chunk.get_relative(relative_pos.x, relative_pos.y, relative_pos.z);
    }
}
