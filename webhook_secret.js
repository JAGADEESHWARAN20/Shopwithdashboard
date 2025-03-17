const crypto = require('crypto');
const webhookSecret = crypto.randomBytes(32).toString('hex');
console.log(webhookSecret)