var express = require('express');
var app = express();
const Routes = require('./routes/index.route');
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: "*"
}))

app.use('/api', Routes)
app.use("/profile", express.static("uploads"));
app.use("/project-img", express.static("project-images"));
app.use("/project-doc", express.static("project-documents"));
app.use("/Attachments", express.static("Attachments"));

const port = 4002;
app.listen(port, () => console.log('Server listening on port ' + port));
module.exports = app;

