const { QuizzesList } = require("./client/src/quizzes/quizzes");

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
            quizzes = await Quiz.find({likes_len: {$gt: 0}}).exec();
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
    if(req.session.user){
        let page = req.query.page;
        Quiz.find({author: {$in: req.session.user.following}})
        .sort("-date")
        .select("_id name date likes description author questions._id")
        .limit(10)
        .skip(10)
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

            res.send(quizzes);
        });
    }
    else{
        res.send({
            redirect: true,
            message: "Not authenticated"
        })
    }
});

router.get("/recent", (req, res) => {
    Quiz.find().limit(5).exec((err, quizzes) => {
        if(err){
            console.error(err);
            res.status(500);
            res.send({
                message: "Server error",
                ok: false
            });
        }
        res.send(quizzes);
    })
});

router.get("/best", (req, res) => {
    let page = req.query.page;
    Quiz.find({likes: {$gt: 0}}).sort("-likes").limit(10).skip(10 * page).exec((err, quizzes) => {
        if(err){
            console.error(err);
            res.status(500);
            res.send({
                ok: false, 
                message: "Server error"
            });
        }
        res.send(quizzes);
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
        let quiz = await Quiz.findById(req.body.quiz_id).exec();
        let true_options = [];
        quiz.questions.map((question, index) => {
            let option = question.options.findIndex(opt => opt.is_true);
            true_options.push({question: index, option});
        })

        let result = 0;

        req.body.answers.map(option => {
            let ans = true_options.find(opt => opt.question === option.question).option;
            if(option.option == ans){
                result+=1;
            }
        });

        result = result/quiz.questions.length * 100;

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
            res.status(500);
            res.send({
                message: "Server error",
                ok: true
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