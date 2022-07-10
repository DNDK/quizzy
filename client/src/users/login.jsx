import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import sha512 from "./hash";

import "./users.css"

function LoginForm(){

    const [form,  setForm] = useState({
        username: "",
        password: "",
        csrf_token: ""
    })

    useEffect(()=>{
        fetch("/api/getCsrf").then(res=>res.json()).then(res=>{
            setForm({
                ...form,
                csrf_token: res.token
            })
        })
    }, []);

    const handleChange = (event) => {
        setForm({...form, [event.target.name]: event.target.value});
        console.log(form);
    }
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const hash = await sha512(form.password);
        const req = {
            username: form.username,
            password_hash: hash
        };
        console.log(req);
        fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "CSRF-Token": form.csrf_token
            },
            body: JSON.stringify(req)
        }).then(res=>res.json()).then(res=>{
            if(res.ok){
                window.location = "/";
            }
            else{
                setForm({...form, login_failed: true});
            }
        });
    }

    return(
        <div className = "form">
        {form.login_failed ? <div className = "error-message">Неправильный логин и/или пароль</div> : ""}
        <form onSubmit={handleSubmit} className = "user-form">
            <h2 className = "user-form-header">ВОЙТИ</h2>
            <input name = "username" onChange={handleChange} placeholder = "Имя пользователя"/><br/>
            <input name = "password" onChange={handleChange} placeholder = "Пароль" type = "password"/><br/>
            <button type = "submit" className = "button submit-button">Войти</button>
        </form>
        <div className = "register-message">Нет аккаунта? <Link to = "/users/register">Зарегистрируйтесь!</Link></div>
        </div>
    )
}

export default LoginForm;