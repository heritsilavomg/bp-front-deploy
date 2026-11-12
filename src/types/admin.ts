export type UserStatus = "ACTIVE" | "SUSPENDED";
export type UserRole = "ROLE_USER" | "ROLE_ADMIN";

export type AdminUserSummary = {
  id: string;
  email: string;
  emailVerified?: boolean;
  tel?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  role?: UserRole;
  status?: UserStatus;
};

export type AdminUserPage = {
  content: AdminUserSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AdminUserQuery = {
  page: number;
  size: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  sort?: string;
};

export type AdminUserCreateRequest = {
  email: string;
  nom: string;
  prenom: string;
  tel?: string;
  dateNaissance?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

export type AdminUserUpdateRequest = {
  email: string;
  nom: string;
  prenom: string;
  tel?: string;
  dateNaissance?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};
