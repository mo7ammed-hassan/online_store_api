const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HttpStatusText = require('./utils/httpStatusText');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


// ROUTES
app.use('/api/categories', require('./routes/category'));
app.use('/api/subCategories', require('./routes/subCategory'));
app.use('/api/brnads', require('./routes/brands'));
app.use('/api/variantType', require('./routes/variantType'));
app.use('/api/variant', require('./routes/variant'));
app.use('/api/product', require('./routes/product'));
app.use('/api/poster', require('./routes/poster'));
app.use('/api/users', require('./routes/user'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/coupoCodes', require('./routes/coupoCode'));


// setting static folder path
app.use('/image/products', express.static(path.join(__dirname, 'public/products')));
app.use('/image/category', express.static(path.join(__dirname, 'public/category')));
app.use('/image/poster', express.static(path.join(__dirname, 'public/posters')));


// ERROR HANDLER 
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ status: error.statusText || HttpStatusText.ERROR, message: error.message, code: error.statusCode || 500, data: null });
})


app.all('*', (req, res, next) => {
  return res.status(404).json({ status: HttpStatusText.ERROR, message: 'this resource is not availale check which method that used' });
});

const uri = process.env.MONGO_URL;
const port = process.env.PORT;
mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
}).catch(() => {
  console.log('Error connecting to MongoDB');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
