export const statusOrder = ["Request Received", "Under Review", "In Design", "Waiting for Client", "Completed"] as const;
export type ProjectStatus = (typeof statusOrder)[number];

export type ProjectSummary = {
  id: string;
  code: string;
  client: string;
  company: string;
  service: string;
  product: string;
  status: ProjectStatus;
  lastActivity: string;
};

export const demoProjects: ProjectSummary[] = [
  { id: "1", code: "ORTA-260001", client: "Mia Carter", company: "Vera Pasta Co.", service: "Packaging Design", product: "Pasta Box", status: "Request Received", lastActivity: "Aug 6, 2026" },
  { id: "2", code: "ORTA-260002", client: "Emre Kaya", company: "Anatolia Coffee", service: "Packaging Design", product: "Coffee Bag", status: "Under Review", lastActivity: "Aug 5, 2026" },
  { id: "3", code: "ORTA-260003", client: "Alex Morgan", company: "Boreal Foods", service: "Packaging Design", product: "Granola Pouch", status: "In Design", lastActivity: "Aug 4, 2026" },
  { id: "4", code: "ORTA-260004", client: "Deniz Aydin", company: "Miras Olive Oil", service: "Packaging Design", product: "Tin Can", status: "Waiting for Client", lastActivity: "Aug 2, 2026" },
  { id: "5", code: "ORTA-260005", client: "Liv Hansen", company: "Nordic Bites", service: "Branding & Packaging", product: "Snack Box", status: "Completed", lastActivity: "Jul 31, 2026" },
];

export const demoProject = {
  ...demoProjects[2],
  email: "alex@borealfoods.example",
  whatsapp: "",
  country: "Germany",
  industry: "Food & Beverage",
  preferredLanguage: "English",
  preferredDelivery: "Standard",
  description: "Premium resealable granola pouch for retail.\nClean, modern shelf presence with print-ready artwork.",
  messages: [
    { id: "m1", date: "Aug 4, 2026", time: "10:24", author: "Alex Morgan (Client)", text: "Please use our updated logo and keep the color palette natural." },
    { id: "m2", date: "Aug 6, 2026", time: "09:15", author: "ORTA Studio", text: "Thanks! We’re working on initial concepts and will share them soon." },
  ],
  files: [
    { id: "f1", name: "brief.pdf", date: "Aug 4, 2026", meta: "PDF · 420 KB" },
    { id: "f2", name: "logo.ai", date: "Aug 4, 2026", meta: "AI · 1.2 MB" },
    { id: "f3", name: "granola-reference.jpg", date: "Aug 4, 2026", meta: "JPG · 1.5 MB" },
  ],
};
