export type Task = {
  _id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  provider: 'local' | 'google';
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};
