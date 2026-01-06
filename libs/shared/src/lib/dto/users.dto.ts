export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface CreateUserRequestDTO {
  name: string;
  email: string;
  password: string;
  position: string;
  phone: string;
  role?: Role;
  photoUrl?: string;
}

export interface FindUserRequestDTO {
  page?: number;
  limit?: string;
  name?: string;
  position?: string;
}

export interface FilterUser {
  name?: any;
  position?: string;
}

export interface UpdateUserRequestDTO {
  name?: string;
  email?: string;
  password?: string;
  position?: string;
  phone?: string;
  role?: Role;
  photoUrl?: string;
}
