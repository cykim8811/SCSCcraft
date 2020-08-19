
// #include "Chunk.js";

const chunkLoader = new class{
    constructor(chunk_size={width: 16, height: 256}){
        this.chunk_size = chunk_size;
    }

    load_chunk(x, y){
        let new_chunk = new Chunk(this.chunk_size);
        for (let ix=0; ix<this.chunk_size.width; ix++){
            for (let iy=0; iy<this.chunk_size.width; iy++){
                let ax = ix + x * this.chunk_size.width,
                    ay = iy + y * this.chunk_size.width;
                let r = Math.sqrt(Math.pow(ax, 2) + Math.pow(ay, 2)) / 16;
                let h = 64 + Math.sin(r) * 16;
                for (let iz=0; iz<h; iz++){
                    new_chunk.set_relative(ix, iy, iz, {id: 1});
                }
            }
        }
    }
    
    save_chunk(chnk){

    }
}({width: 16, height: 256});

const mapManager = new class{
    constructor(chunk_size={width: 16, height: 256}, chunk_loader){
        this.chunk_size = chunk_size;
        this.chunks = [];
        this.chunk_loader = chunk_loader;
    }

    isLoaded(x, y){
        for (let c of this.chunks){
            if (c.pos_in_world.x == x && c.pos_in_world.y == y){
                return true;
            }
        }
        return false;
    }

    load_chunk(x, y){
        for (let c of this.chunks){
            if (c.pos_in_world.x == x && c.pos_in_world.y == y){
                return c;
            }
        }
        let new_chunk = this.chunk_loader.load_chunk(x, y);
        this.chunks.push(new_chunk);
        return new_chunk;
    }

    save_chunk(x, y){
        if (!this.isLoaded) return;
        this.chunk_loader.save_chunk(this.load_chunk(x, y));
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
        let current_chunk = this.load_chunk(chunk_pos.x, chunk_pos.y);
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
        let current_chunk = this.load_chunk(chunk_pos.x, chunk_pos.y);
        current_chunk.get_relative(relative_pos.x, relative_pos.y, relative_pos.z);
    }

}({width: 16, height: 256}, chunkLoader);
