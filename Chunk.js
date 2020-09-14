
class Chunk{
    constructor(px, pz, chunk_size={width: 16, height: 256}, map){
        this.chunk_size = chunk_size;
        this.data = [];
        for (let x=0; x<chunk_size.width; x++){
            for (let z=0; z<chunk_size.width; z++){
                for (let y=0; y<chunk_size.height; y++){
                    this.data.push({id: 0});
                }
            }
        }
        this.pos_in_world = {x: px, z: pz};
        this.map = map;
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
}
