
class Entity{
    constructor(position){
        this.position = position;
        this.collider = {relative_pos: {x: 0, y: -0.5, z: 0}, shape: "cylinder", r: 0.5, h: 1};
        
        this.property = {
            gravity: true,
            stationary: false,
        };

        this.velocity =  new Vector(0, 0, 0);
    }
}
