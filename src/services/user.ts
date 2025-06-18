import { api } from '@/utils/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
}

export const getUsers = async (): Promise<User[]> => {
  return api<User[]>('/users');
};

export const getUserById = async (id: string): Promise<User> => {
  return api<User>(`/users/${id}`);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  return api<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  return api(`/users/${id}`, {
    method: 'DELETE'
  });
}; 