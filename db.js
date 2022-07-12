const mongoose = require("mongoose");

const user = new mongoose.Schema({
    username: String,
    password_hash: String,
    followers: [{type: mongoose.Types.ObjectId, ref: "User"}],
    following: [{type: mongoose.Types.ObjectId, ref: "User"}],
    id_admin: {type: Boolean, default: false}
});

const quiz = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    questions: [
        {
            question: String,
            options: [{
                text: String,
                is_true: Boolean
            }]
        }
    ],
    results: [{
        user: {type: mongoose.Types.ObjectId, ref: "User"},
        result: Number
    }],
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    likes_len: {type: Number, default: 0},
    date: {type: Date, default: Date.now(), required: true},
    category: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId, ref: "User", required: true}
});

exports.User = mongoose.model("User", user);
exports.Quiz = mongoose.model("Quiz", quiz);