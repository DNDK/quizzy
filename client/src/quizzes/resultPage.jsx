import {useState, useEffect} from "react";
import {useLocation, Navigate, useSearchParams} from "react-router-dom";
import "./resultPage.css";

function ResultPage(props){
    const [likes, setLikes] = useState([]);
    const [csrfToken, setCsrfToken] = useState("");
    const location = useLocation();
    const [error, setError] = useState(false);
    const [userId, setUserId] = useState("");
    const [fetching, setFetching] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        fetch(`/api/users/user`).then(res=>res.json()).then(res=>{
            setUserId(res._id);
        })

        fetch("/api/getCsrf").then(res=>res.json()).then(res=>{
            setCsrfToken(res.token);
        })
    }, [])

    useEffect(() => {
        if(fetching){
            fetch(`/api/quizzes/${location.state.quiz_id}/${searchParams.get("category") ? `?category=${searchParams.get("category")}` : ``}`)
            .then(res=>res.json()).then(res=>{
                setLikes(res.likes);
            }).finally(() => {
                setFetching(false)
            });  
        }
    }, [fetching])

    const handleLikeButtonClick = () => {
        fetch("/api/quizzes/like", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Csrf-Token": csrfToken
            },
            body: JSON.stringify({
                quiz_id: location.state.quiz_id
            })                                                                                                                               
        }).then(res=>res.json()).then(res=>{
            if(res.ok) setFetching(true);
            else setError(true);
        }).catch(err => {
            setError(true);
        })
    }

    return(
        <>
        {   location.state ?  
            <div className = "result-page">
                <div className = "result-page-congratulation">Поздравляем, ваш результат: </div>
                <div className = "result">
                    {location.state.result}
                </div>
                <div className = "likes-section">
                    <div className = {`like-button ${likes.includes(userId) ? "liked-button" : ""}`} onClick = {handleLikeButtonClick}>{likes.length}</div>
                    <div className = "likes-message">Понравилась викторина? Поставьте лайк!</div>
                </div>
            </div>
            :
            <Navigate to = "/quizzes" />
        }
        </>
    )
}

export default ResultPage;