/**
 * Aaron's Authentic Master Template & Experience Bank Data
 * Extracted directly from Aboutme_coverletter
 */

export function getAaronStarterData() {
  return {
    masterTemplate: {
      intro: "I am currently a student at Brigham Young University–Idaho, projected to graduate in December 2026 with a bachelor's degree in Computer Science. Throughout my life, I've enjoyed creating, designing, and implementing new tools to help solve problems that I encounter.",
      seniorProject: "During my senior year at the university, I have been able to build and deploy software for local businesses, including a project for Sunny Car Detailing where I migrated records for hundreds of users and set up an automated deployment pipeline using GitHub Actions and Vercel. I constantly work with data, managing production and deployment pipelines while taking precautions to protect company data. Through my internships, including my time with Downwinders Advocates, I have handled data transitions between software systems, exported complex data, and troubleshot pipeline errors.",
      learningPhilosophy: "I am a quick learner who thrives on the job. Whatever I am doing professionally, I take pride in finding resources that help me rise to a higher level every day. Once I start a project, I stay fully engaged; even after the initial work is done, I keep thinking in the back of my mind about how to improve it.",
      closingGoal: "I am looking for an opportunity where I can grow, which is why I feel like [Insert Company Name] would be a great fit. Here, I would be able to build real tools under professional guidance and work alongside experienced engineers who can help me grow in a professional way.",
      graduationDate: "December 2026",
      university: "Brigham Young University–Idaho",
      defaultGreeting: "Dear [Company Name] Hiring Team,"
    },
    experiences: [
      {
        id: "fresh-paint",
        title: "Leadership, Business Ownership, and Customer Relations — Fresh Paint Solutions",
        category: "Leadership",
        storyText: "I spent three years working as a crew leader and managing my own business, Fresh Paint Solutions. Through this experience, I worked directly with customers and learned the importance of communication, setting clear expectations, and making sure the job was completed correctly. I learned how important it is to be dependable and take responsibility for the work I do.",
        relevantFor: ["Leadership", "Operations", "Customer Success", "Consulting", "Project Management"],
        bulletPoints: [
          "Leadership and accountability",
          "Customer relationships and communication",
          "Quality assurance and meeting expectations",
          "Problem-solving in real-world situations"
        ],
        order: 1
      },
      {
        id: "remote-coursework",
        title: "Self-Motivation, Remote Work, and Time Management — BYU-Idaho",
        category: "Work Ethic",
        storyText: "Throughout my time at BYU–Idaho, I have completed multiple semesters of coursework online, which has helped me become very comfortable working independently and managing my time. I've learned how to stay motivated, organize my responsibilities, and balance multiple projects while continuing to learn new skills.",
        relevantFor: ["Remote Work", "Hybrid", "Time Management", "Self-Motivation"],
        bulletPoints: [
          "Remote work readiness",
          "Time management & independent learning",
          "Balancing competing priorities"
        ],
        order: 2
      },
      {
        id: "chile-bilingual",
        title: "Spanish Fluency and International Experience — Chile",
        category: "Bilingual",
        storyText: "I lived in Chile for two years, where I became fluent in conversational Spanish. That experience taught me how to communicate with people from different backgrounds and adapt to new environments. I'm comfortable communicating in Spanish and learning job-specific terminology when needed.",
        relevantFor: ["Spanish", "Bilingual", "Customer Support", "Cross-cultural Communication"],
        bulletPoints: [
          "Conversational Spanish fluency",
          "Cross-cultural adaptability",
          "Interpersonal communication"
        ],
        order: 3
      },
      {
        id: "databases-cloud",
        title: "Databases and Cloud Platforms — AWS, Firebase, MySQL",
        category: "Technical",
        storyText: "Through my coursework and software projects, I've gained experience working with different types of databases and cloud services, including AWS, Firebase, and relational databases such as MySQL. I've enjoyed learning the differences between these systems, understanding their strengths, and finding which approach works best for a particular project.",
        relevantFor: ["AWS", "Firebase", "Firestore", "SQL", "MySQL", "Cloud Infrastructure"],
        bulletPoints: [
          "AWS (DynamoDB, Lambda)",
          "Firebase & Firestore",
          "Relational databases and SQL design"
        ],
        order: 4
      },
      {
        id: "sunny-detailing",
        title: "Software Development and Deployment — Sunny Car Detailing",
        category: "Technical",
        storyText: "During my senior year, I worked on building and deploying a fleet management application for Sunny Car Detailing. This included working with TypeScript, Firebase, GitHub Actions, and Vercel to develop features, manage data, and maintain the application. I've enjoyed seeing how different technologies come together to create a tool that people can actually use.",
        relevantFor: ["TypeScript", "Next.js", "Firebase", "GitHub Actions", "Vercel", "Full-stack"],
        bulletPoints: [
          "Fleet management web application",
          "Automated deployment workflows",
          "Data management and integrations"
        ],
        order: 5
      },
      {
        id: "downwinders-migration",
        title: "Data Migration and Troubleshooting — Downwinders Advocates",
        category: "Data",
        storyText: "During my internship with Downwinders Advocates, I worked on transitioning information between different software platforms. This involved organizing data, exporting and formatting records, working through integration issues, and troubleshooting errors to ensure the data was transferred correctly.",
        relevantFor: ["Data Migration", "Data Cleaning", "Python Scripts", "Troubleshooting", "Integrations"],
        bulletPoints: [
          "Data cleaning and transformation",
          "Python scripts for CSV/JSON processing",
          "Troubleshooting pipeline errors"
        ],
        order: 6
      },
      {
        id: "python-sql-analytics",
        title: "Python, SQL, and Data Analysis",
        category: "Data",
        storyText: "I've worked with Python, Pandas, and SQL through my coursework and personal projects, where I've learned how to organize, transform, and work with different types of data. I enjoy finding ways to make repetitive processes more efficient and using data to better understand and solve problems.",
        relevantFor: ["Python", "Pandas", "SQL", "Data Analysis", "Automation"],
        bulletPoints: [
          "Python data pipelines & automation",
          "Pandas & BigQuery",
          "CSV/JSON processing and reports"
        ],
        order: 7
      },
      {
        id: "adapting-quickly",
        title: "Learning New Technologies and Adapting Quickly",
        category: "Growth",
        storyText: "One of the strengths I bring to a team is that I am dependable and quick to learn. I know that I am still early in my career, but I've found that when I am given a new challenge, I can research what I need, learn the tools, and work toward a solution. I enjoy the process of figuring things out and becoming better at what I do.",
        relevantFor: ["Entry-Level", "Startups", "Adaptability", "Fast Learner"],
        bulletPoints: [
          "Independent technical research",
          "Rapid adoption of new libraries and frameworks",
          "Strong accountability"
        ],
        order: 8
      }
    ]
  };
}
