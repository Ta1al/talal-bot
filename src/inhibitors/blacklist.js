const { Inhibitor } = require('discord-akairo');

class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super('blacklist', {
      reason: 'blacklist'
    });
  }

  async exec(msg) {
    return msg.guild ? (await this.client.settings.get(this.client.user.id, 'blacklistedGuilds', [])).includes(msg.guild.id) || (await this.client.settings.get(msg.guild, 'blacklistedUsers', [])).includes(msg.author.id) : (await this.client.settings.get(this.client.user.id, 'blacklistedUsers', [])).includes(msg.author.id);
  }
}

module.exports = BlacklistInhibitor;