
class Vector{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z){
        if (y == undefined){
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(dx, dy, dz){
        if (dy == undefined){
            this.x += x.x;
            this.y += x.y;
            this.z += x.z;
        }
        this.x += dx;
        this.y += dy;
        this.z += dz;
    }

    multiply(n){
        this.x *= n;
        this.y *= n;
        this.z *= n;
    }
}

Vector.inner = function(v1, v2){
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}