const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        }));
        
        const users = await User.find({});
        console.log("Found Users:");
        users.forEach(u => {
            console.log(`- ${u.username} (ID: ${u._id})`);
            console.log(`  Friends: ${u.friends.join(', ')}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
