import { useEffect } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Profile from './components/Profile'
import SavedJobs from './components/SavedJobs'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute, { GuestRoute } from './components/shared/ProtectedRoute'
import Layout from './components/shared/Layout'
import NotFound from './components/shared/NotFound'
import { PageLoader } from './components/shared/States'
import api, { setUnauthorizedHandler } from './lib/api'
import { setUser } from './redux/authSlice'
import store from './redux/store'

// old /browse links keep working and carry their search over to /jobs
const BrowseRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/jobs${location.search}`} replace />
}

const recruiter = (element) => <ProtectedRoute role="recruiter">{element}</ProtectedRoute>

const appRouter = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <GuestRoute><Login /></GuestRoute> },
      { path: '/signup', element: <GuestRoute><Signup /></GuestRoute> },
      { path: "/jobs", element: <Jobs /> },
      { path: "/browse", element: <BrowseRedirect /> },
      { path: "/description/:id", element: <JobDescription /> },
      { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "/saved", element: <ProtectedRoute role="student"><SavedJobs /></ProtectedRoute> },
      // admin ke liye yha se start hoga
      { path: "/admin", element: <Navigate to="/admin/jobs" replace /> },
      { path: "/admin/companies", element: recruiter(<Companies />) },
      { path: "/admin/companies/create", element: recruiter(<CompanyCreate />) },
      { path: "/admin/companies/:id", element: recruiter(<CompanySetup />) },
      { path: "/admin/jobs", element: recruiter(<AdminJobs />) },
      { path: "/admin/jobs/create", element: recruiter(<PostJob />) },
      { path: "/admin/jobs/:id/edit", element: recruiter(<PostJob />) },
      { path: "/admin/jobs/:id/applicants", element: recruiter(<Applicants />) },
      { path: "*", element: <NotFound /> },
    ]
  }
])

// when any request comes back 401 the session has expired, so forget the user
setUnauthorizedHandler(() => {
  if (store.getState().auth.user) store.dispatch(setUser(null));
});

function App() {
  const dispatch = useDispatch();
  const { checked } = useSelector(store => store.auth);

  // restore the session from the httpOnly cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me", { skipAuthRedirect: true });
        dispatch(setUser(res.data.user));
      } catch (error) {
        dispatch(setUser(null));
      }
    }
    fetchUser();
  }, [dispatch]);

  if (!checked) return <PageLoader />

  return <RouterProvider router={appRouter} />
}

export default App
