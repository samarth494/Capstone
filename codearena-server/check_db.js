const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function checkUsers() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).select('username friends friendRequests').lean();
        console.log('--- Users ---');
        users.forEach(u => {
            console.log(`User: ${u.username} (_id: ${u._id})`);
            console.log(`  Friends: ${u.friends.length} -> ${u.friends.join(', ')}`);
            console.log(`  Requests: ${u.friendRequests.length}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
