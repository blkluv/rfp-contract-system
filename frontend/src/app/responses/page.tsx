'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RFPResponse } from '@/types';
import Layout from '@/components/Layout';

const ResponsesPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<RFPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchResponses();
  }, [page, search, status]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getResponses({
        page,
        limit: 12,
        status: status || undefined,
      });
      setResponses(response.responses);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleReview = async (id: string, reviewStatus: 'approved' | 'rejected') => {
    try {
      await apiService.reviewResponse(id, { status: reviewStatus });
      fetchResponses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to review response');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'info';
      case 'under_review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading && responses.length === 0) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          {user?.role === 'buyer' ? 'RFP Responses' : 'My Responses'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search responses"
                  value={search}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Responses Grid */}
        <Grid container spacing={3}>
          {responses.map((response) => (
            <Grid item xs={12} md={6} key={response.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" noWrap>
                      {response.rfp?.title || 'Unknown RFP'}
                    </Typography>
                    <Chip
                      label={response.status.replace('_', ' ').toUpperCase()}
                      size="small"
                      color={getStatusColor(response.status) as any}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {response.proposal.length > 150 
                      ? `${response.proposal.substring(0, 150)}...`
                      : response.proposal
                    }
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      {user?.role === 'buyer' 
                        ? `Supplier: ${response.supplier?.firstName} ${response.supplier?.lastName}`
                        : `RFP: ${response.rfp?.category}`
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {response.proposedBudget && response.rfp?.currency && 
                        formatCurrency(response.proposedBudget, response.rfp.currency)
                      }
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Submitted: {new Date(response.submittedAt).toLocaleDateString()}
                  </Typography>

                  {response.timeline && (
                    <Typography variant="body2" color="text.secondary">
                      Timeline: {response.timeline}
                    </Typography>
                  )}

                  {response.evaluationScore && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUp sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        Score: {response.evaluationScore}/100
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => router.push(`/responses/${response.id}`)}
                  >
                    View Details
                  </Button>
                  
                  {user?.role === 'supplier' && response.supplierId === user?.id && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => router.push(`/responses/${response.id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}
                  
                  {user?.role === 'buyer' && response.status === 'submitted' && (
                    <>
                      <Button
                        size="small"
                        startIcon={<CheckCircle />}
                        color="success"
                        onClick={() => handleReview(response.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Cancel />}
                        color="error"
                        onClick={() => handleReview(response.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {responses.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No responses found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === 'buyer' 
                ? 'No responses have been submitted to your RFPs yet'
                : 'You haven\'t submitted any responses yet'
              }
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default ResponsesPage;
