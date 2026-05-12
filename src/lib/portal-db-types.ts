export type UserRole = "admin" | "teacher" | "student";

export type PortalUser = {
  userId: number;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  accountStatus: "active" | "blocked" | "pending";
  createdAt: string;
};

export type RoleInfo = {
  role: UserRole;
  title: string;
  description: string;
  permissions: string[];
};