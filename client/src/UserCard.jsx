import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function UserCard(props){
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("")

    useEffect(() => {
        fetch("/api/users/user").then(res=>res.json()).then(res=>{
            if(res.authenticated){
                setUsername(res.username);
                setUserId(res._id);
                props.handleAuthentication();
            }else{

            }
        }).finally(() => {
            setLoading(false);
        })
    }, [])

    return(
        <div className = "user-card">
            {
                loading ? "Загрузка..." : 
                props.authenticated ? <Link to = {`/users/${userId}`}>{username}</Link> : <Link to = "/users/login">Войти</Link>
            }
        </div>
    )
}

export default UserCard;