const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('./config/connectDB');

const app = express();

app.use(bodyParser.json());

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(require('./routes/auth'));

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header("Access-Control-Allow-Origin", req.headers.origin);
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
//     );
//     res.header(
//       "Access-Control-Allow-Headers",
//       "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
//     );
//     next();
// });


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});