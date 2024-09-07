'use strict';
window.addEventListener('load', () => {
    for (let widget of document.getElementsByTagName('discord-widget')) {
        let id = widget.getAttribute('id') ?? null;
        let width = widget.getAttribute('width') ?? '350px';
        let height = widget.getAttribute('height') ?? '500px';
        let footerText = widget.getAttribute('footerText') ?? '';
        let color = widget.getAttribute('color') ?? '#5865f2';
        let backgroundColor = widget.getAttribute('backgroundColor') ?? '#0c0c0d';
        let textColor = widget.getAttribute('textColor') ?? '#fff';
        let statusColor = widget.getAttribute('statusColor') ?? '#858585';
        let head = document.createElement('widget-header');
        let logo = document.createElement('widget-logo');
        let count = document.createElement('widget-header-count');
        head.append(logo, count);
        let body = document.createElement('widget-body');
        if (!id) body.innerHTML = 'No Discord server ID was specified.';
        let footer = document.createElement('widget-footer');
        let footerInfo = document.createElement('widget-footer-info');
        let joinButton = document.createElement('widget-button-join');
        joinButton.addEventListener('click', (e) => {
            if (joinButton.getAttribute('href')) {
                window.open(joinButton.getAttribute('href') || '', joinButton.getAttribute('target') || '', '');
            }
        });
        footerInfo.innerText = footerText;
        joinButton.innerText = 'Join';
        footer.append(footerInfo, joinButton);
        widget.innerHTML = '<link rel="stylesheet" href="widget/discordWidget.css">';
        widget.style.height = height;
        widget.style.width = width;
        widget.style.setProperty('--color', color);
        widget.style.setProperty('--bgColor', backgroundColor);
        widget.style.setProperty('--textColor', textColor);
        widget.style.setProperty('--buttonColor', `#${LDColor(color.replace('#',''),-10)}`);
        widget.style.setProperty('--statusColor', statusColor);
        widget.append(head, body, footer);
        fetch(`https://discord.com/api/guilds/${id}/widget.json`).then((data) => {
            data.json().then((data) => {
                count.innerHTML = `<strong>${data.presence_count||0}</strong> Members Online`;
                joinButton.setAttribute('href', data.instant_invite);
                joinButton.setAttribute('target', '_blank');
                if (data.instant_invite === null || data.instant_invite === undefined) joinButton.remove();
                data.members.forEach((user) => {
                    let member = document.createElement('widget-member');
                    let avatar = document.createElement('widget-member-avatar');
                    let avatarIMG = document.createElement('img');
                    let status = document.createElement(`widget-member-status-${user.status}`);
                    let name = document.createElement('widget-member-name');
                    let statusText = document.createElement('widget-member-status-text');
                    avatarIMG.src = user.avatar_url;
                    status.classList.add('widget-member-status');
                    name.innerText = user.username;
                    if (user.game) {
                        statusText.innerText = user.game.name;
                    }
                    avatar.append(avatarIMG, status);
                    member.append(avatar, name, statusText);
                    body.append(member);
                });
            });
        });
    }
});

function LDColor(color, percent) {
    let num = parseInt(color, 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let B = ((num >> 8) & 0x00ff) + amt;
    let G = (num & 0x0000ff) + amt;
    return (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
}