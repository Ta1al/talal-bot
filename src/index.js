const
  {
    AkairoClient,
    CommandHandler,
    ListenerHandler,
    InhibitorHandler,
    MongooseProvider
  } = require('discord-akairo'),
  config = require('../config.json'),
  { Schema, model, connect } = require('mongoose');

class BotClient extends AkairoClient {
  constructor() {
    super({
      ownerID: config.owner
    }, {
      messageCacheMaxSize: 50,
      messageCacheLifetime: 18e3,
      messageSweepInterval: 18e3,
      disableMentions: 'everyone',
      presence: config.startupPresence
    });

    this.commandHandler = new CommandHandler(this, {
      directory: './src/commands/',
      prefix: async msg => msg.guild ? await this.settings.get(msg.guild.id, 'prefix', config.prefix) : config.prefix,
      aliasReplacement: /-/g,
      commandUtil: true,
      ignoreCooldown: msg => !msg.member || msg.member.hasPermission('ADMINISTRATOR') || this.isOwner(msg.author),
      ignorePermissions: msg => !msg.member || msg.member.hasPermission('ADMINISTRATOR') || this.isOwner(msg.author),
      argumentDefaults: {
        prompt: Object.assign(config.commandPrompt, {
          modifyStart: (msg, str) => `${msg.author}, ${str}\n\n${config.modifyCommandPrompt.start}`,
          modifyRetry: (msg, str) => `${msg.author}, ${str}\n\n${config.modifyCommandPrompt.retry}`,
          modifyEnded: (msg, str) => `${msg.author}, ${str}`,
          modifyTimeout: (msg, str) => `${msg.author}, ${str}`,
          modifyCancel: (msg, str) => `${msg.author}, ${str}`
        }),
        otherwise: config.strings.ArgumentParsingFailure
      }
    });
    
    
    this.listenerHandler = new ListenerHandler(this, {
      directory: './src/listeners/'
    });
    
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: './src/inhibitors/'
    });
    
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler,
      process
    });

    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();
    this.inhibitorHandler.loadAll();

    const schema = new Schema({
      id: {
        type: String,
        required: true
      },
      settings: {
        type: Object,
        require: true
      }
    }, { minimize: false });

    this.settings = new MongooseProvider(model('model', schema));
    this.functions = require('./functions');
  }

  async login(token) {
    await connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    await this.settings.init();
    console.info('Initialized Database.');
    return super.login(token);
  }

}

const client = new BotClient();
client
  .on('error', err => console.error('Client error:', err))
  .on('warn', info => console.warn('Warning:', info))
  .on('rateLimit', rateLimitInfo => console.warn('Rate limited:', JSON.stringify(rateLimitInfo)))
  .login(process.env.TOKEN).then(() => console.info('Logged in'));