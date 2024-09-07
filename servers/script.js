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

    const numOfBots = data.numBots > 0 ? ` (${data.numBots} bots)` : "";

    // only show button if server isnt full & server isn't minecraft
    const connectButton = document.createElement("button");
    connectButton.textContent = "Connect";
    if (game !== "minecraft" && data.numHumans < data.maxClients) {
        connectButton.onclick = () => {
            window.open(`steam://connect/${data.serverIP}`);
        };
    } else {
        connectButton.disabled = true;
        connectButton.title = "Connecting is disabled for unsupported games, please connect manually.";
    }
    serverElement.innerHTML = `
        <h6>${game.toUpperCase()} SERVER</h6>
        <h2>${cleanServerName}</h2>
        <p><b>IP:</b> ${data.serverIP}</p>
        <p><b>Current Map:</b> ${data.currentMap}</p>
        <p><b>Players:</b> ${data.numHumans}/${data.maxClients} ${numOfBots}</p>
        ${playerListTable}
    `;
    serverElement.appendChild(connectButton);


    container.appendChild(serverElement);
}

servers.forEach(server => fetchServerData(server));
