const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Manual dotenv loading to avoid dependencies if possible
const fs = require('fs');
if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function listAllUsernames() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log("=== USER LIST ===");
        users.forEach(u => {
            console.log(`Username: "${u.username}" | ID: ${u._id}`);
            console.log(`Friends IDs: ${JSON.stringify(u.friends)}`);
            console.log("-----------------");
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listAllUsernames();
