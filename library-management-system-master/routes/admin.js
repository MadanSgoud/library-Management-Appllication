const express=require("express");
const flash = require('connect-flash');
const { v4: uuidv4 } = require('uuid');
const router=express.Router();
const Issue=require("../models/issue");
const Book=require("../models/bookschema");
const Admin=require("../models/userschema");
const passport = require("passport");

// Admin registration
router.post("/adminregister",(req,res) => {
        Admin.register({
            firstName:req.body.firstname,
            lastName:req.body.lastname,
            username:req.body.username,
            email:req.body.email,
            gender:req.body.gender,
            post:req.body.post,
            mobile:req.body.mobile,
            address:req.body.address,
        },
        req.body.password,
        (err,admin) => {
            if(err){
                console.log(err);
                res.render("admin/adminregistration");
            }
            else{
                    res.redirect("/dashboard");
            }
        });
   
});
// // Admin Login

router.post("/adminlogin",async (req,res) => {
        const admin=new Admin({
            username:req.body.username,
            password:req.body.password
         });
         const user=await Admin.findOne({username:req.body.username});
         if(user.post!=="user"){
            req.login(admin,(err) => {
                if(err){
                    console.log(err);
                }
                else{
                    passport.authenticate("local")(req,res,() => {
                        res.redirect("/dashboard");
                    })
                }
            })
         }
         else{
             res.send("not valid");
         }
        
});

// Admin logout

router.get("/logout",(req,res) => {
    req.logout();
    res.redirect("/");
});
// Admin Dashboard

router.get("/dashboard",async (req,res) => {
    if(req.isAuthenticated()){
        try{
            const issuedata=await Issue.find({});
            if(req.user['post']!=="user")
            {
            res.render("admin/dashboard",{admindata:req.user,issuedata:issuedata});
            }
            else
            {
           res.send("You are not accessed to this");
            }
        }catch(err){
            console.log(err);
        }
        
    }
    else{
        res.redirect("/adminlogin");
    }
    
});
// admin registration Page
router.get("/adminregistration",(req,res) => {
        res.render("admin/adminregistration");
});
// admin Login Page
router.get("/adminlogin",(req,res) => {
    if(req.isAuthenticated()){
            res.redirect("/dashboard");
    }
    else{
        res.render("admin/adminlogin");
    }
});
// Adding Book route
router.get("/addbook",(req,res) => {
    if(req.isAuthenticated()){
        res.render("admin/addbook",{message:req.flash("message")});
    }
    else{
        res.send("You dont have permission To make Changes");
    }
    
});

// Adding book details
router.post("/addbook",async (req,res) => {

   const book=await Book.findOne({title:req.body.title,author:req.body.author});
   if(book){
       req.flash("message","A book with same details Exist");
       res.redirect("/addbook");
   }
   else{
    const book=new Book({
        title : req.body.title,
        ISBN : uuidv4(),
        stock : req.body.copies,
        author : req.body.author,
        description : req.body.description,
        category : req.body.category
    });
   book.save();
   req.flash('message', 'Book Added Sucessfully');
   res.redirect("/addbook");
   }
    
    
});
// Deleting Book route
router.get("/deletebook",(req,res) => {
    if(req.isAuthenticated()){
        Book.find({},(err,book) => {
            if(err){
                console.log(err);
            }
            else{
                res.render("admin/deletebook",{bookdata:book,deletemessage:req.flash("deletemessage")});
            }
        });
    }
    else{
        res.send("You dont have permission To view this");
    }
    

});
// Delete Book
router.get("/deletebook/:bookid",(req,res) => {

   Book.deleteOne(
       {_id:req.params.bookid},
       (err) => {
           if(err){
               console.log(err);
           }
           else{
            req.flash('deletemessage', 'Book Deleted Sucessfully');
               res.redirect("/deletebook");
           }
       }
       )
});
// Update book Details Route
router.get("/updatebook",(req,res) => {
    if(req.isAuthenticated()){
        Book.find({},(err,book) => {
            if(err){
                console.log(err);
            }
            else{
                res.render("admin/updatebook",{bookdata:book,updatemessage:req.flash("updatemessage")});
            }
        })
    }
    else{
        res.send("You dont have permission to view this");
    }
    
});
// Update Book
router.get("/updatebook/:bookid",(req,res) => {
    Book.find({_id:req.params.bookid},(err,book) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("admin/updatebookdata",{bookdata:book});
        }
    })
});

// Post request To update book details
router.post("/updatebook/:bookid",(req,res) => {
    Book.updateOne({_id:req.params.bookid},{
        $set:{
            title : req.body.title,
            author : req.body.author,
            description : req.body.description,
            category : req.body.category
        }
    },(err) => {
        if(err){
            console.log(err);
        }
        else{
         req.flash('updatemessage', 'Book Details Updated Sucessfully');
        res.redirect("/updatebook");
        }
    })
});
// display books route
router.get("/searchbooks",(req,res) => {
    Book.find({},(err,books) => {
        res.render("book/displaybooks",{booksdata:books});
    })
});

// display Single Book Complete Details
router.get("/displaybook/:bookid",(req,res) => {
    Book.findById(req.params.bookid,(err,bookdata) => {
        res.render("book/displaybook",{book:bookdata});
    })
});
// Search Book Route
router.post("/searchbook",(req,res) => {
    const category=req.body.category;
    const input=req.body.searchinput;
    if(category==="Author")
    {
        Book.find({author:input},(err,books) => {
            res.render("book/displaybooks",{booksdata:books});
        })
    }
    else if(category==="book"){
        console.log(category);
        Book.find({title:input},(err,books) => {
            res.render("book/displaybooks",{booksdata:books});
        })
      }
      else{
        Book.find({},(err,books) => {
            res.render("book/displaybooks",{booksdata:books});
        })
      }

});
// Getting admin profile route
router.get("/profile/:adminid",(req,res) => {
    Admin.findById(req.params.adminid,(err,adminprofile) => {
        res.render("admin/profile",{profiledata:adminprofile});
    })
});
// Displaying Librarian Details
router.get("/librariandetails",(req,res) => {
    if(req.user["post"]==="admin"){
        Admin.find({post:"librarian"},(err,details) => {
            res.render("admin/librariandetails",{details:details});
        })
    }
    else{
        res.send("Dont have permission");
    }
});
// 
router.get("/deletelibrarian/:id",(req,res) => {
    Admin.deleteOne({_id:req.params.id},(err) => {
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/dashboard");
        }
    })
});
// User details route

router.get("/userdetails", (req,res) => {
    if(req.isAuthenticated()){
            if(req.user["post"]==="admin"){
                Admin.find({post:"user"},(err,details) => {
                    res.render("admin/userdetails",{userdetails:details});
                });
            }
            else{
                res.send("Nope ");
            }
    }
    else{
        res.redirect("/adminlogin");
    }
});
// User Profile Route
router.get("/userprofile/:userid",async (req,res) => {
    try{
           const profiledata=await Admin.findById(req.params.userid);
           const issue=await Issue.find({"user_id.id":req.params.userid});
           res.render("admin/userprofile",{profiledata:profiledata,issue:issue});
    }catch(err){
         console.log(err);
    }
});
module.exports=router;