import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

import "./popular.css";

function UserCard(props){
    const handleSubscribe = () => {
        //fetch(`/api/users/${props.id}`)
        //create that endpoint
    }

    return(
        <div className = "user-card">
            <div className = "username-card"><Link to = {`/users/${props.id}`}>{props.username}</Link></div>
            <div className = "user-followers">{props.followers}</div>
            <div className = "follow-button button">Подписаться</div>
        </div>
    )
}

function PopularUsers(){
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("/api/users/popular").then(res=>res.json()).then(res=>{
            setUsers(res.users);
        });
    }, [])

    return(
        <div className = "popular-users">
            {users.map((user) => (
                <UserCard 
                username = {user.username}
                followers = {user.followers}
                id = {user.id}
                />
            ))}
        </div>
    );
}

export default PopularUsers;