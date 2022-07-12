const router = require("express").Router();
const Quiz = require("./db").Quiz;

router.use((req, res, next) => {
    console.log(Date.now());
    next();
})

router.get("/getPagesCount", async (req, res) => {
    let quizzes;
    if(req.query.category){
        quizzes = await Quiz.find({category: req.query.category});
    }
    else{
        if(!req.session.user){
            quizzes = await Quiz.find().exec();
        }
        else{
            quizzes = await Quiz.find({author: {$in: req.session.user.following}}).exec();
        }
    }
    let paginated = [];
     while(quizzes.length != 0){
        paginated.push(quizzes.splice(0, 10));
    }
    res.send({
        pages: paginated.length
    });
    
})

router.get("/", (req, res) => {
    let page = req.query.page
    if(req.query.category){
        Quiz.find({category: req.query.category}).sort("-date").limit(10).skip(10*page).exec((err, quizzes) => {
            if(err){
                console.error(err);
                res.status(500);
                res.send({
                    ok: false,
                    message: "Server error"
                });
                return;
            }
            res.send({
                ok: true,
                quizzes: quizzes    
            })
        })
    }
    else{
        if(req.session.user){
            if(req.session.user.following.length === 0){
                res.send({
                    ok: true,
                    quizzes: [],
                    message: "Follow somebody to see his quizzes",
                    show_follow_message: true
                })
                return;
            }
            Quiz.find({author: {$in: req.session.user.following}})
            .sort("-date")
            .select("_id name date likes description author questions._id")
            .limit(10)
            .skip(10 * page)
            .exec((err, quizzes) => {
                if(err){
                    console.err(err);
                    res.status(500);
                    res.send({
                        ok:false,
                        message: "Server error"
                    })
                    return;
                }

                res.send({quizzes, ok: true});
            });
        }
        else{
            res.send({
                redirect: true,
                message: "Not authenticated",
                quizzes: []
            })
        }
    }
});

router.get("/recent", (req, res) => {
    Quiz.find().sort("-date").limit(5).exec((err, quizzes) => {
        if(err){
            console.error(err);
            res.status(500);
            res.send({
                message: "Server error",
                ok: false
            });
        }
        res.send({quizzes, ok: true});
    })
});

router.get("/best", (req, res) => {
    let page = req.query.page;
    Quiz.find().sort("-likes_len").limit(10).skip(10 * (page-1)).exec((err, quizzes) => {
        if(err){
            console.error(err);
            res.status(500);
            res.send({
                ok: false, 
                message: "Server error"
            });
        }
        res.send({quizzes, ok: true});
    });
})

router.get("/:id", (req, res) => {
    Quiz.findById(req.params.id).exec((err, quiz) => {
        if(err){
            console.error(err);
            res.status(500);
            res.send({
                ok:false,
                message: "Server error"
            })
            return;
        }

        res.send(quiz);
    })
});

router.post("/create", (req, res) => {
    if(req.session.user){
        let quiz_body = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            questions: req.body.questions,
            author: req.session.user._id,
        }
        let quiz = new Quiz(quiz_body);
        quiz.save().then(quiz => {
            res.send({
                id: quiz._id,
                ok: true
            })            
        }).catch(err => {
            console.error(err);
            res.status(500);
            res.send({
                ok: false,
                message: "Server error. It may be caused by invalid request"
            })
        })
    }
    else{
        res.status(403);
        res.send({
            ok: false,
            message: "authorization required"
        })
    }
})

router.post("/submit", async (req, res) => {
    if(req.session.user){
        let quiz = await Quiz.findById(req.body.id).exec();
        let true_options = [];
        quiz.questions.map((question, index) => {
            let option = question.options.findIndex(opt => opt.is_true);
            true_options.push({question: index, option});
        })

        let result = 0;

        req.body.answers.map(answer => {
            let ans = true_options.find(opt => opt.question === answer.question).option;
            console.log(ans, answer)
            if(answer.answer == ans){
                result+=1;
            }
        });

        result = result * 100/quiz.questions.length;

        quiz.results.push({
            result,
            user: req.session.user._id
        });
        quiz.save().then(quiz => {
            res.send({
                ok: true,
                result,
            })
        }).catch(err=>{
            console.error(err);
            res.status(500);
            res.send({
                message: "Server error",
                ok: false
            })
        });
    }
    else{
        res.status(403);
        res.send({
            ok: false,
            message: "Authorization required"
        })
    }
});

router.post("/like", async (req, res) => {
    if(req.session.user){
        let quiz = await Quiz.findById(req.body.quiz_id).exec();
        console.log(quiz);

        if(quiz === null){
            res.status(400);
            res.send({
                ok: false,
                message: "Quiz with such id is not found"
            });
            return;
        }
        if(quiz.likes.includes(req.session.user._id)){
            let index = quiz.likes.findIndex(like => like === req.session.user._id);
            quiz.likes.splice(index, 1);
            quiz.likes_len -= 1; 
        }
        else{
            quiz.likes.push(req.session.user._id);
            quiz.likes_len+=1;
        }

        quiz.save().then(quiz=>{
            res.send({
                ok: true,
            })
        }).catch(err => {
            console.error(err);

            res.status(500);
            res.send({
                ok: false,
                message: "Server error"
            })
        })
    }
    else{
        res.status(403);
        res.send({
            ok: false,
            message: "Authorization required"
        })
    }
})

router.delete("/:id", (req, res) => {

});

router.put("/:id", async (req, res) => {
    if(req.session.user){
        let quiz = await Quiz.findById(req.params.id).exec();
        if(quiz.author !== req.session.user._id){
            res.status(403);
            res.send({
                message: "Can't modify this quiz as you don't have enough rights",
                ok:false
            })
        }
        Quiz.findByIdAndUpdate(req.params.id, req.body).exec().then(() => {
            res.send({
                ok: true
            })
        }).catch(err => {
            res.status(500);
            res.send({message: "Server error", ok: false});
        });
    }else{
        res.status(403)
        res.send({
            ok: false,
            message: "Authorization required"
        })
    }
})

module.exports = router;