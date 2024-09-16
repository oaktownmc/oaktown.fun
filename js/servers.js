
/// Convert from degrees to radians.
Math.radians = (degrees) => degrees * Math.PI / 180;

/// Convert from radians to degrees.
Math.degrees = (radians) => radians * 180 / Math.PI;

// static canvas generator
let overlayImage = new Image();
overlayImage.src = "/assets/oaktown.png";

const [WIDTH, HEIGHT] = [480, 270];
const SCALE_FACTOR = 0.5;

// shouldDrawStatic is a function that returns a boolean 
function doServerStatic(img, can, shouldDrawStatic = () => true) {
    const rotation = Math.random() * (Math.PI / 4) - Math.radians(45 / 2);
    
    can.width = WIDTH;
    can.height = HEIGHT;

    //img.width = WIDTH;
    //img.height = HEIGHT;
    
    img.insertAdjacentElement("afterend", can);
    
    let ctx = can.getContext("2d", { alpha: false });       // context without alpha channel.
    let idata = ctx.createImageData(can.width, can.height); // create image data
    let buffer32 = new Uint32Array(idata.data.buffer);  // get 32-bit view
    
    function resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // draw a debug crosshair
    function drawCrosshair(ctx) {
        let middleX = can.width / 2;
        let middleY = can.height / 2;
        
        ctx.lineWidth = 5;
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
    
    function circle(ctx, x, y, radius) {
        ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI, false);
    }
    
    function frame() {
        requestAnimationFrame(frame);
        if (!shouldDrawStatic()) {
            can.style.display = "none";
            img.style.display = "";
            return;
        }
        
        // Clear the canvas before drawing
        ctx.clearRect(0, 0, can.width, can.height);    
        
        noise(ctx);

        // center of canvas
        let centerX = can.width / 2;
        let centerY = can.height / 2;
        
        // scaled size
        let scaledW = overlayImage.width * Math.pow(SCALE_FACTOR, 2);
        let scaledH = overlayImage.height * Math.pow(SCALE_FACTOR, 2);
        
        // center for drawing the image
        let imgX = -scaledW / 2;
        let imgY = -scaledH / 2;

        ctx.save();
        {
            ctx.globalCompositeOperation = "multiply";
            ctx.filter = "grayscale(100%)";
            
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            
            ctx.drawImage(
                overlayImage,
                
                imgX,
                imgY,
                scaledW,
                scaledH
            );
        }
        ctx.restore();

        //drawCrosshair(ctx);

        can.style.display = "";
        img.style.display = "none";
    }
    
    frame();
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

function serverButton(parent, content, href = "") {
    let ret = document.createElement("button");
    ret.classList.add("serverButton", "serverInfo");
    ret.style.width = "100%";
    ret.textContent = content;
    ret.draggable = false;
    
    let isEmpty = !(href.trim());

    if (!isEmpty) {
        console.log(ret);
        // since we switched from 'a' to 'button', we can't use href
        ret.onclick = (event) => {
            window.location.href = href;
        };
    }

    parent.appendChild(ret);
    return ret;
}

function serverStatusText(parent, content) {
    let ret = document.createElement("span");
    ret.classList.add("serverStatusText");
    ret.textContent = content;

    parent.appendChild(ret);
    return ret;
}

function setStatusIndicator(element, online) {
    if (online) {
        element.src = `${resources}/status/online.png`;
        element.alt = "[online]";
        element.title = "This server is online, come on in!";
    } else {
        element.src = `${resources}/status/offline.png`;
        element.alt = "[offline]";
        element.title = "This server is offline, check back later!";
    }
}

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
    
    let shouldDrawStatic = { value: true };
    
    // populate entry with temp info
    // REDCHANIT: hide server info button if motd doesn't exist
    
    // server title div
    
    let elTitle = document.createElement("div");
    elTitle.classList.add("serverTitle");


    let elStatus = document.createElement("img");
    elStatus.classList.add("serverStatus");
    setStatusIndicator(elStatus, false);
    elStatus.draggable = false;
    elTitle.appendChild(elStatus);

    let elGame = document.createElement("img");
    elGame.classList.add("serverGame");
    elGame.src = `${resources}/games/${serverGame}.png`;
    elGame.onerror = (event) => {
        this.onerror = null;
        this.src = `${resources}/games/unknown.png`;
    };
    elGame.draggable = false;
    elTitle.appendChild(elGame);

    let elTitleText = document.createElement("div");
    elTitleText.textContent = serverName;
    elTitle.appendChild(elTitleText);

    // server content

    let elServerContent = document.createElement("div");
    elServerContent.classList.add("serverContent");

    
    let elServerThumb = document.createElement("img");
    elServerThumb.classList.add("serverMap");
    elServerThumb.draggable = false;
    elServerContent.appendChild(elServerThumb);

    let elServerCanvas = document.createElement("canvas");
    elServerCanvas.classList.add("serverMap");
    elServerContent.appendChild(elServerCanvas);

    let elServerMapName = document.createElement("div");
    elServerMapName.classList.add("serverMapName");
    elServerMapName.innerHTML = `<b>Map:</b> <span id="param">---</span>`;
    elServerContent.appendChild(elServerMapName);

    let elServerPlayers = document.createElement("div");
    elServerPlayers.classList.add("serverPlayers");
    elServerPlayers.innerHTML = `<b>Players:</b> <span id="param">---</span>`;
    elServerContent.appendChild(elServerPlayers);
    
    // server buttons
    let elServerButtons = document.createElement("div");
    elServerButtons.classList.add("serverButtons");

    serverStatusText(elServerButtons, "Loading...");

    // append

    serverElement.appendChild(elTitle);
    serverElement.appendChild(elServerContent);
    serverElement.appendChild(elServerButtons);

    // static effect

    doServerStatic(
        elServerThumb, // thumbnail
        elServerCanvas, // canvas
        () => shouldDrawStatic.value, // draw static
    );
    
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
    // get default data for server
    let server = serverList.filter((item) => !!(item.id === serverId))[0];
    const serverElement = document.getElementById(serverId);
    let serverButtons = serverElement.querySelector(".serverButtons");

    if (data.error) {
        console.warn(`could not fetch data for ${server.game} server ${server.ip}.`);
        serverButtons.innerHTML = "";
        serverStatusText(serverButtons, "Could not reach server!");
        return;
    }
    // REDCHANIT: regex for quake3
    const serverMap = (serverOverrideMap ? serverOverrideMap : data.currentMap.replace(/^(?<=)game\/mp\/*/, ""));
    const canConnect = steamGames.includes(serverGame);

    
    // set updated server info
    // server returned data, so it's online
    setStatusIndicator(serverElement.querySelector(".serverStatus"), true);
    
    serverElement.querySelector(".serverStatus").classList.add("asyncImage");
    serverElement.querySelector(".serverMap").dataset.src = `${resources}/maps/${serverGame}/${serverMap}.png`;
    
    serverElement.querySelector(".serverMapName #param").textContent = serverMap;
    serverElement.querySelector(".serverMapName").title = serverMap;
    
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
    serverElement.querySelector(".serverPlayers #param").textContent = `${data.numHumans}/${data.maxClients}${numOfBots}`;
    serverElement.querySelector(".serverPlayers").title = playerListTable;

    if (data.numHumans > 0) {
        serverElement.querySelector(".serverPlayers").classList.add("tooltip");
    }
    
    // server buttons, done a little differently because of how dynamic they can be
    // servers that host a Steam game will replace the copy ip button with a connect button
    // REDCHANIT: hide server info button if motd doesn't exist
    serverButtons.innerHTML = "";

    // connect button
    if (canConnect)
        serverButton(serverButtons, "Connect", `steam://connect/${data.serverIP}`);

    // copy ip button
    let copyButton = serverButton(serverButtons, "Copy IP");
    copyButton.onclick = (event) => {
        let ip = data.serverIP;
        if (!window.navigator.clipboard) {
            window.prompt(
                "Because Javascript is stupid, it does not allow the website " +
                "to copy text if you are on an insecure origin, so please copy " +
                "the text below.",
                
                ip
            );
        }
        window.navigator.clipboard.writeText(ip);
    };

    if (serverDynmap)
        serverButton(serverButtons, "View Dynmap", serverDynmap);

    if (serverMotd)
        serverButton(serverButtons, "View MOTD", serverMotd);
    
    // asynchronously load map images, not replacing if they can't be found
    (() => {
        "use strict";
        const mapElement = serverElement.querySelector(".serverMap");
        
        let img = new Image();
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