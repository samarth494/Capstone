const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', require('./models/User').schema);
        
        const sam18 = await User.findOne({ username: 'Sam18' });
        const sam181 = await User.findOne({ username: 'Sam181' });
        
        if (!sam18 || !sam181) {
            console.log("Could not find both users.");
            process.exit(0);
        }

        console.log(`Sam18 ID: ${sam18._id}`);
        console.log(`Sam181 ID: ${sam181._id}`);

        // 1. Remove self from friends
        sam18.friends = sam18.friends.filter(f => f.toString() !== sam18._id.toString());
        sam181.friends = sam181.friends.filter(f => f.toString() !== sam181._id.toString());

        // 2. Ensure they are mutual friends
        if (!sam18.friends.includes(sam181._id)) sam18.friends.push(sam181._id);
        if (!sam181.friends.includes(sam18._id)) sam181.friends.push(sam18._id);

        await sam18.save();
        await sam181.save();
        
        console.log("Cleanup complete. Sam18 and Sam181 are now mutual friends and have no self-links.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
