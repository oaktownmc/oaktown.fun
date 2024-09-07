const servers = [
    // OAK servers :D
    ["45.20.117.13:25566", "minecraft"],
    //["45.20.117.13:7777", "terraria"],
    ["45.20.117.13:25567", "minecraft"],
    ["45.20.117.13:25565", "minecraft"],
    ["45.20.117.13:18754", "minecraft"],
    ["132.226.51.90:27015", "hl2dm"],
    ["45.20.117.13:28026", "hl2dm"],
    ["45.20.117.13:49872", "tf2"]
  ];

function fetchServerData(server) {
    const serverAddress = server[0]
    const serverGame = server[1]
    const url = `https://api.raccoonlagoon.com/v1/server-info?ip=${serverAddress}&g=${serverGame}`;
    serverElement = document.createElement("div")
    fetch(url)
        .then(response => response.json())
        .then(data => displayServerData(data, server[1]))
        .catch(error => console.error("Error fetching server data:", error));
}

function htmlSanitize(str) {
    let ret = String(str)
        .replace("&", "&amp;")    
        .replace("<", "&lt;")
        .replace(">", "&gt;");
    return ret
}

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

function convertTime(time) {
    const days = Math.floor(time / SECONDS_IN_DAY);
    const hours = Math.floor((time % SECONDS_IN_DAY) / SECONDS_IN_HOUR);
    const minutes = Math.floor((time % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
    const seconds = Math.floor(time % SECONDS_IN_MINUTE);

    let formattedTime = "";

    // only show applicable time units
    if (days > 0) formattedTime += `${days}d `;
    if (hours > 0) formattedTime += `${hours}h `;
    if (minutes > 0 || hours > 0) formattedTime += `${minutes}m `;

    formattedTime += `${seconds.toString()}s`; // add seconds
    return formattedTime; // return formatted time string
}

function displayServerData(data, game) {
    console.log(game)
    const container = document.getElementById("servers");
    const serverElement = document.createElement("div");

    
    const cleanServerName = data.serverName?.replace(/ï¿½./g, "");
    
    const stringifiedBots = data.numBots > 0 ? ` (${data.numBots} bots)` : "";
    
    const playerMapFunc = player => {
        return `<tr><td>${player.name}</td><td>${player.score}</td><td>${convertTime(player.time)}</td></tr>`;
    };
    
    const playerListTable = data.numHumans > 0 ? `
    <table id="playerListTable">
    <tr>
    <th>Name</th>
    <th>Score</th>
    <th>Time Played</th>
    </tr>
    ${data.humanData.map(playerMapFunc).join("")}
    </table>` : "";
    
    serverElement.style.position = "relative";
    
    // only show button if server isnt full & server isn't minecraft
    const connectButton = document.createElement("button");
    connectButton.textContent = "Connect";
    connectButton.style.position = 'absolute';
    connectButton.style.right = '0px';
    connectButton.style.bottom = '0px';
    let title = '';
    if (game !== "minecraft" && data.numHumans < data.maxClients) {
        title = `steam://connect/${data.serverIP}`;
        connectButton.onclick = () => {
            window.open(title);
        };
    } else {
        connectButton.disabled = true;
        title = "Connecting is disabled for unsupported games, please connect manually.";
    }
    connectButton.title = title;
    
    serverElement.innerHTML = `
    <h5>${htmlSanitize(game.toUpperCase())} SERVER</h5>
    <b><h3>${htmlSanitize(cleanServerName)}</h3></b>
    <p><b>IP:</b> ${htmlSanitize(data.serverIP)}</p>
    <p><b>Current Map:</b> ${htmlSanitize(data.currentMap)}</p>
    <p><b>Players:</b> ${htmlSanitize(data.numHumans)}/${htmlSanitize(data.maxClients)} ${htmlSanitize(stringifiedBots)}</p>
    ${playerListTable}
    <br><br>
    `;
    
    serverElement.appendChild(connectButton);
    container.appendChild(serverElement);
}

servers.forEach(server => fetchServerData(server));
