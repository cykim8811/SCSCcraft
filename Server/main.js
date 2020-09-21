const fs = require("fs");
const Pycraft = require("./Pycraft.js");
const child = require("child_process");
const WebsocketServer = require("ws").Server;

const server = new WebsocketServer({port: 9000});
console.log("[Server Started]")

const world = new Pycraft.World();
const engine = new Pycraft.Engine(world);

engine.run();

function delay(time){
    return new Promise(function(res, rej){
        setTimeout(res, time);
    });
}

function broadcast(obj){
    for (let u of users){
        u.send(obj);
    }
}
const users = [];
class User{
    constructor(ws, req){
        this.ws = ws;
        console.log("[Join]", ws._socket.remoteAddress);
        this.userId = newUserId();
        this.name = "";
        for (let u of users){
            u.send({
                type: "Join",
                userId: this.userId
            });
            this.send({
                type: "Join",
                userId: u.userId
            });
            this.send({
                type: "UpdateName",
                userId: u.userId,
                name: u.name
            });
        }
        for (let e of world.entities){
            e.create(this);
        }
        this.position = {x: 0, y: 0, z: 0};
        users.push(this);
    }
	send(target){
        //console.log("[Send]", this.ws._socket.remoteAddress);
        //console.log(target);
		this.ws.send(JSON.stringify(target));
	}
    async message(msg){
        //console.log("[Receive]", this.ws._socket.remoteAddress);
        //console.log(msg);
        if (!msg.type) return;
        if (msg.type == "ChunkRequest"){
            if (typeof msg.x != "number" || typeof msg.z != "number"){
                return;
            }
            // TODO: Add assertion : can break when msg.x != int || msg.z != int
            if (typeof msg.reqid != "number") return;
            let reqchunk = engine.world.map.load_chunk(msg.x, msg.z);
            this.send({
                reqid: msg.reqid,
                response: reqchunk.data,
            })
        }
        if (msg.type == "UpdatePosition"){
            msg.userId = this.userId;
            this.position = msg.pos;
            broadcast(msg);
        }
        if (msg.type == "UpdateBlock"){
            // TODO: Add assertion
            if (msg.id != 0){
                for (let usr of users){
                    if (Math.abs(usr.position.y - 0.7 - msg.pos.y) > 1.299) continue;
                    if (Math.abs(usr.position.x - msg.pos.x) > 0.8 || Math.abs(usr.position.z - msg.pos.z) > 0.8) continue;
                    return;
                }
                for (let e of world.entities){
                    if (e.entityType == "Computer"){
                        if (e.position.x == msg.pos.x && e.position.y == msg.pos.y && e.position.z == msg.pos.z) return;
                    }
                }
            }
            world.map.set_block(msg.pos.x, msg.pos.y, msg.pos.z, msg.id);
            broadcast(msg);
        }
        if (msg.type == "UpdateName"){
            msg.userId = this.userId;
            this.name = msg.name;
            broadcast(msg);
        }
        if (msg.type == "UpdateComputer"){
            broadcast(msg);
            let computer = world.entities.find(t=>(t.computerId == msg.computerId));
            if (computer){
                computer.code = msg.data;
                computer.save();
            }
        }
        if (msg.type == "CreateComputer"){
            new Computer(msg.position, 0);
        }
        if (msg.type == "ComputerRequest"){
            if (typeof msg.reqid != "number") return;
            let computer = world.entities.find(t=>(t.computerId == msg.computerId));
            this.send({
                reqid: msg.reqid,
                response: (computer?computer.code:null),
            });
        }
        if (msg.type == "RunComputer"){
            let computer = world.entities.find(t=>(t.computerId == msg.computerId));
            if (!computer) return;
            if (computer.child){
                computer.child.kill();
            }
            computer.child = child.spawn("python", ["./sources/computer" + computer.computerId + ".py"]);
            console.log("[Computer" + computer.computerId + "] <Boot>");
            computer.child.stdout.on("data", function(data){
                computer.getChildMsg(data);
            });
            computer.child.stderr.on("data", function(data){
                computer.getChildErr(data);
            });
        }
        return;
    }
    close(){
        console.log("[Leave]", this.ws._socket.remoteAddress);
        for (let u of users){
            u.send({
                type: "Leave",
                userId: this.userId
            });
        }
        let ind = users.findIndex(x=>(x==this));
        if (ind != -1) {users.splice(ind, 1);}
    }
}

let lastUserId = 0;
function newUserId(){lastUserId += 1; return lastUserId;}

server.on('connection', function(ws, req) {
	let usr = new User(ws, req);
	ws.on('message', function(msg){
		let recv;
		try{
			recv = JSON.parse(msg);
		}catch(e){
            return;
		}
        usr.message(recv);
    });
	ws.on('close', function(){
        usr.close();
        const usrind = users.findIndex(x=>(x == usr));
        if (usrind != -1) users.splice(usrind, 1);
		usr.ws.close();
    });
});

setInterval(()=>world.map.save(), 100000);


function newComputerId(){
    let entitylist = fs.readdirSync('entity');
    let lastind = 0;
    for (let e of entitylist){
        if (e.slice(0, 8) == "computer"){
            console.log(e.slice(9, -4));
            lastind = Math.max(JSON.parse(fs.readFileSync("entity/"+e)).computerId);
        }
    }
    return lastind + 1;
}

let importcode = "from computer import *\n";

