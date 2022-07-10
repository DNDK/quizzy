import {useState} from "react";
import {Link} from "react-router-dom";
import UserCard from "./UserCard";
import {useLocation} from "react-router-dom";

function NavBar(){
    const [authenticated, setAuthenticated] = useState(false);

    return(
        <div className = "nav-bar">
            <nav>
                <Link to = "/quizzes">Викторины</Link>
                <Link to = {"/quizzes/create"}>Создать викторину</Link>
                <Link to = {"/quizzes/best"}>
                    Лучшие викторины
                </Link>
            </nav>
        </div>
    )
}

function HeaderQuizzes(){
    return(
        <>
        <header><Link to = "/">Quizzy</Link></header>
        <NavBar/>
        </>
    )
}

function HeaderUsers(){
    return(
        <div className = "users-page-header">
            <div className = "users-page-header-logo">
                <Link to = "/">Quizzy</Link>
            </div>
            <div className = "users-page-header-label">Профиль</div>
        </div>
    )
}

function Header(){
    const location = useLocation();
    if(location.pathname.includes("quizzes")){
        return(<HeaderQuizzes/>)
    }
    else if(location.pathname.includes("users")){
        return(<HeaderUsers/>)
    }
}

export default Header;