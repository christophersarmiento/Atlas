const mongoose = require('mongoose');
const schema = mongoose.Schema;

const guild_schema = new schema({
  id: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
}, {minimize: false});

module.exports = mongoose.model('Guild Settings', guild_schema);