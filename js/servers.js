// static canvas generator
let overlayImage = new Image();
overlayImage.src = "/assets/oaktown.png";

const fps = 10;
const interval = 1000 / fps;

const [WIDTH, HEIGHT] = [720, 480];

/// Convert from degrees to radians.
Math.radians = (degrees) => degrees * Math.PI / 180;

/// Convert from radians to degrees.
Math.degrees = (radians) => radians * 180 / Math.PI;

// shouldDrawStatic is a function that returns a boolean 
async function doServerStatic(img, shouldDrawStatic = () => true) {
    const rotation = Math.random() * (Math.PI / 4) - Math.radians(45 / 2);
    let can = document.createElement("canvas");
    
    let imageRendering = "pixelated";
    
    can.width = WIDTH;
    can.height = HEIGHT;
    
    img.width = WIDTH;
    img.height = HEIGHT;
    
    //can.style.imageRendering = imageRendering;
    //img.style.imageRendering = imageRendering;
    
    let ctx = can.getContext("2d", { alpha: false });       // context without alpha channel.
    let idata = ctx.createImageData(can.width, can.height); // create image data
    let buffer32 = new Uint32Array(idata.data.buffer);  // get 32-bit view
    
    function resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // draw a debug crosshair
    function drawCrossHair(ctx) {
        let middleX = can.width / 2;
        let middleY = can.height / 2;
        
        ctx.lineWidth = 15;
        ctx.strokeStyle = "red";
        
        // horizontal
        ctx.beginPath();
        ctx.moveTo(0, middleY);
        ctx.lineTo(can.width, middleY);
        ctx.stroke();
        
        // vertical
        ctx.beginPath();
        ctx.moveTo(middleX, 0);
        ctx.lineTo(middleX, can.height);
        ctx.stroke();
    }
    
    function noise(ctx) {
        let len = buffer32.length;
        while(len--) buffer32[len] = Math.random() < 0.5 ? 0 : -1>>0;
        ctx.putImageData(idata, 0, 0);
    }
    
    setInterval(() => {
        if (!shouldDrawStatic()) return;
        noise(ctx);
        
        const scale = 0.5;
        
        let imgX = can.width / 2;
        let imgY = can.height / 2;
        
        ctx.translate(imgX, imgY);
        ctx.rotate(rotation);
        ctx.translate(-imgX, -imgY);
        
        ctx.globalCompositeOperation = "multiply";
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(overlayImage, imgX * scale, imgY * scale, can.width * scale, can.height * scale);
        
        resetTransform(ctx);
        
        //drawCrossHair(ctx);
        
        img.src = can.toDataURL();
    }, interval);
}

function checkIfImageExists(url, callback) {
    const img = new Image();
    img.src = url;
    
    if (img.complete) {
        callback(true);
    } else {
        img.onload = () => {
            callback(true);
        };
        
        img.onerror = () => {
            callback(false);
        };
    }
}

// server fetching part

// list of servers
const serverList = [
    {
        id: "pf2Sandbox",
        name: "OAK TOWN | PF2 SANDBOX",
        ip: "132.226.51.90:27015",
        game: "hl2dm",
        overrideGame: "pf2"
    },
    {
        id: "teamFortress2",
        name: "OAK TOWN | TF2",
        ip: "45.20.117.13:49872",
        game: "tf2"
    },
    {
        id: "garrysMod",
        name: "OAK TOWN | GARRYS MOD",
        ip: "45.20.117.13:28026",
        game: "hl2dm",
        overrideGame: "gmod"
    },
    {
        id: "minecraftSurvival",
        name: "OAK TOWN | SURVIVAL",
        ip: "45.20.117.13:25565",
        overrideMap: "oaktown",
        game: "minecraft"
    },
    {
        id: "minecraftAnarchy",
        name: "OAK TOWN | ANARCHY",
        ip: "45.20.117.13:25566",
        overrideMap: "oaktown_anarchy",
        game: "minecraft"
    },
    {
        id: "minecraftCreative",
        name: "OAK TOWN | CREATIVE",
        ip: "45.20.117.13:25567",
        overrideMap: "oaktown_creative",
        game: "minecraft"
    },
    {
        id: "minecraftCreate",
        name: "OAK TOWN | CREATE MOD",
        ip: "45.20.117.13:18754",
        overrideMap: "oaktown_create",
        game: "minecraft"
    },
];

// list of Steam games
const steamGames = [
    "tf2",
    "tf2classic",
    "of",
    "pf2",
    "tfport",
    "goonsquad",
    "tfc",
    "hldm",
    "dmc",
    "svencoop",
    "gmod"
];

// general variables
var resources = "/resources";

// preload images
new Image().src = resources+"/status/offline.png";
new Image().src = resources+"/status/online.png";
new Image().src = resources+"/games/unknown.png";

// loop through every server
document.addEventListener('DOMContentLoaded', (event) => {
    serverList.forEach(server => listServer(server));
});

