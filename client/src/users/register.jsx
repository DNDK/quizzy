import {useState, useEffect} from "react";
import sha512 from "./hash";
import { useNavigate } from "react-router-dom";

import "./users.css";

function RegistrationForm(){
    const [username, setUsername] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const [usernameIsTaken, setUsernameIsTaken] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(false);

    const navigate = useNavigate();

    useEffect(()=>{
        fetch("/api/getCsrf").then(res=>res.json()).then(res=>{
            setCsrfToken(res.token);
        });
    }, []);

    useEffect(() => {
        if(username != ""){
            fetch(`/api/users/checkusername?username=${username}`).then(res => res.json()).then(res=>{
                setUsernameIsTaken(res.username_is_taken);
            })
        }
    }, [username]);

    useEffect(() => {
        setPasswordsMatch(password1 === password2 && password1 != "" && password2 != "");
    }, [password1, password2])

    const handleNameChange = (event)=>{
        setUsername(event.target.value); 
    }

    const handlePassword1Change = (event)=>{
        setPassword1(event.target.value);
    }

    const handlePassword2Change = (event) => {
        setPassword2(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const body = {
            username: username,
            password_hash: await sha512(password1)
        };
        setFetching(true);
        fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "CSRF-Token": csrfToken
            },
            body: JSON.stringify(body)
        }).then(res=>res.json()).then(res=>{
            if(res.ok){
                navigate("/");
            }else{
                setError(true);
            }
        }).catch(err=>{
            console.error(err);
            setError(true);
        }).finally(()=>{
            setFetching(false);
        });
    }

    return(
        <div className = "form">
            <form onSubmit={handleSubmit} className = "user-form">
                <h2 className = "user-form-header">Зарегистрироваться</h2>
                {usernameIsTaken ? <div className = "error-message">Имя пользователя занято</div> : ""}
                <input name = "username" onChange = {handleNameChange} value = {username} placeholder = "Имя пользователя"/>
                <input name = "password1" onChange = {handlePassword1Change} value = {password1} placeholder = "Пароль" type = "password"/>
                
                <input name = "password2" onChange = {handlePassword2Change} value = {password2} placeholder = "Повторите пароль" type = "password"/>
                {passwordsMatch ? "" : <div className = "error-message">Пароли не совпадают</div>}
                
                <button className = "button" type = "submit" 
                disabled = {passwordsMatch && !usernameIsTaken && !fetching &&username.length>0 ? false : true}>
                    Зарегистрироваться
                    </button>
                {fetching ? "Загрузка" : ""}
            </form>
        </div>
    )

}

export default RegistrationForm