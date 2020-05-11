const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    roomId: { type: String, required: true },
    windowId: { type: String, required: true },
    path: { type: String, required: true},
    mimetype: { type: String, required: true },
});

schema.index({'roomId': 1, 'windowId': 1}, {unique: true});
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Image', schema);