const express = require("express");
var cors = require('cors')
const app = express();

var corsOptions={
    origin: 'http://localhost:5173',
    methods:"GET, POST, PATCH, DELETE, PUT, HEAD",
    Credentials:true
}
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(express.json());


const userRoutes = require('./routes/user.route.js')
const blogRoutes= require('./routes/blog.route.js')
const contactRoutes  = require("./routes/contact.route.js")
const feedbackRoutes  = require("./routes/feedback.route.js")

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/blog', blogRoutes)
app.use('/api/v1/contact', contactRoutes)
app.use('/api/v1/feedback', feedbackRoutes)

module.exports = app;