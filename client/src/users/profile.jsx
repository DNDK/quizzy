import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import "./profile.css";
import {confirm} from "react-confirm-box";

function FollowInfoItem(props){
    const [user, setUser] = useState({
        username: ""
    });
    
    useEffect(()=>{
        fetch(`/api/users/userInfo/${props._id}`).then(res=>res.json()).then(res=>{
            setUser({
                username: res.username
            });
        });
    }, []);

    return(
        <div className = "user-follow-item">{user.username}</div>
    )
}

function Followers(props){
    const [showItems, setShowItems] = useState(false);

    const handleToggleShowItems = () => {
        setShowItems(!showItems);
    }

    return(
        <div className = "profile-follow-info">
            <div className = "profile-follow-button" onClick = {handleToggleShowItems}>
                <span style = {{float: "left"}}>Подписчки</span><span style = {{float: "right"}}>{props.followers.length}</span>
            </div>
            <div 
            className = "profile-follow-items"
            style = {{
                maxHeight: showItems  === true ? `${props.followers.length * 41.6}px` : "0",
                paddingBottom: showItems ? "30px" : ""
            }}>
                {
                    props.followers.map((item, i) => {
                        return(<FollowInfoItem _id = {item}/>)
                    })
                }
            </div>
        </div>
    )
}

function Following(props){
    const [showItems, setShowItems] = useState(false);

    const handleToggleShowItems = () => {
        if(props.following.length){
            setShowItems(!showItems);
        }
        else{
            return;
        }
    }

    return(
        <div className = "profile-follow-info">
            <div className = "profile-follow-button" onClick = {handleToggleShowItems}>
            <span style = {{float: "left"}}>Подписки</span><span style = {{float: "right"}}>{props.following.length}</span>
            </div>
            <div 
            className = "profile-follow-items"
            style = {{
                maxHeight: showItems  === true ? `${props.followers.length * 41.6}px` : "0",
                paddingBottom: showItems ? "30px" : ""
            }}>
                {
                    props.following.map((item, i) => {
                        return(<FollowInfoItem _id = {item._id}/>)
                    })
                }
            </div>
        </div>
    )
}

function Profile(){
    const [user, setUser] = useState({
        username: "",
        followers: [],
        following: [],
    });

    const [error, setError] = useState(false);

    const [csrftoken, setCsrftoken] = useState("");

    const [isOwner, setIsOwner] = useState(false);

    const {id} = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/api/users/${id}`).then(res=>res.json()).then(res=>{
            setUser({
                username: res.username,
                followers: res.followers,
                following: res.following
            });

            setIsOwner(res.is_owner);
        });

        fetch("/api/getCsrf").then(res=>res.json()).then(res=>{
            setCsrftoken(res.token)
        })
    }, [])

    const handleLogoutButtonClick = () => {
        fetch(`/api/users/logout`, {
            method: "POST",
            headers: {
                "Csrf-Token": csrftoken
            }
        }).then(res=>res.json()).then(res=>{
            if(res.ok){
                navigate("/");
            }else{
                setError(true)
            }
        })
    }

    const handleDeleteButtonClick = async () => {
        const options = {
            labels: {   
                confirmable: "Да",
                cancellable: "Нет"
            }
        }
        if(await confirm("Вы уверены?", options)){
            fetch(`/api/user/${user._id}`, {
                method: "DELETE",
            }).then(res=>res.json()).then(res=>{
                if(res.ok){
                    navigate("/");
                }
                else{
                    setError(true)
                }
            })
        }else{
            console.log("no");
        }
    }

    return(
        <div className = "profile">
            <div className = "profile-wrapper">
            <div className = "profile-username">{user.username}</div><br/>
            <Followers followers = {user.followers}/>
            <Following following = {user.following}/>
            <div className = "profile-managing">
                {isOwner ? 
                <>
                    <div className = "button profile-button" onClick = {handleLogoutButtonClick}>Выйти</div>
                    <div className = "button profile-button profile-delete-button" onClick = {handleDeleteButtonClick}>Удалить аккаунт</div>
                    {error ? <div>Произошла ошибка.</div> : ""}
                </>
                :
                ""
                }
            </div>
            </div>
        </div>
    )
}

export default Profile;