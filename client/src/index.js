import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";
import { QuizzesList } from "./quizzes/quizzes";
import Quiz from "./quizzes/quiz";
import LoginForm from "./users/login";
import RegistrationForm from "./users/register";
import QuizConstructor from "./quizzes/constructor";
import UserCard from "./UserCard";
import Header from "./header";
import ResultPage from "./quizzes/resultPage";
import Profile from "./users/profile";
import SideBar from "./sidebar";
import BestQuizzes from "./quizzes/bestquizzes";
import UserSidebar from "./usersidebar";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
    useLocation
} from "react-router-dom";

import "./style.css";

function Content(){
    const location = useLocation();
    return(
        <div className = "main">
        {location.pathname.includes("quizzes") ? (<SideBar/>) : ("")}
        <div  className = {location.pathname.includes("quizzes") ? "content" : "users-page"}>
            <Routes>
                <Route exact path = "/" element = {<Navigate to = "/quizzes"/>}/>
                <Route exact path = "/quizzes" element = {<QuizzesList best = {false}/>}/>
                <Route path = "/quizzes/:id" element = {<Quiz/>}/>
                <Route path = "/quizzes/create" element = {<QuizConstructor/>} />
                <Route path = "/quizzes/result" element = {<ResultPage />}/>
                <Route path = "/users/login" element = {<LoginForm/>}/>
                <Route path = "/users/register" element = {<RegistrationForm/>}/>
                <Route path = "/users/:id" element = {<Profile />}/>
                <Route path = "/quizzes/best" element = {<BestQuizzes/>}/>
            </Routes>
        </div>
        {location.pathname.includes("quizzes") ? (<UserSidebar/>) : ""}
        </div>
    )
}

function App(props){
    return (
        <Router>
            <Header/>
            <Content/>
        </Router>
        
    )
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);