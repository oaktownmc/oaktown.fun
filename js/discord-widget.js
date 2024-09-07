const requestUrl = 'https://discord.com/api/guilds/1109959291999375500/widget.json';

async function getText(file) {
  let x = await fetch(file);
  let y = await x.text();
  const obj = JSON.parse(y);

  const container = document.getElementById("discord-widget");
  const serverElement = document.createElement("div");


  serverElement.innerHTML = `
      <h6>DISCORD SERVER</h6>
      <h2>${obj.name.toUpperCase()}</h2>
      <p><b>Members: ${obj.presence_count}</b></p>
      <p><b>Current Map:</b></p>
      <p><b>Players:</b></p>
      <a href="${obj.name.toUpperCase()}">
        <button>JOIN</button>
      </a>`;

  const connectButton = document.createElement("button");
    connectButton.innerHTML = "Join";
    connectButton.onclick = () => {
        window.open(`${obj.instant_invite}`);
    };

  const memberTable = document.createElement("table")
  memberTable.innerHTML = `
  <table>
  <tr>
      <th>Name</th>
      <th>Score</th>
      <th>Time Played</th>
  </tr>${(player => {
      return `<tr><td>${obj.instant_invite}</td></tr>`;
  }).join("")}`;
  connectButton.appendChild(serverElement);
  
  container.appendChild(serverElement);
}

const txt = getText(requestUrl);

requestJSON(requestUrl);
