import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function SideBar(){
    
    return(
        <div className = "sidebar">
            <div className = "sidebar-nav">
                <Link to = "/quizzes?category=science">Наука</Link>
                <Link to = "/quizzes?category=sport">Спорт</Link>
                <Link to = "/quizzes?category=books">Книги</Link>
                <Link to = "/quizzes?category=movies">Кино</Link>
                <Link to = "/quizzes?category=other">Другое</Link>
            </div>
        </div>
    )
}

export default SideBar;