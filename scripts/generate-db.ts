import * as mockData from "../src/lib/mock-data";
import fs from "fs";

const db = {
  roadmaps: mockData.mockRoadmaps,
  ngoChallenges: mockData.mockNgoChallenges,
  projects: mockData.mockProjects,
  submissions: mockData.mockSubmissions,
  applications: mockData.mockApplications,
};

fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
console.log("db.json generated successfully.");
