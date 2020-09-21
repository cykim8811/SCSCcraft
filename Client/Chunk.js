
class Chunk{
    constructor(px, pz, chunk_size={width: 16, height: 256}, map){
        this.chunk_size = chunk_size;
        this.data = [];
        this.pos_in_world = {x: px, z: pz};
        this.map = map;
        this.loaded = false;
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
            // Using global renderer variable ***warning***
            let cx = this.pos_in_world.x;
            let cz = this.pos_in_world.z;
            let chunks_to_update = [];
            chunks_to_update.push(this);
            if (x==0 && this.map.get_chunk(cx-1, cz)) chunks_to_update.push(this.map.get_chunk(cx-1, cz));
            if (x==this.map.chunk_size.width - 1 && this.map.get_chunk(cx+1, cz)) chunks_to_update.push(this.map.get_chunk(cx+1, cz));
            if (z==0 && this.map.get_chunk(cx, cz-1)) chunks_to_update.push(this.map.get_chunk(cx, cz-1));
            if (z==this.map.chunk_size.width - 1 && this.map.get_chunk(cx, cz+1)) chunks_to_update.push(this.map.get_chunk(cx, cz+1));
            for (let ch of chunks_to_update){
                if (renderer.get_render_chunk(ch)){
                    renderer.get_render_chunk(ch).draw_chunk();
                }
            }
            return true;
        }else{
            const rx = this.pos_in_world.x + Math.floor(x / this.chunk_size.width);
            const rz = this.pos_in_world.z + Math.floor(z / this.chunk_size.width);
            if (!this.map.isLoaded(rx, rz)){
                return false;
            }
            (async function(self){
                let target = this.map.get_chunk(rx, rz) || (await this.map.load_chunk(rx, rz));
                target.set_relative(x - Math.floor(x / self.chunk_size.width) * self.chunk_size.width, y, z - Math.floor(z / self.chunk_size.width) * self.chunk_size.width, block);
            })(this);
        }
    }

    async force_get_relative(x, y, z){
        if (x >= 0 && x < this.chunk_size.width && z >= 0 && z < this.chunk_size.width){
            return this.data[this.pos_to_ind(x, y, z)];
        }else{
            const rx = Math.floor(x / this.chunk_size.width);
            const rz = Math.floor(z / this.chunk_size.width);
            if (!this.map.isLoaded(this.pos_in_world.x + rx, this.pos_in_world.z + rz)){
                return null;
            }
            return (await (await this.map.load_chunk(this.pos_in_world.x + rx, this.pos_in_world.z + rz))
                .get_relative(x - rx * this.chunk_size.width, y, z - rz * this.chunk_size.width));
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
            return this.map.get_chunk(this.pos_in_world.x + rx, this.pos_in_world.z + rz)
                .get_relative(x - rx * this.chunk_size.width, y, z - rz * this.chunk_size.width);
        }
    }
}
