import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Quiz from "./quiz";
import "./constructor.css";
import TextareaAtosize from "react-textarea-autosize";

function OptionConstructor(props){
    return(
        <div className = "option-constructor">
            <input
            onChange = {(event) => {props.onTextChange(props.question_index, props.index, event.target.value)}}
            className = "option-constructor-text"/> &nbsp;
            <span 
            onClick = {() => {props.onStateToggle(props.question_index, props.index)}}
            className = {`option-state-indicator ${props.state ? "option-state-true" : "option-state-false"}`}
            >
                {props.state ? "Правильный" : "Неправильный"}
            </span>
        </div>
    )
}

function QuestionConstructor(props){
    return(
        <div className = "question-constructor">
            <input 
            value={props.question} 
            onChange = {(event) => {props.onQuestionChange(props.index, event.target.value)}}
            className = "question-constructor-name"/>
            <br/>
            <div 
            onClick = {() => {props.onOptionAdd(props.index)}}
            className = "button">Добавить вариант ответа</div>
            {
                props.options.map((option, index) => {
                    return(
                        <OptionConstructor 
                        onTextChange = {props.onOptionTextChange}
                        onStateToggle = {props.onOptionStateToggle}
                        value = {option.text}
                        state = {option.is_true}
                        index = {index}
                        question_index = {props.index}
                        />
                    )
                })
            }
        </div>
    )
}

function QuizConstructor(){
    const [quiz, setQuiz] = useState({
        name: "",
        description: "",
        questions: [],
        category: "other",
        csrf_token: ""
    });
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        fetch("/api/users/user").then(res=>res.json()).then(res=>{
            if(res.authenticated) setAuthenticated(true);
            else navigate("/users/login");

        })
        fetch("/api/getCsrf").then(res=>res.json()).then(res=>{
            setQuiz({
                ...quiz,
                csrf_token: res.token
            })
        })
    }, [])

    const handleAddQuestion = (event) =>{
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, {
                question: "",
                options: []
            }]
        })
    }

    const handleQuestionChange = (ind, new_question)=>{
        let questions = [...quiz.questions];

        questions[ind].question = new_question;
        setQuiz({
            ...quiz,
            questions
        });
    }
    
    const handleNameChange = (event) => {
        setQuiz({
            ...quiz,
            name: event.target.value
        })
    }

    const handleDescriptionChange = (event) => {
        setQuiz({
            ...quiz,
            description: event.target.value
        })
    }

    const handleCategorySelect = (event) => {
        setQuiz({
            ...quiz,
            category: event.target.value
        })
    }

    const handleOptionAdd = (ind) => {
        let questions = [...quiz.questions];

        if(questions[ind].options.length > 0){
            let i = questions[ind].options.findIndex(option => option.is_true);
            questions[ind].options[i].is_true = false;
        }
        questions[ind].options.push({
            text: "",
            is_true: true
        });

        setQuiz({
            ...quiz,
            questions
        })

    }

    const handleOptionTextChange = (qind, oind, text) => {
        let questions = [...quiz.questions];
        
        questions[qind].options[oind].text = text;
        setQuiz({
            ...quiz,
            questions
        })
    }

    const handleOptionStateToggle = (qind, oind) => {
        let questions = [...quiz.questions];
        let new_state = !questions[qind].options[oind].is_true;
        if(new_state){
            let prevtrueopt = questions[qind].options.findIndex(opt => opt.is_true);
            questions[qind].options[prevtrueopt].is_true = false;
        }
        questions[qind].options[oind].is_true = new_state;
        setQuiz({
            ...quiz,
            questions
        });
    }

    const handleSubmit = ()=>{
        const req = {
            name: quiz.name,
            questions: quiz.questions,
            description: quiz.description,
            category: quiz.category
        };

        fetch("/api/quizzes/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "CSRF-Token": quiz.csrf_token
            },
            body: JSON.stringify(req)

        }).then(res => res.json()).then(res => {
            if(res.ok){
                navigate(`/quizzes/${res.id}`)
            }else{
                setError(true);
            }
        })
    }

    return(
        <>{
            authenticated ? 
            <div className = "quiz-constructor">
                {error ? <div className = "error-message">Произошла ошибка</div> : ""}
                <input onChange = {handleNameChange} className = "quiz-constructor-name"/><br/>
                <select onChange={handleCategorySelect} className = "quiz-constructor-category">
                    <option value = "other">Другое</option>
                    <option value = "science">Наука</option>
                    <option value = "sport">Спорт</option>
                    <option value = "books">Книги</option>
                    <option value = "movies">Кино</option>
                </select>
                <TextareaAtosize 
                className = "quiz-constructor-description" 
                onChange = {handleDescriptionChange} 
                minRows = {10}
                />
                <div>{
                    quiz.questions.map((i, ind) => {
                        return(
                            <QuestionConstructor
                            question = {i.question}
                            index = {ind}
                            options = {i.options}

                            onQuestionChange = {handleQuestionChange}
                            onOptionAdd = {handleOptionAdd}
                            onOptionTextChange = {handleOptionTextChange}
                            onOptionStateToggle = {handleOptionStateToggle}
                            />
                        )
                    })    
                }</div>
                <div onClick = {handleAddQuestion} className = "button">Добавить вопрос</div><br/>
                <div onClick = {handleSubmit} className = "submit-button">Готово</div>
            </div>
            :
            <div className = "message">Загрузка...</div>
        }</>
    )
}

export default QuizConstructor;