const database = require('../utils/database');

module.exports = {
  name: 'listbuzzwords',
  description: 'Lists all buzzwords and their responses',
  feature: 'buzzwordResponse',
  async execute(message, args, client) {
    // Get the buzzword feature
    const buzzwordFeature = client.features.get('buzzwordResponse');
    if (!buzzwordFeature) {
      return message.reply('❌ The buzzword feature is not loaded.');
    }
    
    const data = await database.collection('buzzword');
    const result = await data.findOne({_id: message.guild.id});
    
    // Check if there are any buzzwords
    if (result == null || Object.keys(result).length <= 1) {
      return message.reply('No buzzwords have been added yet.');
    }
    
    // Create the response message
    const listMessage = [];
    listMessage.push('# 📝 Buzzword Responses');
    listMessage.push('');
    
    const userId = message.author.id;
    let userBuzzwordCount = 0;
    // List all buzzwords and their responses
    for (const [word, data] of Object.entries(result)) {
      if (word === '_id') continue;
      const isOwner = data.owner === userId;
      if (isOwner) userBuzzwordCount++;
      listMessage.push(`- **${word}**: ${data.response}${isOwner ? ' (yours)' : ''}`);
    }
    
    // Add note about limits
    listMessage.push('');
    if (message.member.permissions.has('Administrator')) {
      listMessage.push(`You have created ${userBuzzwordCount}`);
    }
    else {
      listMessage.push(`You have created ${userBuzzwordCount}/2 buzzwords.`);
    }
    
    // Send the list
    return message.reply(listMessage.join('\n'));
  },
};