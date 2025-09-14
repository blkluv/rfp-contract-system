export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'supplier';
  company?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFP {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  currency: string;
  deadline: string;
  status: 'draft' | 'published' | 'response_submitted' | 'under_review' | 'approved' | 'rejected';
  requirements?: any[];
  evaluationCriteria?: any[];
  submissionInstructions?: string;
  contactEmail?: string;
  isPublic: boolean;
  publishedAt?: string;
  buyerId: string;
  buyer?: User;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface RFPResponse {
  id: string;
  proposal: string;
  proposedBudget?: number;
  timeline?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  notes?: string;
  evaluationScore?: number;
  evaluationComments?: string;
  submittedAt: string;
  reviewedAt?: string;
  rfpId: string;
  supplierId: string;
  rfp?: RFP;
  supplier?: User;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'rfp_document' | 'response_document' | 'attachment';
  description?: string;
  version: number;
  isLatest: boolean;
  uploadedBy: string;
  rfpId?: string;
  responseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
  errors?: any[];
}

