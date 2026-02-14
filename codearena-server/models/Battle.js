const mongoose = require('mongoose');

const battleSchema = mongoose.Schema({
    battleId: {
        type: String,
        required: true,
        unique: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    problemId: {
        type: String, // Currently using mock titles/IDs like 'two-sum'
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'ended', 'timeout'],
        default: 'active'
    },
    events: [{
        type: { type: String, enum: ['code_update', 'submission'] },
        playerId: mongoose.Schema.Types.ObjectId,
        timestamp: Number, // ms offset from startTime
        data: mongoose.Schema.Types.Mixed
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Battle', battleSchema);
