
const Vector = new class{
    add(p, q){
        return {
            x: p.x + q.x,
            y: p.y + q.y,
            z: p.z + q.z,
        };
    }
    inner(p, q){
        return p.x * q.x + p.y * q.y + p.z * q.z;
    }
    substract(p, q){
        return {
            x: p.x - q.x,
            y: p.y - q.y,
            z: p.z - q.z,
        };
    }
}
