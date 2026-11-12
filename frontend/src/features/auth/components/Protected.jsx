import { useSelector } from "react-redux"
import { selectLoggedInUser } from "../AuthSlice"
import { Navigate, useLocation } from "react-router-dom"


export const Protected = ({children}) => {
    const loggedInUser=useSelector(selectLoggedInUser)
    const location=useLocation()

    if(loggedInUser?.isVerified){
        return children
    }
    return <Navigate to="/login" state={{from:location}} replace/>
}
