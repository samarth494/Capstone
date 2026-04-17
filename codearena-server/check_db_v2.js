const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://codearena:Codearena123@samarth.1o6eaea.mongodb.net/?appName=Samarth';

const userSchema = new mongoose.Schema({
    username: String,
    friends: [mongoose.Schema.Types.ObjectId]
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        console.log('Connecting to Mongo...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');
        const users = await User.find({}).select('username').lean();
        console.log('--- All Users Found ---');
        users.forEach(u => {
            console.log(`- ${u.username} (${u._id})`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
