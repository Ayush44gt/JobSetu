import api, { getErrorMessage } from '@/lib/api'
import { setUser } from '@/redux/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// saved jobs live on the logged in student; this reads and toggles them
const useSavedJobs = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const canSave = user?.role !== 'recruiter';
    const isSaved = (jobId) => Boolean(user?.savedJobs?.includes(jobId));

    const toggleSaved = async (jobId) => {
        if (!user) {
            toast.info("Please login to save jobs.");
            navigate("/login", { state: { from: location.pathname + location.search } });
            return;
        }
        try {
            const res = await api.post(`/user/saved/${jobId}`);
            dispatch(setUser({ ...user, savedJobs: res.data.savedJobs }));
            toast.success(res.data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    return { canSave, isSaved, toggleSaved };
}

export default useSavedJobs
