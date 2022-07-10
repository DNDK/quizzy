import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {useNavigate} from "react-router-dom";   

import "./quiz.css";

function QuizOption(props){
    return(
        <div className = {`quiz-option ${props.selected ? "quiz-selected-option" : ""}`} onClick = {props.onClick}>
            {props.text}
        </div>
    )
}

function Question(props){
    return(
        <div className = "question">
            <h3 className = "question-question">{props.question.question}</h3>
            <div className = "options-section">
                {
                    props.question.options.map((i, ind)=>{
                        return (<QuizOption 
                            text = {i.text} 
                            onClick = {()=>{props.onAnswer(props.questionIndex, ind)}} 
                            selected = {props.selectedOption == ind}/>)
                    })
                }
            </div>
        </div>
    )
}

function Quiz(props){
    const {id} = useParams();
    const [state, setState] = useState({
    });
    const navigate = useNavigate();
    useEffect(()=>{
        fetch(`/api/quizzes/${id}`).then(res=>res.json()).then((res)=>{
            fetch("/api/getCsrf").then(res=>res.json()).then(tres=>{
                setState({
                    ...state,
                    csrf_token: tres.token,
                    quiz: res, 
                    answers: []
                })
            })
        }).catch((error)=>{
            
        })

        
    }, [])

    const onAnswer = (question, answer) => {
        if(state.answers.find(answer => answer.question == question)){
                let answers = state.answers;
                let index = answers.findIndex(answer => answer.question == question);
                answers[index] = {question, answer};
                setState({
                    ...state,
                    answers
                })
        }else{
            setState({
                ...state,
                answers: [...state.answers, {question, answer}]
            });
        }
    }

    const onSubmit = ()=>{
        const req = {id: id, answers: state.answers};
        fetch("/api/quizzes/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Csrf-Token": state.csrf_token
            },
            body: JSON.stringify(req)
        }).then(res=>res.json()).then(res => {
            navigate("/quizzes/result", {state: {
                result: res.result,
                quiz_name: state.quiz.name,
                quiz_id: state.quiz._id
            }})
        })
    }

    return(
        <>
        {state.quiz? (
            <div className = "quiz">
                <h2 className = "quiz-name">{state.quiz.name}</h2>
                <div>
                    {
                        state.quiz.questions.map((i, ind)=>{
                            let selected_option;
                            if(state.answers.length == 0){
                                selected_option = -1;
                            }else{
                                let answer = state.answers.find(answer => answer.question == ind);
                                selected_option = answer ? answer.answer : -1;
                            }
                            return (<Question 
                                question = {i} 
                                questionIndex = {ind} 
                                onAnswer = {onAnswer} 
                                selectedOption = {selected_option}/>)
                        })
                    }
                </div>
                <div onClick = {onSubmit} className = "submit-button">Отправить</div>
            </div>
        ) : "Загрузка"}
        </>
    )
}

export default Quiz;