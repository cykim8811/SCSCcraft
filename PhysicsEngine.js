
class PhysicsEngine{
    constructor(settings={g: 9.8}){
        this.g = settings.g;
    }

    run_entity(mapManager, entity, dT){
        entity.velocity.y += g * dT;
        if (entity.velocity.y * dT)
        entity.position.y += entity.velocity.y * dT;
    }
}
