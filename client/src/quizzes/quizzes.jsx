import React, {useState, useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";


function Quiz_item(props){
    const [author, setAuthor] = useState("");
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        fetch(`/api/users/userInfo/${props.author_id}`).then(res=>res.json()).then(res=>{
            setAuthor(res.username);
        });
        fetch(`/api/users/user`).then(res=>res.json()).then(res=>{
            setAuthenticated(res.authenticated);
        })
    }, []);

    return(
        <div className="quiz-list-item">
            <div className = "quiz-info">
                <div className = "quiz-list-name"><h2><a href = {authenticated ? `/quizzes/${props.id}` : `/users/login`}>{props.name}</a></h2></div>
                <div className = "quiz-author"><Link to = {`/users/${props.author_id}`}>{author}</Link></div>
            </div>
            <div className = "quiz-description">{props.description}</div>
            <div className = "likes-counter">{props.likes}</div>
            <div className = "quiz-creation-date">{new Date(props.date).toLocaleString("ru", {
                day: "numeric",
                month: "long",
            })}</div>
            
        </div>
    );
}

function QuizzesList(props){
    const [pageCount, setPageCount] = useState(1);
    const [quizzes, setQuizzes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [fetching, setFetching] = useState(true);
    const [category, setCategory] = useState("");

    const [params, ] = useSearchParams();

    useEffect(() => {
        document.addEventListener("scroll", handleScroll);  
        fetch("/api/quizzes/getPagesCount").then(res=>res.json()).then(res=>{
            setPageCount(res.pages);
        })
        return () => {
            document.removeEventListener("scroll", handleScroll);
        }
    }, []);

    useEffect(() => {
        setQuizzes([]);
        setFetching(true);
    }, [params])
    
    useEffect(() => {
        if(params.get("category")){
            setCurrentPage(1);
            fetch(`/api/quizzes?category=${params.get("category")}&page=${currentPage}`).then(res=>res.json()).then(res=>{
            setQuizzes(res)
        }).finally(() => {
            setFetching(false)
        })
        }
        else{
            let url;
            if(props.best) url = "/api/quizzes/best";
            else url = "/api/quizzes";
            if(fetching){
                fetch(`${url}?page=${currentPage}`).then(res=>res.json()).then(res=>{
                    setQuizzes(quizzes => [...quizzes, ...res]);
                    setCurrentPage(prevpage => prevpage + 1);
                }).finally(()=>{
                    setFetching(false);
                })
            }
        }
    }, [fetching])

    const handleScroll = (event) => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;

        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if(event.target.documentElement.scrollHeight - (event.target.documentElement.scrollTop + window.innerHeight) < 100 
            && currentPage <= pageCount){
                setFetching(true);
        }
    
    }

    return(<>
    {quizzes.length>0 ? 
        <div className = "quizzes_list">{
            quizzes.map((i)=>{
                return(
                <Quiz_item 
                id = {i._id} 
                name = {i.name} 
                questions_number = {i.questions_number}
                date = {i.date}
                likes = {i.likes.length}
                description = {i.description}
                author_id = {i.author}
                />
                )
        })}</div>
        :
        <>{
            !fetching ? 
            <div className = "message">Здесь пока что нет викторин</div>
            :
            <div className = "message">Загрузка...</div>
        }</>
    }
    </>
    )
}

export {QuizzesList, Quiz_item};