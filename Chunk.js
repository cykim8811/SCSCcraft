
class Chunck{
    constructor(chunk_size={width: 16, height: 256}){
        this.chunk_size = chunk_size;
        this.data = [];
        for (let x=0; x<chunk_size.width; x++){
            for (let y=0; y<chunk_size.width; y++){
                for (let z=0; z<chunk_size.height; z++){
                    this.data.push({id: 0});
                }
            }
        }
        this.pos_in_world = {x: in_world, y: yy};
    }

    pos_to_ind(x, y, z){
        return this.chunk_size.width * this.chunk_size.height * x
            + this.chunk_size.height * y
            + z;
    }

    set_relative(x, y, z, block){
        this.data[this.pos_to_ind] = block;
    }

    get_relative(x, y, z){
        return this.data[this.pos_to_ind];
    }
}
