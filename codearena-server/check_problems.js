const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://codearena:Codearena123@samarth.1o6eaea.mongodb.net/?appName=Samarth';

const problemSchema = new mongoose.Schema({
    title: String,
    slug: String
});

const Problem = mongoose.model('Problem', problemSchema);

async function checkProblems() {
    try {
        console.log('Connecting to Mongo...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');
        const count = await Problem.countDocuments();
        console.log(`Total Problems found: ${count}`);
        
        if (count > 0) {
            const problems = await Problem.find({}).limit(5).select('title slug').lean();
            console.log('--- Sample Problems ---');
            problems.forEach(p => {
                console.log(`- ${p.title} (${p._id})`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkProblems();
