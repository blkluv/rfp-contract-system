import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, RFP, RFPResponse, AuthResponse, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'buyer' | 'supplier';
    company?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
  }): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.put('/auth/profile', userData);
    return response.data;
  }

  // RFP endpoints
  async getRFPs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<{ rfps: RFP[]; pagination: any }> {
    const response: AxiosResponse<{ rfps: RFP[]; pagination: any }> = await this.api.get('/rfps', {
      params,
    });
    return response.data;
  }

  async getRFPById(id: string): Promise<{ rfp: RFP }> {
    const response: AxiosResponse<{ rfp: RFP }> = await this.api.get(`/rfps/${id}`);
    return response.data;
  }

  async createRFP(rfpData: {
    title: string;
    description: string;
    category: string;
    budget?: number;
    currency?: string;
    deadline: string;
    requirements?: any[];
    evaluationCriteria?: any[];
    submissionInstructions?: string;
    contactEmail?: string;
  }): Promise<{ rfp: RFP }> {
    const response: AxiosResponse<{ rfp: RFP }> = await this.api.post('/rfps', rfpData);
    return response.data;
  }

  async updateRFP(id: string, rfpData: Partial<RFP>): Promise<{ rfp: RFP }> {
    const response: AxiosResponse<{ rfp: RFP }> = await this.api.put(`/rfps/${id}`, rfpData);
    return response.data;
  }

  async deleteRFP(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/rfps/${id}`);
    return response.data;
  }

  async publishRFP(id: string): Promise<{ rfp: RFP }> {
    const response: AxiosResponse<{ rfp: RFP }> = await this.api.post(`/rfps/${id}/publish`);
    return response.data;
  }

  // RFP Response endpoints
  async getResponses(params?: {
    rfpId?: string;
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ responses: RFPResponse[]; pagination: any }> {
    const response: AxiosResponse<{ responses: RFPResponse[]; pagination: any }> = await this.api.get('/responses', {
      params,
    });
    return response.data;
  }

  async getResponseById(id: string): Promise<{ response: RFPResponse }> {
    const response: AxiosResponse<{ response: RFPResponse }> = await this.api.get(`/responses/${id}`);
    return response.data;
  }

  async createResponse(responseData: {
    rfpId: string;
    proposal: string;
    proposedBudget?: number;
    timeline?: string;
    notes?: string;
  }): Promise<{ response: RFPResponse }> {
    const response: AxiosResponse<{ response: RFPResponse }> = await this.api.post('/responses', responseData);
    return response.data;
  }

  async updateResponse(id: string, responseData: Partial<RFPResponse>): Promise<{ response: RFPResponse }> {
    const response: AxiosResponse<{ response: RFPResponse }> = await this.api.put(`/responses/${id}`, responseData);
    return response.data;
  }

  async reviewResponse(id: string, reviewData: {
    status: 'approved' | 'rejected';
    evaluationScore?: number;
    evaluationComments?: string;
  }): Promise<{ response: RFPResponse }> {
    const response: AxiosResponse<{ response: RFPResponse }> = await this.api.put(`/responses/${id}/review`, reviewData);
    return response.data;
  }

  // File upload endpoints
  async uploadFile(formData: FormData): Promise<{ document: any }> {
    const response: AxiosResponse<{ document: any }> = await this.api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/files/${fileId}`);
    return response.data;
  }

  async getFiles(params?: {
    rfpId?: string;
    responseId?: string;
    fileType?: string;
  }): Promise<{ documents: any[] }> {
    const response: AxiosResponse<{ documents: any[] }> = await this.api.get('/files', {
      params,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
