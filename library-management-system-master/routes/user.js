const express=require("express");
const router=express.Router();
const User=require("../models/userschema");
const flash = require('connect-flash');
const Book=require("../models/bookschema");
const Issue=require("../models/issue");
const passport=require("passport");

// user Registration
router.post("/userregister",(req,res) => {
    User.register({
        firstName:req.body.firstname,
        lastName:req.body.lastname,
        username:req.body.username,
        email:req.body.email,
        gender:req.body.gender,
        mobile:req.body.mobile,
        address:req.body.address,
        branch:req.body.branch,
    },
    req.body.password,
    (err,user) => {
        if(err){
            console.log(err);
            res.render("user/userregistration");
        }
        else{
            passport.authenticate("local")(req,res,() => {
                res.redirect("/userlogin");
            })
        }
    });
   

});
// // User Login

router.post("/userlogin",(req,res) => {
        const user=new User({
            username:req.body.username,
            password:req.body.password
         });
         req.login(user,(err) => {
             if(err){
                 console.log(err);
                 res.redirect("/userlogin");
             }
             else{
                 passport.authenticate("local")(req,res,() => {
                         res.redirect("/userdashboard");
                 })
             }
         })
    
});

// user Logout 

router.get("/logout",(req,res) => {
    req.logout();
    res.redirect("/");
});

// Getting user Login Route
router.get("/userlogin",(req,res) => {
    res.render("user/userlogin");
});
// Getting user Registration route
router.get("/userregistration",(req,res) => {
    res.render("user/userregistration");
})

// Getting userdashboard
router.get("/userdashboard",async (req,res) => {
       if(req.isAuthenticated()){
        try{
            const userid=req.user["_id"];
            const user=await User.findById(userid);
            const booksdata=await Issue.find({"user_id.username":user["username"]})
            if(req.isAuthenticated()){
                if(user.post==="user"){
                    res.render("user/userdashboard",{userdata:user,booksdata:booksdata})
                }
                else{
                    res.send("Dont have permission");
                }
            }
            else{
             res.redirect("/userlogin");
            }
        }catch(err) {
            console.log(err);
            return res.redirect("back");
        }
       }else{
        return res.redirect("back");
       }
    
});
// Issue book route
router.get("/issuebook",async (req,res) => {
    const booksdata=await Book.find({})
    res.render("user/issuebook",{booksdata:booksdata});
});

// Book issue
router.get("/issuebook/:bookid",async (req,res) => {
    if(req.isAuthenticated()){
        try{
            const book=await Book.findById(req.params.bookid);
            const user=await User.findById(req.user["_id"]);
            if(user.bookIssueInfo.length<=5){
                book.stock-=1
                const issue =  new Issue({
                    book_info: {
                        id: book._id,
                        title: book.title,
                        author: book.author,
                        ISBN: book.ISBN,
                        category: book.category,
                        stock: book.stock,
                    },
                    user_id: {
                        id: user._id,
                        username: user.username,
                    }
                });
        
                // putting issue record on individual user document
                user.bookIssueInfo.push(book._id);
        
                await issue.save();
                await user.save();
                await book.save();
                 
                res.redirect("/userdashboard");
            }
            else{
                res.send("Return Previous Books to issue");
            }
        }catch(err) {
            console.log(err);
            return res.redirect("back");
        }
    }
    else{
        return res.redirect("back");
    }
    
    
});
// Return book route

router.get("/returnbook",async (req,res) => {
    try{
        const user=await User.findById(req.user["_id"]);
        const booksdata=await Issue.find({"user_id.username":user.username});
        res.render("user/returnbook",{booksdata:booksdata});
    }catch(err) {
        console.log(err);
        return res.redirect("back");
    }
    
});

// Return Book

router.get("/returnbook/:bookid",async (req,res) => {
  try{
       const book_id = req.params.bookid;
       const userinfo=await User.findById(req.user["_id"]);
       const pos = userinfo.bookIssueInfo.indexOf(req.params.bookid);
        
        // fetching book from db and increament
        const book = await Book.findById(book_id);
        book.stock += 1;
        await book.save();

        // removing issue 
        const issue =  await Issue.findOne({"user_id.id": userinfo._id});
        await issue.remove();

        // popping book issue info from user
        userinfo.bookIssueInfo.splice(pos, 1);
        await userinfo.save();

        res.redirect("/userdashboard");

  }catch(err) {
    console.log(err);
    return res.redirect("back");
}
});
// User Profile Route

router.get("/profileuser/:id",async (req,res) => {

   try{
   const profiledata=await User.findById(req.params.id);
   res.render("user/profile",{profiledata:profiledata});
   }catch(err){
       console.log(err);
   }
    
});

module.exports=router;