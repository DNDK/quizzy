const router = require("express").Router();
const User = require("./db").User;
const Quiz = require("./db").Quiz;

router.use((req, res, next) => {
    console.log(Date.now());
    next();
})

router.get("/user", async (req, res) => {
    if(req.session.user){
        let user_id = req.session.user._id;
        let user_quizzes = await Quiz.find({author: user_id}).select("_id name likes category results").limit(5).exec();
        res.send({
            authenticated: true,
            username: req.session.user.username,
            _id: req.session.user._id,
            quizzes: user_quizzes
        })
    }else{
        res.send({
            authenticated: false
        })
    }
})

router.get("/popular", async (req, res) => {
    try{
        let users = await User.find().exec();
        users.sort((a, b) => b.followers.length - a.followers.length);

        let usersResponse = [];

        users.map((user) => {
            usersResponse.push({
                id: user._id,
                username: user.username,
                followers: user.followers.length
            })
        })

        res.send({
            users: usersResponse,
            ok: true
        });
    }catch(err){
        console.error(err);
        res.status(500);
        res.send({
            ok: false,
            message: "Server error"
        });
    }
})


router.post("/register", async (req, res) => {
    let find_user = await User.findOne({username: req.body.username}).exec();
    if(find_user === null){
        let user = new User(req.body);
        await user.save();
        res.send({
            ok: true
        });
    }
    else{
        console.log(find_user.username);
        res.send({
            ok: false,
            message: "Username is already taken"
        })
    }
})

router.post("/login", async (req, res) => {
    if(req.session.user){
        res.send({
            authenticated: true
        })
    }
    else{
        console.log(req.body);
        let user = await User.findOne({username: req.body.username, password_hash: req.body.password_hash}).exec();
        console.log(user);
        if(user === null){
            res.send({
                ok: false,
                message: "Wrong username or password"
            })
        }
        else{
            req.session.user = user;
            res.send({
                ok: true
            })
        }
    }
})

router.delete("/users/delete/:id", (req, res)=>{
    if(req.session.user._id == req.params.id){
        User.findByIdAndDelete(req.params.id).exec().then(()=>{
            res.send({
                ok: true
            })
        }).catch(err=>{
            console.error(err);
            res.status(500);
            res.send({message: "Iternal Server error", ok: false});
        });
    }else{
        res.status(403)
        res.send({
            message: "Недостаточно прав для проведения операции",
            ok: false
        })
    }
});

router.get("/checkusername", async (req, res) => {
    let users = await User.find({username: req.query.username}).exec();
    res.send({
        username_is_taken: users.length > 0
    })
})

router.get("/:id", async (req, res) => {
    let user = await User.findById(req.params.id).exec();

    let is_owner;
    if(req.session.user){
        if(req.session.user._id == user._id){
            is_owner = true;
        }
        else is_owner = false;
    }
    else is_owner = false;
    res.send({
        _id: user._id,
        username: user.username,
        followers: user.followers,
        following: user.following,
        is_owner
    })
})

router.get("/userInfo/:id", async (req, res) => {
    try{
        let user = await User.findById(req.params.id).exec();
        res.send({
            username: user.username,
        });
    }catch(e){
        res.status(500);
        res.send({message: "An error occured. It may could have beeen caused by invalid id parameter."})
    }
})

router.post("/logout", (req, res) => {
    try{
        req.session.user = null;
        res.send({
            message: "Success",
            ok:true
        })
    }catch{
        res.status(500);
        res.send({
            message: "An error occured.",
            ok:true
        })
    }
})


module.exports = router;