import { ImpactStory } from "../../types";

export const mockImpactStories: ImpactStory[] = [
  {
    id: "imp-1",
    title: "Smart Cold Chain for Rural Farmers",
    location: "Srivilliputhur, Tamil Nadu",
    category: "Agriculture",
    university: "Kalasalingam Academy",
    before: { metric: "35%", label: "Post-harvest vegetable loss" },
    after: { metric: "8%", label: "Post-harvest vegetable loss" },
    impact: { benefited: "4,500+", satisfaction: "94%", score: "89/100" },
    replication: { potential: "HIGH", districts: 63 },
    color: "#10B981",
  },
  {
    id: "imp-2",
    title: "AI-Driven Real-time Water Monitoring",
    location: "Kovilpatti, Tamil Nadu",
    category: "Water & Sanitation",
    university: "Anna University (BIT Campus)",
    before: { metric: "7 DAYS", label: "Water contamination testing delay" },
    after: { metric: "1 DAY", label: "Automated real-time alert" },
    impact: { benefited: "8,200+", satisfaction: "89%", score: "92/100" },
    replication: { potential: "VERY HIGH", districts: 47 },
    color: "#0B63F6",
  },
  {
    id: "imp-3",
    title: "Digital Classroom STEM Kiosks",
    location: "Dindigul, Tamil Nadu",
    category: "Education",
    university: "NIT Trichy",
    before: { metric: "0%", label: "Schools with interactive digital lab" },
    after: { metric: "78%", label: "STEM comprehension increase" },
    impact: { benefited: "1,200+", satisfaction: "96%", score: "94/100" },
    replication: { potential: "VERY HIGH", districts: 112 },
    color: "#8B5CF6",
  },
];

export const nationalImpactStats = {
  totalChallengesReported: "1,245",
  activeSolutions: "75",
  universitiesConnected: "32",
  citizensImpacted: "15,000+",
  industryPartners: "18",
  districtsCovered: "38",
  avgResolutionTime: "42 Days",
  avgSatisfactionScore: "91%",
};

export const categoryBreakdown = [
  { name: "Agriculture", value: 342, fill: "#10B981" },
  { name: "Water & Sanitation", value: 281, fill: "#0B63F6" },
  { name: "Healthcare", value: 198, fill: "#EF4444" },
  { name: "Education", value: 167, fill: "#8B5CF6" },
  { name: "Environment", value: 143, fill: "#F59E0B" },
  { name: "Infrastructure", value: 114, fill: "#00C2FF" },
];

export const monthlyTrends = [
  { month: "Mar", challenges: 78, resolved: 12, citizens: 800 },
  { month: "Apr", challenges: 92, resolved: 28, citizens: 2200 },
  { month: "May", challenges: 115, resolved: 41, citizens: 4100 },
  { month: "Jun", challenges: 138, resolved: 55, citizens: 6800 },
  { month: "Jul", challenges: 162, resolved: 78, citizens: 9500 },
  { month: "Aug", challenges: 189, resolved: 96, citizens: 12400 },
  { month: "Sep", challenges: 201, resolved: 112, citizens: 15000 },
];
