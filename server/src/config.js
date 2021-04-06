import dotenv from 'dotenv';
import path from 'path';

if(process.env.NODE_ENV != 'production'){
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

module.exports = {
  jwt_secret: process.env.JWT_SECRET || 'unsafe_jwt_secret',
  mongoose: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://admin:EAfZkNDQ0JiIdhqt@cluster0.8qnxl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  },
}