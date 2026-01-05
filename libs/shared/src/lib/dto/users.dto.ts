export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface CreateEmployeeDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
  position: string;
  phone?: string;
  photoUrl?: string;
}

export interface FindEmployeeRequestDTO {
  page?: number;
  limit?: string;
  name?: string;
  position?: string;
}

export interface FilterEmployee {
  name?: string;
  position?: string;
}

export interface UpdateEmployeeDTO {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  position: string;
  phone?: string;
  photoUrl?: string;
}
