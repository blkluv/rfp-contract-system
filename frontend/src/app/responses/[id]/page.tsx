'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  AttachFile,
  Download,
  Visibility,
  CheckCircle,
  Cancel,
  TrendingUp,
  Person,
  Business,
  Email,
  Phone,
  CalendarToday,
  MonetizationOn,
  Schedule,
  Description,
  Notes,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';

interface ResponseDetails {
  id: string;
  proposal: string;
  proposedBudget: string;
  timeline: string;
  status: string;
  notes: string;
  evaluationScore?: number;
  evaluationComments?: string;
  submittedAt: string;
  reviewedAt?: string;
  rfpId: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
  rfp: {
    id: string;
    title: string;
    description: string;
    category: string;
    budget: string;
    currency: string;
    deadline: string;
    status: string;
    requirements: string[];
    evaluationCriteria: string[];
    submissionInstructions: string;
    contactEmail: string;
    isPublic: boolean;
    publishedAt: string;
    buyerId: string;
    buyer: {
      id: string;
      firstName: string;
      lastName: string;
      company: string;
      email: string;
    };
  };
  supplier: {
    id: string;
    firstName: string;
    lastName: string;
    company: string;
    email: string;
  };
  documents: Array<{
    id: string;
    filename: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    fileType: string;
    description: string;
    version: number;
    isLatest: boolean;
    uploadedBy: string;
    rfpId: string;
    responseId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

const ResponseDetailsPage: React.FC = () => {
  const { id: responseId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [response, setResponse] = useState<ResponseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewComments, setReviewComments] = useState('');
  const [reviewScore, setReviewScore] = useState<number>(0);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const responseData = await apiService.getResponseById(responseId as string);
        setResponse(responseData.response);
      } catch (err: any) {
        setError('Failed to load response details');
        console.error('Error fetching response:', err);
      } finally {
        setLoading(false);
      }
    };

    if (responseId) {
      fetchResponse();
    }
  }, [responseId]);

  const handleEdit = () => {
    router.push(`/responses/${responseId}/edit`);
  };

  const handleBack = () => {
    router.push('/responses');
  };

  const handleReview = async () => {
    try {
      await apiService.reviewResponse(responseId as string, {
        status: reviewStatus,
        evaluationScore: reviewScore,
        evaluationComments: reviewComments,
      });
      
      // Refresh the response data
      const responseData = await apiService.getResponseById(responseId as string);
      setResponse(responseData.response);
      setReviewDialogOpen(false);
    } catch (err: any) {
      setError('Failed to review response');
      console.error('Error reviewing response:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'primary';
      case 'under_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Description />;
      case 'under_review':
        return <Visibility />;
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Description />;
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (!response) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 2 }}>
            Response not found
          </Alert>
        </Container>
      </Layout>
    );
  }

  const canEdit = user?.role === 'supplier' && response.supplierId === user?.id;
  const canReview = user?.role === 'buyer' && response.rfp.buyerId === user?.id;

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Responses
          </Button>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
              Response Details
            </Typography>
            <Box display="flex" gap={1}>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                >
                  Edit Response
                </Button>
              )}
              {canReview && response.status === 'submitted' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setReviewDialogOpen(true)}
                >
                  Review Response
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Response Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Chip
                    icon={getStatusIcon(response.status)}
                    label={response.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(response.status) as any}
                    size="medium"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Submitted on {formatDate(response.submittedAt)}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Proposal
                </Typography>
                <Typography variant="body1" paragraph>
                  {response.proposal}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <MonetizationOn color="action" />
                      <Typography variant="subtitle2">Proposed Budget</Typography>
                    </Box>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(response.proposedBudget, response.rfp.currency)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Schedule color="action" />
                      <Typography variant="subtitle2">Timeline</Typography>
                    </Box>
                    <Typography variant="h6">
                      {response.timeline}
                    </Typography>
                  </Grid>
                </Grid>

                {response.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Additional Notes
                    </Typography>
                    <Typography variant="body1">
                      {response.notes}
                    </Typography>
                  </>
                )}

                {response.evaluationScore !== null && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Evaluation
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body1">
                        Score: {response.evaluationScore}/100
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <TrendingUp color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {response.evaluationScore >= 80 ? 'Excellent' : 
                           response.evaluationScore >= 60 ? 'Good' : 
                           response.evaluationScore >= 40 ? 'Fair' : 'Poor'}
                        </Typography>
                      </Box>
                    </Box>
                    {response.evaluationComments && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Comments: {response.evaluationComments}
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* RFP Information */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  RFP Information
                </Typography>
                
                <Typography variant="h5" gutterBottom>
                  {response.rfp.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {response.rfp.description}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Person color="action" />
                  <Typography variant="body2">
                    {response.rfp.buyer.firstName} {response.rfp.buyer.lastName}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Business color="action" />
                  <Typography variant="body2">
                    {response.rfp.buyer.company}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Email color="action" />
                  <Typography variant="body2">
                    {response.rfp.buyer.email}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarToday color="action" />
                  <Typography variant="body2">
                    Deadline: {formatDate(response.rfp.deadline)}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <MonetizationOn color="action" />
                  <Typography variant="body2">
                    Budget: {formatCurrency(response.rfp.budget, response.rfp.currency)}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push(`/rfps/${response.rfp.id}`)}
                >
                  View RFP Details
                </Button>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Supplier Information
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Person color="action" />
                  <Typography variant="body2">
                    {response.supplier.firstName} {response.supplier.lastName}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Business color="action" />
                  <Typography variant="body2">
                    {response.supplier.company}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Email color="action" />
                  <Typography variant="body2">
                    {response.supplier.email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Documents Section */}
        {response.documents && response.documents.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attached Documents
              </Typography>
              <Grid container spacing={2}>
                {response.documents.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => window.open(`/api/files/${doc.id}/download`, '_blank')}
                    >
                      <AttachFile color="action" />
                      <Box flex={1}>
                        <Typography variant="body2" noWrap>
                          {doc.originalName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(doc.fileSize)}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <Download />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Review Response</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Status
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant={reviewStatus === 'approved' ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => setReviewStatus('approved')}
                  startIcon={<CheckCircle />}
                >
                  Approve
                </Button>
                <Button
                  variant={reviewStatus === 'rejected' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => setReviewStatus('rejected')}
                  startIcon={<Cancel />}
                >
                  Reject
                </Button>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Evaluation Score (0-100)
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <Typography variant="body1" minWidth="40px">
                  {reviewScore}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Comments
              </Typography>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Add your evaluation comments..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical',
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReview} variant="contained">
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ResponseDetailsPage;

