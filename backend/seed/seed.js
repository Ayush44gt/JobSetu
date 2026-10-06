// Fills the database with demo data: recruiters, students, companies, jobs and applications.
// WARNING: this deletes every user, company, job and application in the database first.
// Run with: npm run seed
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

dotenv.config();

// every demo account uses this password
export const DEMO_PASSWORD = "Demo@1234";

// small seeded random generator so every run produces the same data
let seedState = 20240802;
const random = () => {
    seedState |= 0; seedState = seedState + 0x6D2B79F5 | 0;
    let t = Math.imul(seedState ^ seedState >>> 15, 1 | seedState);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const pick = (list) => list[Math.floor(random() * list.length)];
const pickMany = (list, count) => [...list].sort(() => random() - 0.5).slice(0, count);
const between = (min, max) => Math.floor(random() * (max - min + 1)) + min;
const daysAgo = (days, hours = 0) => new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000);

const avatar = (name) => `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}`;
const logo = (name) => `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}`;
const SAMPLE_RESUME = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const recruiters = [
    { fullname: "Riya Kapoor", email: "recruiter@jobsetu.dev", phoneNumber: "9810012345", bio: "Campus hiring lead. I read every application." },
    { fullname: "Arjun Mehta", email: "arjun.mehta@jobsetu.dev", phoneNumber: "9820023456", bio: "Engineering recruiter for product startups." },
    { fullname: "Sneha Iyer", email: "sneha.iyer@jobsetu.dev", phoneNumber: "9830034567", bio: "Talent partner, design and data roles." },
    { fullname: "Vikram Singh", email: "vikram.singh@jobsetu.dev", phoneNumber: "9840045678", bio: "" },
    { fullname: "Farah Khan", email: "farah.khan@jobsetu.dev", phoneNumber: "9850056789", bio: "University relations at a fintech." },
    // edge case: a recruiter who has not registered a company yet
    { fullname: "Dev Malhotra", email: "new.recruiter@jobsetu.dev", phoneNumber: "9860067890", bio: "" },
];

// [name, location, website, description, owner index, has logo]
const companies = [
    ["Zentrix Labs", "Bengaluru", "https://zentrixlabs.example.com", "Developer tools company building observability for small engineering teams.", 0, true],
    ["PaySaathi", "Mumbai", "https://paysaathi.example.com", "UPI-first payments and lending for neighbourhood merchants.", 0, true],
    ["Kisan Kart", "Pune", "https://kisankart.example.com", "Agri-commerce marketplace connecting farmers directly with retailers.", 0, true],
    ["Nimbus Health", "Hyderabad", "https://nimbushealth.example.com", "Telemedicine and digital health records for tier-2 cities.", 1, true],
    ["CodeNest", "Bengaluru", "https://codenest.example.com", "Ed-tech platform teaching programming through real projects.", 1, true],
    ["Pixel Mandi", "Delhi NCR", "https://pixelmandi.example.com", "Design studio and marketplace for Indian illustrators.", 2, true],
    ["DataDhara", "Chennai", "https://datadhara.example.com", "Analytics consultancy for retail and logistics companies.", 2, true],
    ["GreenGrid Energy", "Ahmedabad", "https://greengrid.example.com", "Rooftop solar monitoring and energy trading.", 3, true],
    ["Yatra Stack", "Delhi NCR", "https://yatrastack.example.com", "Travel infrastructure APIs for booking platforms.", 3, false],
    ["Finlytics", "Mumbai", "https://finlytics.example.com", "Wealth-tech company making investing simple for first-time earners.", 4, true],
    ["Bharat Logistics Tech", "Kolkata", "", "Route optimisation software for last-mile delivery fleets.", 4, true],
    // edge case: a company with only a name, as created by the first registration step
    ["Stealth Startup", "", "", "", 4, false],
];

