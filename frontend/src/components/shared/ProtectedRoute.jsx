import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

// `role` limits a page to students or recruiters; without it any logged in user may enter
const ProtectedRoute = ({children, role}) => {
    const {user} = useSelector(store=>store.auth);
    const location = useLocation();

    if(!user){
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }
    if(role && user.role !== role){
        return <Navigate to={user.role === 'recruiter' ? "/admin/jobs" : "/"} replace />
    }
    return children;
};

// login and signup are only for visitors who are not logged in
export const GuestRoute = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const location = useLocation();
    if(user){
        return <Navigate to={location.state?.from || (user.role === 'recruiter' ? "/admin/jobs" : "/")} replace />
    }
    return children;
};

export default ProtectedRoute;