class Computer{
    constructor(pos, angle=0, computerId=newComputerId()){
        this.entityType = "Computer";
        this.position = pos;
        this.angle = angle;
        this.code = "";
        this.computerId = computerId;
        this.child = null;
        this.init();
        this.save();
        this.commands = [];
    }
    init(){
        world.entities.push(this);
        for (let u of users){
            this.create(u);
        }
    }
    tick(dT){
        if (this.child){
            
        }
    }
    getChildMsg(data){
        data = data.toString();
        if (data.slice(0, 2) == "$$"){
            let msg = data.slice(2, 4);
            if (msg == "go"){
                let dir = data.slice(4, 5) * 1;
                let dx, dy, dz;
                if (dir == 0){
                    dx = 0;dy = 0;dz = 0;
                }else if (dir >= 1 && dir < 5){
                    dx = Math.round(Math.cos(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dz = Math.round(Math.sin(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dy = 0;
                }else if (dir == 5){
                    dx = 0;dz = 0;dy = 1;
                }else if (dir == 6){
                    dx = 0;dz = 0;dy = -1;
                }
                this.go(dx, dy, dz);
            }
            if (msg == "tl"){
                this.turn(Math.PI * 0.5);
            }
            if (msg == "tr"){
                this.turn(-Math.PI * 0.5);
            }
            if (msg == "gt"){
                let dir = data.slice(4, 5) * 1;
                let dx, dy, dz;
                if (dir == 0){
                    dx = 0;
                    dy = 0;
                    dz = 0;
                }else if (dir >= 1 && dir < 5){
                    dx = Math.round(Math.cos(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dz = Math.round(Math.sin(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dy = 0;
                }else if (dir == 5){
                    dx = 0;
                    dz = 0;
                    dy = 1;
                }else if (dir == 6){
                    dx = 0;
                    dz = 0;
                    dy = -1;
                }
                if (world.map.get_block(Math.round(this.position.x) + dx, Math.round(this.position.y) + dy, Math.round(this.position.z) + dz)){
                    this.child.stdin.write("'t'\n");
                }else{
                    this.child.stdin.write("'f'\n");
                }
            }
            if (msg == "mn"){
                let dir = data.slice(4, 5) * 1;
                let dx, dy, dz;
                if (dir == 0){
                    dx = 0;dy = 0;dz = 0;
                }else if (dir >= 1 && dir < 5){
                    dx = Math.round(Math.cos(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dz = Math.round(Math.sin(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dy = 0;
                }else if (dir == 5){
                    dx = 0;dz = 0;dy = 1;
                }else if (dir == 6){
                    dx = 0;dz = 0;dy = -1;
                }
                world.map.set_block(Math.round(this.position.x) + dx, Math.round(this.position.y) + dy, Math.round(this.position.z) + dz, 0);
                broadcast({
                    type: "UpdateBlock",
                    pos: {
                        x: Math.round(this.position.x) + dx,
                        y: Math.round(this.position.y) + dy,
                        z: Math.round(this.position.z) + dz
                    },
                    id: 0,
                });
            }
            if (msg == "pt"){
                let dir = data.slice(4, 5) * 1;
                let bid = data.slice(5, 6) * 1;
                let dx, dy, dz;
                if (dir == 0){
                    dx = 0;dy = 0;dz = 0;
                }else if (dir >= 1 && dir < 5){
                    dx = Math.round(Math.cos(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dz = Math.round(Math.sin(-this.angle + (dir - 1) * Math.PI * 0.5));
                    dy = 0;
                }else if (dir == 5){
                    dx = 0;dz = 0;dy = 1;
                }else if (dir == 6){
                    dx = 0;dz = 0;dy = -1;
                }
                world.map.set_block(Math.round(this.position.x) + dx, Math.round(this.position.y) + dy, Math.round(this.position.z) + dz, 0);
                broadcast({
                    type: "UpdateBlock",
                    pos: {
                        x: Math.round(this.position.x) + dx,
                        y: Math.round(this.position.y) + dy,
                        z: Math.round(this.position.z) + dz
                    },
                    id: bid,
                });
            }
            return;
        }
        console.log("[Computer" + this.computerId + "] " + data);
    }
    getChildErr(data){
        console.log("=====Error Detected=====");
        console.log("" + data);
        console.log("========================");
    }

    async go(dx, dy, dz, time=1000){
        for (let i = 0; i < 50; i ++){
            this.position.x += dx * 0.02;
            this.position.z += dz * 0.02;
            this.position.y += dy * 0.02;
            broadcast({
                type: "UpdateComputerPos",
                computerId: this.computerId,
                position: this.position
            });
            await delay(time * 0.02);
        }
        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
        this.position.z = Math.round(this.position.z);
    }

    async turn(dy, time=1000){
        for (let i = 0; i < 50; i ++){
            this.angle += dy * 0.02;
            broadcast({
                type: "UpdateComputerPos",
                computerId: this.computerId,
                angle: this.angle
            });
            await delay(time * 0.02);
        }
        this.angle = Math.round(this.angle / (Math.PI * 0.5)) * Math.PI * 0.5;
    }

    save(){
        fs.writeFileSync("entity/computer" + this.computerId + ".txt", JSON.stringify({
            code: this.code,
            position: this.position,
            angle: this.angle,
            computerId: this.computerId,
            entityType: this.entityType,
        }));
        fs.writeFileSync("sources/computer" + this.computerId + ".py", importcode + this.code);
    }
    create(user){
        user.send({
            type: "CreateComputer",
            data: this,
        });
    }
    remove(){
        for (let u of users){
            u.send({
                type: "DestroyComputer",
                computerId: this.computerId,
            });
        }
        let ind = world.entities.findIndex(this);
        if (ind != -1) {world.entities.splice(ind, 1);}
    }
}


for (let ent of fs.readdirSync('entity')){
    let re = JSON.parse(fs.readFileSync('entity/' + ent));
    if (ent.slice(0, 8) == "computer"){
        let ne = new Computer(re.position, re.angle, re.computerId);
        ne.code = re.code;
    }
}
