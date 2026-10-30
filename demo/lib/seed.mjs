import { MongoClient } from "mongodb";
import { API_URL, MONGO_URI } from "./servers.mjs";
import { log } from "./util.mjs";

// All people, companies and emails below are fictional (example.com is a reserved domain).
export const PASSWORD = "DemoPass!2026";

export const USERS = {
  client: { fullName: "Maya Thompson", email: "maya.thompson@example.com", role: "client" },
  otherClient: { fullName: "Jordan Ellis", email: "jordan.ellis@example.com", role: "client" },
  lawyer: {
    fullName: "Daniel Reyes",
    email: "daniel.reyes@example.com",
    role: "lawyer",
    bio: "Property and tenancy litigation, 12 years of practice.",
  },
  lawyer2: {
    fullName: "Priya Nair",
    email: "priya.nair@example.com",
    role: "lawyer",
    bio: "Corporate and commercial contracts.",
  },
  lawyer3: {
    fullName: "Samuel Okafor",
    email: "samuel.okafor@example.com",
    role: "lawyer",
    bio: "Family law and mediation.",
  },
};

export const DEMO_CASE = {
  title: "Harbor Lane Lease Dispute",
  caseType: "Property",
  description:
    "Landlord is withholding my $2,400 security deposit and refuses to repair a leaking roof reported three times in writing.",
  tags: "lease, deposit, urgent",
};

const PRIOR_CASES = [
  {
    title: "Ellis Logistics Contract Breach",
    caseType: "Corporate",
    description: "Supplier missed four delivery deadlines under a fixed-term logistics contract.",
    tags: ["contract", "damages"],
    status: "In Progress",
  },
  {
    title: "Ellis Property Boundary Claim",
    caseType: "Property",
    description: "Neighbour's new fence encroaches 1.2 metres onto the client's lot.",
    tags: ["property", "survey"],
    status: "Closed",
  },
];

async function api(method, route, body, token) {
  const res = await fetch(`${API_URL}${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${JSON.stringify(data)}`);
  return data;
}

export async function login(email) {
  const data = await api("POST", "/api/auth/login", { email, password: PASSWORD });
  return { token: data.token, user: data.userObj };
}

export async function getCases(token) {
  return api("GET", "/api/cases/", null, token);
}

export async function seed() {
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  await mongo.db().dropDatabase();
  await mongo.close();
  log("seed", "reset demo database");

  for (const u of Object.values(USERS)) {
    await api("POST", "/api/auth/register", { ...u, password: PASSWORD });
  }
  log("seed", `registered ${Object.keys(USERS).length} fictional users`);

  const { user: lawyer } = await login(USERS.lawyer.email);
  const { token: otherToken } = await login(USERS.otherClient.email);
  for (const c of PRIOR_CASES) {
    await api("POST", "/api/cases/", {
      ...c,
      client: USERS.otherClient.fullName,
      lawyerUsername: lawyer.email,
      lawyerId: lawyer._id,
      progress: 50,
    }, otherToken);
  }
  log("seed", `created ${PRIOR_CASES.length} prior cases for ${USERS.lawyer.fullName}`);
}
