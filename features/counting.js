const database = require('../utils/database');

module.exports = {
  name: 'counting',
  description: 'Manages a counting channel where users count up one by one using numbers, Roman numerals, or math expressions',
  featureIcon: '🔢',
  
  async init(client) {
    client.on('messageCreate', (message) => {
      // Load settings and current count from files
      let data = database.load(['counting', message.channelId])

      // Skip if counting channel isn't set or message is in a different channel
      if (data === undefined || message.author.bot) return;
      
      // Get the content of the message
      const content = message.content.trim();
      
      // Try to interpret the content as a number, Roman numeral, or math expression
      let number = null;
      
      // First try to parse as a regular integer
      // Because the math expression already will parse a normal integer, this step isn't needed
      //if (/^\d+$/.test(content)) {
      //  number = parseInt(content);
      //}
      // Try to parse as a Roman numeral
      if (/^[IVXLCDMivxlcdm]+$/.test(content)) {
        number = this.parseRomanNumeral(content);
      }
      // Try to evaluate as a math expression
      else if (/^[\d\s+\-*\/().OoXx\[A-Fa-f\]]+$/.test(content)) {
        try {
          number = this.evaluateMathExpression(content);
        } catch (error) {
          // Invalid math expression
          number = null;
        }
      }
      
      // If we couldn't parse as any valid format, don't react
      if (number === null) {
        return;
      }

      //const currentCount = data.currentCount;
      //const lastUserId = data.lastUserId;
      
      // Check if the same user is trying to count twice in a row
      if (message.author.id === data.lastUserId) {
        message.react('❌');
        message.channel.send(`<@${message.author.id}> tried to count twice in a row! The count has been reset from ${data.currentCount} to 0.`);
        
        try {
            const guild = message.guild;
            const member = guild.members.cache.get(message.author.id);
            
            if (member) {
              const nickname = member.nickname || member.user.username;
              message.channel.send(`${nickname} ruined it for everyone!`);
            }
          } catch (error) {
            console.error('Error getting member nickname:', error);
        }
        // Reset the count after sending the message
        this.resetCount(message.channel.id)
        return;
      }
      
      // Check if the number is the next in sequence
      if (number === data.currentCount + 1) {
        data.currentCount = number;
        data.lastUserId = lastUserId;
        database.save(['counting', message.channel.id], data);
        message.react('✅');
      } else {
        message.react('❌');
        message.channel.send(`Counting failed! The number was ${number} but should have been ${data.currentCount + 1}. Starting over from 0.`);
        
        // Get the user who messed up and use their nickname if available
        try {
          const guild = message.guild;
          const member = guild.members.cache.get(message.author.id);
          
          if (member) {
            const nickname = member.nickname || member.user.username;
            message.channel.send(`${nickname} ruined it for everyone!`);
          }
        } catch (error) {
          console.error('Error getting member nickname:', error);
        }
        
        // Reset the count after sending the message
        this.resetCount(message.channel.id)
      }
    });
    
    console.log('Counting feature initialized');
  },
  
  // Parse Roman numeral to integer
  parseRomanNumeral(str) {
    const romanStr = str.toUpperCase();
    const romanMap = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000
    };
    
    let result = 0;
    let i = 0;
    
    while (i < romanStr.length) {
      // Get current and next values
      const current = romanMap[romanStr[i]];
      const next = i + 1 < romanStr.length ? romanMap[romanStr[i + 1]] : 0;
      
      // If current is greater than or equal to next, add current
      if (current >= next) {
        result += current;
        i++;
      } 
      // If current is less than next, subtract current from next and add
      else {
        result += (next - current);
        i += 2;
      }
    }
    
    return result;
  },
  
  // Evaluate math expressions
  evaluateMathExpression(expr) {
    try {
      // Use Function constructor to safely evaluate the expression
      const sanitizedExpr = expr.replace(/\s+/g, ''); // Remove all spaces
      const result = new Function(`return ${sanitizedExpr}`)();
      
      // Check if result is a valid number and an integer
      if (isNaN(result) || !isFinite(result) || !Number.isInteger(result)) {
        return null;
      }
      
      return result;
    } catch (error) {
      return null;
    }
  },

  resetCount(channelId) {
    database.save(['counting', channelId], {currentCount: 0, lastUserId: null})
  },
  
  setCountingChannel(channelId) {
    let data = database.load(['counting']);
    const channelExists = (channelId in data)
    if (!channelExists) {
      data[channelId] = {currentCount: 0, lastUserId: null};
    }

    else {
      data[channelId] = undefined;
    }
    database.save(['counting'], data);
    return !channelExists;
  },
};