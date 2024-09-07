// list of servers
const serverList = [
	{
		"id": "pf2Sandbox",
		"name": "OAK TOWN | PF2 SANDBOX",
		"ip": "132.226.51.90:27015",
		"game": "hl2dm",
		"overrideGame": "pf2"
	},
	{
		"id": "teamFortress2",
		"name": "OAK TOWN | TF2",
		"ip": "45.20.117.13:49872",
		"game": "tf2"
	},
	{
		"id": "garrysMod",
		"name": "OAK TOWN | GARRYS MOD",
		"ip": "45.20.117.13:28026",
		"game": "hl2dm",
		"overrideGame": "gmod"
	},
	{
		"id": "minecraftSurvival",
		"name": "OAK TOWN | SURVIVAL",
		"ip": "45.20.117.13:25565",
		"overrideMap": "oaktown",
		"game": "minecraft"
	},
	{
		"id": "minecraftAnarchy",
		"name": "OAK TOWN | ANARCHY",
		"ip": "45.20.117.13:25566",
		"overrideMap": "oaktown_anarchy",
		"game": "minecraft"
	},
	{
		"id": "minecraftCreative",
		"name": "OAK TOWN | CREATIVE",
		"ip": "45.20.117.13:25567",
		"overrideMap": "oaktown_creative",
		"game": "minecraft"
	},
	{
		"id": "minecraftCreate",
		"name": "OAK TOWN | CREATE MOD",
		"ip": "45.20.117.13:18754",
		"overrideMap": "oaktown_create",
		"game": "minecraft"
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
var resources = "../resources";

// preload images
new Image().src = resources+"/status/offline.png";
new Image().src = resources+"/status/online.png";
new Image().src = resources+"/games/unknown.png";
new Image().src = resources+"/maps/unknown.png";

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

	container.appendChild(serverElement);

	// fetch server data from api
	const url = `https://api.raccoonlagoon.com/v1/server-info?ip=${serverIp}&g=${server.game}`;
	fetch(url)
		.then(response => response.json())
		.then(data => displayServerData(data, serverId, serverGame, serverMotd, serverOverrideMap, serverDynmap))
		.catch(error => console.error("Error fetching server data:", error));
}

// display server data once fetched
function displayServerData(data, serverId, serverGame, serverMotd, serverOverrideMap, serverDynmap) {
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
		const img = new Image();
		img.src = mapElement.dataset.src;
		img.onload = () => {
			mapElement.classList.remove('asyncImage');
			mapElement.src = mapElement.dataset.src;
		};
	})();
}