// [title, description, requirements, salary range LPA, experience range, job types]
const roles = [
    ["Frontend Developer", "Build fast, accessible interfaces in React and work closely with designers to ship features every week.", ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"], [6, 18], [0, 3], ["Full-time"]],
    ["Backend Developer", "Design and maintain REST APIs, data models and background jobs that serve millions of requests a day.", ["Node.js", "Express", "MongoDB", "REST APIs", "Redis"], [7, 22], [1, 4], ["Full-time"]],
    ["FullStack Developer", "Own features end to end, from the database schema to the pixels on screen.", ["React", "Node.js", "MongoDB", "TypeScript", "Git"], [8, 24], [1, 5], ["Full-time", "Contract"]],
    ["Data Science Intern", "Work with our analytics team on forecasting models and dashboards during a six month internship.", ["Python", "Pandas", "SQL", "Statistics"], [3, 6], [0, 0], ["Internship"]],
    ["Data Analyst", "Turn raw business data into clear reports and recommendations for the leadership team.", ["SQL", "Excel", "Power BI", "Python"], [5, 12], [0, 2], ["Full-time"]],
    ["Graphic Designer", "Create brand illustrations, social media creatives and marketing collateral.", ["Figma", "Illustrator", "Photoshop", "Typography"], [3, 9], [0, 3], ["Full-time", "Part-time", "Contract"]],
    ["UI/UX Designer", "Research user problems, prototype solutions and maintain our design system.", ["Figma", "User Research", "Prototyping", "Design Systems"], [6, 16], [1, 4], ["Full-time"]],
    ["DevOps Engineer", "Automate deployments, improve reliability and keep our cloud bill under control.", ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"], [10, 28], [2, 6], ["Full-time"]],
    ["Android Developer", "Build and ship our Android app used by lakhs of users on low-end devices.", ["Kotlin", "Android SDK", "Jetpack Compose", "REST APIs"], [7, 20], [1, 4], ["Full-time"]],
    ["Machine Learning Engineer", "Train, evaluate and deploy models that power search and recommendations.", ["Python", "PyTorch", "MLOps", "SQL"], [12, 32], [2, 6], ["Full-time"]],
    ["QA Engineer", "Write automated tests and own release quality across web and mobile.", ["Selenium", "Cypress", "JavaScript", "Test Planning"], [5, 13], [0, 3], ["Full-time", "Contract"]],
    ["Product Management Intern", "Support product managers with user interviews, specs and launch analysis.", ["Communication", "Excel", "User Research"], [3, 5], [0, 0], ["Internship"]],
    ["Software Engineering Intern", "Six month internship with a real project, a mentor and a pre-placement offer for strong performers.", ["Data Structures", "JavaScript", "Git"], [3, 7], [0, 0], ["Internship"]],
    ["Content Writer", "Write product documentation, blog posts and help articles.", ["Writing", "SEO", "Editing"], [3, 7], [0, 2], ["Part-time", "Full-time"]],
    ["Customer Success Associate", "Help customers get value from the product and bring their feedback to the team.", ["Communication", "CRM", "Problem Solving"], [4, 8], [0, 2], ["Full-time"]],
];

const jobLocations = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Remote"];

const skillPool = ["React", "JavaScript", "TypeScript", "Node.js", "Express", "MongoDB", "SQL", "Python", "Java", "C++", "Figma", "Tailwind CSS", "Docker", "AWS", "Git", "Pandas", "Power BI", "Kotlin", "Next.js", "Redux"];

const studentNames = [
    "Aarav Sharma", "Ananya Gupta", "Kabir Verma", "Ishita Nair", "Rohan Das", "Meera Pillai", "Aditya Rao", "Sara Thomas",
    "Yash Patel", "Diya Reddy", "Karan Bhatia", "Tanvi Joshi", "Nikhil Menon", "Pooja Chauhan", "Siddharth Jain", "Zoya Ahmed",
    "Harsh Vardhan", "Lakshmi Krishnan", "Manav Arora", "Neha Kulkarni", "Om Prakash", "Ritika Saxena", "Tushar Banerjee", "Aisha Siddiqui",
];
const colleges = ["IIT Delhi", "NIT Trichy", "BITS Pilani", "VIT Vellore", "DTU", "Jadavpur University", "PES University", "COEP Pune"];

const run = async () => {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in backend/.env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to database "${mongoose.connection.name}"`);

    await Promise.all([User.deleteMany({}), Company.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);
    await Application.syncIndexes();
    console.log("Cleared existing users, companies, jobs and applications");

    const password = await bcrypt.hash(DEMO_PASSWORD, 10);

    // ---- recruiters
    const recruiterDocs = await User.insertMany(recruiters.map((recruiter, index) => ({
        fullname: recruiter.fullname,
        email: recruiter.email,
        phoneNumber: recruiter.phoneNumber,
        password,
        role: "recruiter",
        profile: { bio: recruiter.bio, profilePhoto: index === 3 ? "" : avatar(recruiter.fullname) },
        createdAt: daysAgo(120 - index * 3),
    })));

    // ---- students
    const students = studentNames.map((fullname, index) => {
        const email = index === 0 ? "student@jobsetu.dev" : `${fullname.toLowerCase().replace(/\s+/g, ".")}@jobsetu.dev`;
        const college = colleges[index % colleges.length];
        const skills = pickMany(skillPool, between(3, 7));
        return {
            fullname,
            email,
            phoneNumber: `9${String(700000000 + index * 1234567).slice(0, 9)}`,
            password,
            role: "student",
            profile: {
                bio: `Final year student at ${college}. Interested in ${skills[0]} and ${skills[1]}.`,
                skills,
                resume: SAMPLE_RESUME,
                resumeOriginalName: `${fullname.replace(/\s+/g, "_")}_Resume.pdf`,
                profilePhoto: avatar(fullname),
            },
            createdAt: daysAgo(90 - index * 2),
        };
    });
    // edge cases
    Object.assign(students[5].profile, { resume: "", resumeOriginalName: "" });                       // no resume
    Object.assign(students[9].profile, { skills: [], bio: "" });                                      // empty profile
    Object.assign(students[13].profile, { profilePhoto: "" });                                        // no photo
    Object.assign(students[17].profile, {                                                              // very long bio and many skills
        bio: "Computer science undergraduate who has spent the last three years building side projects, contributing to open source, organising the college hackathon and mentoring juniors in the coding club. Looking for a role where I can keep learning from people who care about craft.",
        skills: skillPool.slice(0, 14),
    });
    Object.assign(students[23].profile, { resume: "", resumeOriginalName: "", skills: [], bio: "", profilePhoto: "" }); // brand new account
    const studentDocs = await User.insertMany(students);

    // ---- companies
    const companyDocs = await Company.insertMany(companies.map(([name, location, website, description, owner, hasLogo], index) => ({
        name,
        location,
        website,
        description,
        logo: hasLogo ? logo(name) : "",
        userId: recruiterDocs[owner]._id,
        createdAt: daysAgo(100 - index * 4),
    })));

    // ---- jobs (the bare "Stealth Startup" company deliberately has none)
    const jobs = [];
    companyDocs.slice(0, -1).forEach((company, companyIndex) => {
        const companyRoles = pickMany(roles, between(4, 6));
        companyRoles.forEach(([title, description, requirements, salaryRange, experienceRange, jobTypes]) => {
            jobs.push({
                title,
                description: `${description} You will join ${company.name}, a ${companies[companyIndex][3].charAt(0).toLowerCase()}${companies[companyIndex][3].slice(1)}`,
                requirements,
                salary: between(salaryRange[0], salaryRange[1]),
                experienceLevel: between(experienceRange[0], experienceRange[1]),
                location: random() < 0.6 ? companies[companyIndex][1] : pick(jobLocations),
                jobType: pick(jobTypes),
                position: between(1, 12),
                isOpen: true,
                company: company._id,
                created_by: company.userId,
                createdAt: daysAgo(between(0, 45), between(0, 23)),
            });
        });
    });
    // edge cases
    jobs[0].createdAt = daysAgo(0, 1);                                   // posted today
    jobs[1].isOpen = false;                                              // closed jobs
    jobs[7].isOpen = false;
    jobs[20].isOpen = false;
    Object.assign(jobs[3], { salary: 0, jobType: "Internship", experienceLevel: 0, title: "Campus Ambassador (Unpaid)" }); // unpaid role
    Object.assign(jobs[11], { position: 1, salary: 45, experienceLevel: 8, jobType: "Full-time", title: "Principal Engineer" });                // senior, single opening
    jobs[14].requirements = [];                                          // no requirements listed
    jobs[16].description = `${jobs[16].description}\n\nWhat you will do:\n- Work in a small team with a lot of ownership.\n- Ship to production in your first week.\n- Review code and get your code reviewed.\n- Talk to users regularly.\n\nWhat we offer:\n- Health insurance for you and your family.\n- A learning budget and conference travel.\n- Flexible working hours and a hybrid office.\n\nHiring process: a short take-home exercise, one technical conversation and one conversation with the founders. We respond to every applicant within ten days.`; // long description
    const jobDocs = await Job.insertMany(jobs);

    // ---- applications
    const applications = [];
    const noApplicantJobs = new Set([jobDocs[2]._id.toString(), jobDocs[9]._id.toString(), jobDocs[30]._id.toString()]); // jobs nobody applied to
    const inactiveStudents = new Set([studentDocs[22]._id.toString(), studentDocs[23]._id.toString()]);                  // students who never applied
    jobDocs.forEach((job, jobIndex) => {
        if (noApplicantJobs.has(job._id.toString())) return;
        const count = jobIndex === 0 ? 18 : between(1, 7); // one very popular job
        const applicants = pickMany(studentDocs.filter((student) => !inactiveStudents.has(student._id.toString())), count);
        applicants.forEach((student) => {
            const roll = random();
            const status = roll < 0.55 ? "pending" : roll < 0.75 ? "accepted" : "rejected";
            const jobAge = Math.max(0, Math.floor((Date.now() - job.createdAt.getTime()) / (24 * 60 * 60 * 1000)));
            applications.push({
                job: job._id,
                applicant: student._id,
                status,
                createdAt: daysAgo(between(0, jobAge), between(0, 12)),
            });
        });
    });
    const applicationDocs = await Application.insertMany(applications);

    // link applications back onto their jobs
    const byJob = {};
    applicationDocs.forEach((application) => {
        (byJob[application.job.toString()] ||= []).push(application._id);
    });
    await Job.bulkWrite(Object.entries(byJob).map(([jobId, ids]) => ({
        updateOne: { filter: { _id: jobId }, update: { $set: { applications: ids } } }
    })));

    // ---- saved jobs for a few students
    const openJobs = jobDocs.filter((job) => job.isOpen);
    await User.bulkWrite(studentDocs.slice(0, 10).map((student) => ({
        updateOne: {
            filter: { _id: student._id },
            update: { $set: { savedJobs: pickMany(openJobs, between(2, 6)).map((job) => job._id) } }
        }
    })));

    const statusCount = (status) => applicationDocs.filter((application) => application.status === status).length;
    console.log(`\nSeeded:`);
    console.log(`  ${recruiterDocs.length} recruiters, ${studentDocs.length} students`);
    console.log(`  ${companyDocs.length} companies`);
    console.log(`  ${jobDocs.length} jobs (${jobDocs.filter((job) => !job.isOpen).length} closed)`);
    console.log(`  ${applicationDocs.length} applications (${statusCount("pending")} pending, ${statusCount("accepted")} accepted, ${statusCount("rejected")} rejected)`);
    console.log(`\nDemo logins (password for every account: ${DEMO_PASSWORD})`);
    console.log(`  student:   student@jobsetu.dev`);
    console.log(`  recruiter: recruiter@jobsetu.dev`);
    console.log(`  recruiter with no company yet: new.recruiter@jobsetu.dev`);

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});