// generate dummy server entries
function listServer(server) {
    // for dummy entry
    const serverId = server.id;
    const serverName = server.name;
    const serverGame = server.overrideGame ? server.overrideGame : server.game;
    // REDCHANIT: motd handling
    const serverMotd = server.motd;
    
    // jotting down now, displaying later
    const serverIp = server.ip;
    const serverOverrideMap = server.overrideMap;
    const serverDynmap = server.dynmap;
    
    // create entry element
    const container = document.getElementById("servers");
    const serverElement = document.createElement("div");
    serverElement.id = serverId;
    serverElement.className = "server";
    
    // populate entry with temp info
    // REDCHANIT: hide server info button if motd doesn't exist
    serverElement.innerHTML =
    `
		<div class="serverTitle">
			<img class="serverStatus" src="${resources}/status/offline.png" draggable="false" />
			<img class="serverGame" src="${resources}/games/${serverGame}.png" onerror="this.onerror=null; this.src='${resources}/games/unknown.png';" draggable="false" />
			<div>${serverName}</div>
		</div>
		
		<div class="serverContent">
			<img class="serverMap" src="${resources}/maps/unknown.png" draggable="false" />
			<div class="serverMapName"><b>Map:</b> ---</div>
			<div class="serverPlayers"><b>Players:</b> ---</div>
		</div>
    
		<div class="serverButtons">
			${serverMotd ? `<a href="${serverMotd}" class="serverButton serverInfo" style="width:100%;" draggable="false"><div class="info"></div></a>` : `<a class="serverButton serverInfo" style="width:100%;" draggable="false">...</a>`}
		</div>
	`
    
    let shouldDrawStatic = { value: true };
    
    doServerStatic(serverElement.querySelector("div.serverContent img"), () => shouldDrawStatic.value);
    
    container.appendChild(serverElement);
    
    // fetch server data from api
    const url = `https://api.raccoonlagoon.com/v1/server-info?ip=${serverIp}&g=${server.game}`;
    fetch(url)
    .then(response => response.json())
    .then(data => displayServerData(data, serverId, serverGame, serverMotd, serverOverrideMap, serverDynmap, shouldDrawStatic))
    .catch(error => console.error("Error fetching server data:", error));
}

// display server data once fetched
function displayServerData(data, serverId, serverGame, serverMotd, serverOverrideMap, serverDynmap, shouldDrawStatic) {
    // REDCHANIT: regex for quake3
    const serverMap = (serverOverrideMap ? serverOverrideMap : data.currentMap.replace(/^(?<=)game\/mp\/*/, ""));
    const serverElement = document.getElementById(serverId);
    const canConnect = steamGames.includes(serverGame);
    
    // set updated server info
    // server returned data, so it's online
    serverElement.getElementsByClassName("serverStatus")[0].src = resources+"/status/online.png";
    
    serverElement.getElementsByClassName("serverStatus")[0].classList.add("asyncImage");
    serverElement.getElementsByClassName("serverMap")[0].dataset.src = resources+"/maps/"+serverGame+"/"+serverMap+".png";
    
    serverElement.getElementsByClassName("serverMapName")[0].innerHTML = "<b>Map:</b> "+serverMap;
    serverElement.getElementsByClassName("serverMapName")[0].title = serverMap;
    
    // server player list
    // only show the table if there are players
    const playerListTable = data.humanData.length > 0 ?
    `${data.humanData.map(player => {
        return `${player.name}`;
    }).join("\n")}` : "";
    
    // only show bots if there are any
    const numOfBots = data.numBots > 0 ? ` (${data.numBots} Bots)` : "";
    // player count, hovering when players are online shows a list
    // TODO: title attribute not mobile friendly
    serverElement.getElementsByClassName("serverPlayers")[0].innerHTML = "<b>Players:</b> "+data.numHumans+"/"+data.maxClients+" "+numOfBots;
    serverElement.getElementsByClassName("serverPlayers")[0].title = playerListTable;
    if (data.numHumans > 0) {
        serverElement.getElementsByClassName("serverPlayers")[0].classList.add("tooltip");
    }
    
    // server buttons, done a little differently because of how dynamic they can be
    // servers that host a Steam game will replace the copy ip button with a connect button
    // REDCHANIT: hide server info button if motd doesn't exist
    serverElement.getElementsByClassName("serverButtons")[0].innerHTML =
    `
    <a ${canConnect ? `href="steam://connect/${data.serverIP}"` : ""} ${canConnect ? "" : `onclick="navigator.clipboard.writeText('${data.serverIP}');"`} class="serverButton serverConnect" draggable="false">${canConnect ? "Connect" : "Copy IP"}</a>
    ${serverDynmap ? `<a href="${serverDynmap}" class="serverButton serverDynmap" draggable="false"><div class="dynmap"></div></a>` : ""}
    ${serverMotd ? `<a href="${serverMotd}" class="serverButton serverInfo" draggable="false"><div class="info"></div></a>` : ""}
	`;
    // asynchronously load map images, not replacing if they can't be found
    (() => {
        "use strict";
        const mapElement = serverElement.getElementsByClassName("serverMap")[0];
        
        let img = new Image()
        img.src = mapElement.dataset.src;
        let imageChecked = false;
        
        img.onload = () => {
            const interval = () => {
                if (!imageChecked)
                    checkIfImageExists(mapElement.dataset.src, (exists) => {
                        shouldDrawStatic.value = !exists;
                        if (exists) {
                            mapElement.classList.remove('asyncImage');
                            mapElement.src = mapElement.dataset.src;
                        }
                        imageChecked = true;
                    });
            };
            interval();
            setInterval(interval, 10000);
        };
    })();
}