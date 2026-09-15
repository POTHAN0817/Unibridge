import { UserProfile } from "../../types";

/**
 * @deprecated TEMPORARY MOCK DATA - NOT USED FOR AUTHENTICATION
 * Authentication now strictly connects to FastAPI backend endpoints.
 * This file is retained only for historical mock schema reference.
 */
export const mockUsers: Record<string, UserProfile> = {
  citizen: {
    id: "usr-cit-001",
    name: "Sushmitha",
    email: "sushmitha@gmail.com",
    role: "citizen",
    avatar: "S",
    phone: "+91 98401 23456",
    state: "Jharkhand",
    district: "Ranchi",
    designation: "Resident & Community Volunteer",
    organization: "Ranchi Farmers Welfare Circle",
    joinedDate: "Jan 2026",
  },
  university: {
    id: "usr-uni-001",
    name: "Dr. Anjali Kumar",
    email: "anjali.kumar@baujharkhand.ac.in",
    role: "university",
    avatar: "AK",
    phone: "+91 94432 78901",
    state: "Jharkhand",
    district: "Ranchi",
    designation: "Head of Agricultural Engineering",
    organization: "Birsa Agricultural University, Ranchi",
    department: "Department of Agricultural & IoT Engineering",
    expertise: ["Cold Chain Infrastructure", "IoT Sensor Networks", "Post-Harvest Engineering"],
    joinedDate: "Nov 2025",
  },
  industry: {
    id: "usr-ind-001",
    name: "Rajesh Mehta",
    email: "rajesh.mehta@cooltechindia.com",
    role: "industry",
    avatar: "RM",
    phone: "+91 98200 45678",
    state: "Maharashtra",
    district: "Mumbai",
    designation: "VP, Sustainable Tech & Corporate Innovation",
    organization: "CoolTech India Pvt. Ltd.",
    sector: "CleanTech & Industrial IoT",
    expertise: ["Industrial Refrigeration", "Solar-Powered Cold Storage", "Supply Chain Systems"],
    capabilities: ["Mentorship", "Prototype Grant Funding", "Hardware Sensor Testing Kits", "Cloud Infrastructure"],
    joinedDate: "Dec 2025",
  },
  government: {
    id: "usr-gov-001",
    name: "Officer Rajan",
    email: "rajan.officer@dst.gov.in",
    role: "government",
    avatar: "OR",
    phone: "+91 98111 22334",
    state: "Jharkhand",
    district: "Ranchi",
    designation: "Director of Innovation & Rural Solutions",
    organization: "Department of Higher & Technical Education, Jharkhand",
    department: "Jharkhand Societal Innovation & Higher Ed Division",
    joinedDate: "Aug 2025",
  },
};
