import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import "./userssidebar.css";

function UserQuiz(props){
    return(
        <div className = "sidebar-user-quiz">
            <div className = "sidebar-user-quiz-name"><Link to = {`/quizzes/${props.id}`}>{props.name}</Link></div>
            <div className = "sidebar-user-quiz-likes">{props.likes}</div>
        </div>
    )
}

function UserInfo(props){
    const [loggedin, setLoggedin] = useState(false);
    const [username, setUsername] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [id, setId] = useState("");
    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
        fetch("/api/users/user").then(res=>res.json()).then(res=>{
            if(res.authenticated){
                setLoggedin(true);
                setUsername(res.username);
                setId(res._id);
                setQuizzes(res.quizzes);
                setId(res._id);
            }
        });
        fetch("/api/getCsrf").then(res=>res.json()).then(res=>{
            setCsrfToken(res.token);
        });
    }, []);

    const handleLogout = () => {
        fetch("/api/users/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Csrf-Token": csrfToken
            },
        }).then(res=>res.json()).then(res=>{
            if(res.ok) setLoggedin(false);
        })
    }
    
    return(
        <div className = "sidebar-user-management">
            {loggedin ? 
            <div className = "user">
                <div className = "sidebar-username">{username}</div>
                <div className = "sidebar-user-quizzes">
                    {quizzes.length > 0 ? <>
                    <div className = "sidebar-user-quizzes-header">Мои викторины</div>
                    {
                        quizzes.map(quiz => (
                            <UserQuiz
                                name = {quiz.name}
                                likes = {quiz.likes.length}
                                id = {quiz._id}
                            />
                        ))
                    }
                    </>
                    :
                    <div className = "no-quizzes-message">Вы не создали ни одной викторины.<br/><Link to = "/quizzes/create">Создайте сейчас!</Link></div>
                    }
                </div>
                <div className = "button" style = {{
                    transform: "scale(.8)",
                    width: "20%",
                    display: "inline-flex",
                    justifyContent: "center"
                }} onClick = {handleLogout}>Выйти</div>
            </div> 
            : 
            <div className = "sidebar-login">
                <div className = "sidebar-login-message">
                Вы не вошли в аккаунт
                <Link to = "/users/login">Войти</Link>
                </div>
                <div className = "sidebar-register-message">
                Нет аккаунта?&nbsp;<Link to = "/users/register">Зарегистрируйтесь!</Link>
                </div>
            </div>
            }   
        </div>
    )
}

function RecentQuizzes(props){
    const [quizzes, setQuizzes] = useState([]);
    useEffect(() => {
        fetch("/api/quizzes/recent").then(res=>res.json()).then(res=>{
            setQuizzes(res);
        });
    }, []);

    return(
        <div className = "sidebar-recent-quizzes">
            <div className = "sidebar-user-quizzes-header">Недавние викторины</div>
           {
            quizzes.map((quiz) => (
                <UserQuiz
                    name = {quiz.name}
                    likes = {quiz.likes.length}
                    id = {quiz._id}
                />
            ))
           } 
        </div>
    )
}

function Footer(){
    const [year, setYear] = useState(-1);
    useEffect(() => {
        fetch("/api/getYear").then(res=>res.json()).then(res=>{
            setYear(res.year);
        })
    }, [])
    return(
        <div className = "sidebar-footer">
            &copy;DNDK, {year!=-1 ? year : "Загрузка"}
        </div>
    )
}

function UserSidebar(){
    return(
        <>
        <div className = "right-sidebar">
            <UserInfo />
            <div className = "sticky">
                <RecentQuizzes />
                <Footer />
            </div>
        </div>  
        </>
    )
}

export default UserSidebar;