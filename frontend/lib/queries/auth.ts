import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';
import { setAuth, clearAuth } from '@/lib/auth';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Types
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isVerified: boolean;
    };
    token: string;
  };
  message: string;
}

// Login Mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await axiosInstance.post<AuthResponse>(
        API_PATHS.AUTH.LOGIN,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      const { user, token } = data.data;
      setAuth(token, user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// Register Mutation
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await axiosInstance.post<AuthResponse>(
        API_PATHS.AUTH.REGISTER,
        data
      );
      return response.data;
    },
  });
}

// Logout Mutation
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Optional: call logout endpoint if you have one
      // await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
      clearAuth();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
