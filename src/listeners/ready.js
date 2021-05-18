const { Listener } = require('discord-akairo'), config = require('../../config.json');

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  async exec() {
    console.log(`${this.client.user.tag} is ready to serve!`);
    return await this.client.user.setPresence(config.readyPresence);
  }
}

module.exports = ReadyListener;