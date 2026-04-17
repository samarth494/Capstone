const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');

dotenv.config();

const resetPassword = async (username, newPassword) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const result = await User.findOneAndUpdate(
            { $or: [{ username: username }, { username: username.toLowerCase() }] },
            { password: hashedPassword },
            { new: true }
        );
        
        if (result) {
            console.log(`Successfully reset password for ${result.username} (${result.email})`);
        } else {
            console.log(`User ${username} not found in database.`);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword('Sam18', '123456');
