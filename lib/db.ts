import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookrec';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Define Book schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  categories: [{ type: String }],
  rating: { type: Number },
  reviews: [{ type: String }],
});

// Create Book model
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export { connectToDatabase, Book };
