async function useLoginStatus(){
    let res = await fetch("/api/users/user").then(res=>res.json());

    return res.authenticated
}

export default useLoginStatus;