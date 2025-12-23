
import { api } from './api';
import { Customer } from '../types';

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    return api.get<Customer[]>('/customers');
  }
};
