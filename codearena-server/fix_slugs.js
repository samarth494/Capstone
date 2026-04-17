const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://codearena:Codearena123@samarth.1o6eaea.mongodb.net/?appName=Samarth';

async function fixSlugs() {
    try {
        console.log('Connecting to Mongo...');
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        
        const r1 = await db.collection('problems').updateOne(
            { title: 'Hello World' }, 
            { $set: { slug: 'hello-world' } }
        );
        console.log(`Updated Hello World: ${r1.modifiedCount}`);

        const r2 = await db.collection('problems').updateOne(
            { title: 'Sum of Two Numbers' }, 
            { $set: { slug: 'sum-two-numbers' } }
        );
        console.log(`Updated Sum of Two Numbers: ${r2.modifiedCount}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixSlugs();
