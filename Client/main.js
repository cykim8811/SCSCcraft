
let gameWorld = null;
let gameEngine = null;
let renderer = null;
let player = null;


async function start(name="None"){
    websocket = await init_websocket();
    gameWorld = new World();
    gameEngine = new Engine(gameWorld);
    renderer = new Renderer(gameEngine);
    player = new PlayerEngine(gameEngine, renderer);
    player.position.set(0, 80, 0);

    gameEngine.run();

    send({type: "UpdateName", name: name});

}


function receive(obj){
    //if (obj.type != "UpdatePosition") console.log(obj);
    if (!obj.type) return;
    if (obj.type == "Join"){
        if (!obj.userId) return;
        new User(obj.userId);
    }
    if (obj.type == "Leave"){
        if (!obj.userId) return;
        if (findUser(obj.userId)){
            findUser(obj.userId).onleave();
        }
    }
    if (obj.type == "UpdatePosition"){
        if (findUser(obj.userId)){
            findUser(obj.userId).onmessage(obj);
        }
    }
    if (obj.type == "UpdateName"){
        if (findUser(obj.userId)){
            findUser(obj.userId).onmessage(obj);
        }
    }
    if (obj.type == "UpdateBlock"){
        gameWorld.map.set_block(obj.pos.x, obj.pos.y, obj.pos.z, obj.id);
    }
    if (obj.type == "CreateComputer"){
        new ComputerEntity(obj.data.computerId, obj.data.position, obj.data.angle);
    }
    if (obj.type == "UpdateComputerPos"){
        let c = gameWorld.entities.find(t=>(t.computerId == obj.computerId));
        if (!c) return;
        if (obj.position){
            c.object.position.x = obj.position.x;
            c.object.position.y = obj.position.y;
            c.object.position.z = obj.position.z;
        }
        if (obj.angle){
            c.object.rotation.y = obj.angle;
        }
    }
}


function findUser(userId){
    return users.find(x=>(x.userId == userId));
}
const users = [];
class User{
    constructor(userId){
        this.entity = new PlayerEntity();
        this.userId = userId;
        users.push(this);
    }
    onmessage(obj){
        if (obj.type == "UpdatePosition"){
            if (!this.entity.object) return;
            this.entity.object.position.set(obj.pos.x, obj.pos.y, obj.pos.z);
            this.entity.object.rotation.y = obj.rotation.y + Math.PI;
        }
        if (obj.type == "UpdateName"){
            this.entity.name = obj.name;
        }
    }
    onleave(){
        this.entity.remove();
        let ind = users.findIndex(x=>(x==this));
        if (ind != -1){
            users.splice(ind, 1);
        }
    }
}

let editingdiv = null;
let editor = null;
let editcomputer = null;
let editprev = "";

window.addEventListener('keydown', function(e){
    if (!editingdiv) return;
    if (editprev != editor.getValue()){
        send({
            type: "UpdateComputer",
            computerId: editcomputer.computerId,
            data: editor.getValue(),
        });
        editprev = editor.getValue();
    }
}, false);

window.addEventListener('keydown', function(e){
    if (editingdiv) return;
    if (e.key == "c"){
        send({
            type: "CreateComputer",
            position: player.position,
        });
    }
}, false);

async function block_click(tv, ov, ev, intersect){
    let computer = gameWorld.entities.find(t=>(t.object == intersect.object));
    if (computer){
        let totdiv = document.createElement("div");
        totdiv.style.position = "absolute";
        totdiv.style.width = "70%";
        totdiv.style.height = "70%";
        totdiv.style.left = "15%";
        totdiv.style.top = "15%";
        totdiv.style.backgroundColor = "#777";
        
        let div = document.createElement("div");
        div.id = "editor";
        div.style.width = "68vw";
        div.style.height = "calc(100% - 3vw - 6vh)";
        div.style.margin = "0 auto";
        div.style.top = "1vw";
        
        div.style.fontSize = "18px";
        totdiv.appendChild(div);

        let playbtn = document.createElement("div");
        playbtn.innerHTML = "▶";
        playbtn.style.width = "5vh";
        playbtn.style.fontSize = "5vh";
        playbtn.style.color = "#7E8";
        playbtn.style.margin = "3vh";
        playbtn.style.cursor = "pointer";
        playbtn.style.float = "left";
        playbtn.style.filter = "drop-shadow(2px 2px 3px #555)";
        playbtn.onclick = function(){
            send({
                type: "UpdateComputer",
                computerId: editcomputer.computerId,
                data: editor.getValue(),
            });
            send({
                type: "RunComputer",
                computerId: computer.computerId,
            });
            document.body.removeChild(totdiv);
            renderer.guiCanvas.requestPointerLock();
            editingdiv = null;
            editor = null;
            editcomputer = null;
        };
        totdiv.appendChild(playbtn);

        let exitbtn = document.createElement("div");
        exitbtn.innerHTML = "X";
        exitbtn.style.width = "5vh";
        exitbtn.style.fontSize = "5vh";
        exitbtn.style.color = "rgb(156, 32, 14)";
        exitbtn.style.margin = "3vh";
        exitbtn.style.cursor = "pointer";
        exitbtn.style.fontWeight = "bolder";
        exitbtn.style.float = "right";
        exitbtn.style.filter = "drop-shadow(2px 2px 3px #555)";
        exitbtn.onclick = function(){
            send({
                type: "UpdateComputer",
                computerId: editcomputer.computerId,
                data: editor.getValue(),
            });
            document.body.removeChild(totdiv);
            renderer.guiCanvas.requestPointerLock();
            editingdiv = null;
            editor = null;
            editcomputer = null;
        };
        totdiv.appendChild(exitbtn);

        document.body.appendChild(totdiv);

        editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/python");
        document.exitPointerLock();
        editingdiv = div;
        editcomputer = computer;
        setTimeout(async function(){
            editor.setValue(await request({
                type: "ComputerRequest",
                computerId: editcomputer.computerId,
            }));
        }, 50);
        return;
    }
    if (ev.button == 0){
        send({
            type: "UpdateBlock",
            pos: {x: tv.x, y: tv.y, z: tv.z},
            id: 0,
        });
    }
    if (ev.button == 2){
        send({
            type: "UpdateBlock",
            pos: {x: ov.x, y: ov.y, z: ov.z},
            id: 1,
        });
    }
}
