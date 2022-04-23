const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const session=require("express-session");
const flash = require('connect-flash');
const passport=require("passport");
const Admin=require("./models/userschema");
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(flash());
app.use(session({
    secret:"our little secret Key",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
// routes
const userroutes=require("./routes/user");
const adminroutes=require("./routes/admin")
// connecting mongoose
mongoose.connect("",{   useNewUrlParser: true,
useUnifiedTopology: true})
.then(() => console.log("Mongodb is connected"))
.catch((err) => console.log(err));

passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());



app.get("/",(req,res) => {
    res.render("home");
})

app.use(userroutes);
app.use(adminroutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT,() => {
    console.log("Server Started");
})