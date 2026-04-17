const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('.env'));
for (const k in envConfig) process.env[k] = envConfig[k];

async function debug() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await mongoose.connection.db.collection('users').find({
        username: { $in: [/Sam18/i, /San18/i] }
    }).toArray();
    
    console.log("DEBUG USERS FOUND:");
    users.forEach(u => {
        console.log(`- Username: [${u.username}]`);
        console.log(`  ID: ${u._id}`);
        console.log(`  Friends: ${JSON.stringify(u.friends)}`);
    });
    process.exit(0);
}

debug();
