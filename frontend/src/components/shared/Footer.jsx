import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Logo from './Logo'

const guestLinks = [
  { to: "/jobs", label: "Browse jobs" },
  { to: "/signup", label: "Create account" },
  { to: "/login", label: "Login" },
];
const studentLinks = [
  { to: "/jobs", label: "Browse jobs" },
  { to: "/saved", label: "Saved jobs" },
  { to: "/profile", label: "Profile" },
];
const recruiterLinks = [
  { to: "/admin/jobs", label: "Jobs" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/profile", label: "Profile" },
];

const Footer = () => {
  const { user } = useSelector(store => store.auth);
  const links = !user ? guestLinks : user.role === 'recruiter' ? recruiterLinks : studentLinks;

  return (
    <footer className="mt-20 border-t bg-card">
      <div className="page flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
        <div>
          <Logo to={user?.role === 'recruiter' ? "/admin/jobs" : "/"} />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">Connecting students with internships and jobs shared by recruiters.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((link) => <Link key={link.to} to={link.to} className="hover:text-foreground">{link.label}</Link>)}
        </nav>
      </div>
      <div className="border-t">
        <p className="page py-4 text-xs text-muted-foreground">© {new Date().getFullYear()} JobSetu. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
