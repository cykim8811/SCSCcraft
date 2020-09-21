
let websocket = null;

function init_websocket(){
    let websocket = new WebSocket("ws://13.124.68.124:9000");
    return new Promise(function(res, rej){
        websocket.onopen = function(evt) {
            res(websocket);
        }
        websocket.onclose = function(evt) {
            
        }
        websocket.onmessage = function(evt) {
            let data = JSON.parse(evt.data);
            if (data.reqid){
                let ownind = requestList.findIndex(x=>(x.reqid == data.reqid));
                if (ownind != -1){
                    requestList[ownind].resolve(data.response);
                    requestList.splice(ownind, 1);
                }
            }
            receive(data);
        }
        websocket.onerror = function(evt) {
            
        }
    });
}

const requestList = [];
let lastReqId = 0;
function newReqId(){ lastReqId += 1; return lastReqId; }



function send(obj){
    websocket.send(JSON.stringify(obj));
}

const waitCallback = [];
function callNext(){
    if (waitCallback.length == 0) return;
    waitCallback[0]();
    waitCallback.splice(0, 1);
}
async function request(obj, timeout=5000){
    return new Promise(function(resolve, reject){
        obj.reqid = newReqId();
        websocket.send(JSON.stringify(obj));
        requestList.push({reqid: obj.reqid, resolve: resolve, reject: reject});
        //setTimeout(reject, timeout, "RequestTimeout");
    });
}
