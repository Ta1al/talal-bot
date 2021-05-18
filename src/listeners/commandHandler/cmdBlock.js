const { Listener } = require('discord-akairo'), config = require('../../../config.json');
class cmdErrorListener extends Listener {
  constructor() {
    super('cmdBlocked', {
      emitter: 'commandHandler',
      category: 'commandHandler',
      event: 'commandBlocked'
    });
  }

  exec(msg, _, reason) {
    return msg.reply(config.strings.commandBlocked[reason]).catch();
  }
}

module.exports = cmdErrorListener;