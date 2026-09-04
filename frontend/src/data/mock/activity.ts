import { ActivityItem } from "../../types";

export const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    event: "Kalasalingam Academy assembled the solar cold room pilot unit",
    time: "2 hours ago",
    type: "success",
    role: "university",
    link: "/university/projects/PRJ-2026-001",
  },
  {
    id: "act-2",
    event: "CoolTech India accepted IoT mentorship request for PRJ-2026-001",
    time: "4 hours ago",
    type: "info",
    role: "industry",
    link: "/industry/projects/PRJ-2026-001",
  },
  {
    id: "act-3",
    event: "Officer Rajan validated Challenge CF-2026-091 (Water Contamination, Kovilpatti)",
    time: "Yesterday",
    type: "success",
    role: "government",
    link: "/government/challenges/CF-2026-091",
  },
  {
    id: "act-4",
    event: "AI clustered 23 similar village reports for cold storage in Srivilliputhur",
    time: "3 days ago",
    type: "ai",
    role: "citizen",
    link: "/citizen/challenges/CF-2026-089",
  },
  {
    id: "act-5",
    event: "Citizen Sushmitha submitted a new challenge report on farmer post-harvest losses",
    time: "Jul 12, 2026",
    type: "neutral",
    role: "citizen",
    link: "/citizen/challenges/CF-2026-089",
  },
  {
    id: "act-6",
    event: "NIT Trichy deployed digital classroom kiosks across 42 schools in Dindigul",
    time: "Aug 15, 2026",
    type: "success",
    role: "university",
    link: "/university/projects/PRJ-2026-003",
  },
];
