const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const db = require('./models');
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.use(cookieParser());

const PORT = process.env.PORT || 4001;

// app.use(
//   cors({
//     origin: ['http://localhost:3000', 'https://boring-turing-09875f.netlify.app'],
//     credentials: true,
//     exposedHeaders: ['set-cookie'],
//   })
// );
// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
//   );
//   next();
// });

app.use('/api/auth', authRoutes);

// app.use('/api/users/:id/posts', postRoutes);
app.use('/api/users/:id/posts', loginRequired, ensureCorrectUser, postRoutes);

app.use('/api/posts', async function (req, res, next) {
  try {
    let posts = await db.Post.find().populate('user', {
      username: true,
      profileImageUrl: true,
    });
    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, '/../client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../', 'client', 'build', 'index.html'));
// })

app.use(function (req, res, next) {
  let error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
