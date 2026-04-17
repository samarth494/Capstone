const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://codearena:Codearena123@samarth.1o6eaea.mongodb.net/?appName=Samarth';

const userSchema = new mongoose.Schema({ username: String });
const User = mongoose.model('User', userSchema);

async function check() {
    await mongoose.connect(MONGO_URI);
    const count = await User.countDocuments({});
    const users = await User.find({}).limit(50);
    console.log(`Total users: ${count}`);
    users.forEach(u => console.log(`- [${u.username}] ID: ${u._id}`));
    process.exit(0);
}
check();
