export const timeAgo = (date) => {
    if (!date) return "";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
}

export const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// salary is stored in LPA (lakhs per annum)
export const formatSalary = (salary) => {
    if (salary === undefined || salary === null) return "—";
    if (Number(salary) === 0) return "Unpaid";
    return `₹${salary} LPA`;
}

export const formatExperience = (years) => {
    if (years === undefined || years === null) return "—";
    if (Number(years) === 0) return "Fresher";
    return `${years}+ ${Number(years) === 1 ? "year" : "years"}`;
}

export const initials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
