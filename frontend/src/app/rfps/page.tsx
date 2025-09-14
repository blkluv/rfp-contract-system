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
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Publish,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RFP } from '@/types';
import Layout from '@/components/Layout';

const RFPsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRFPs();
  }, [page, search, category, status]);

  const fetchRFPs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRFPs({
        page,
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        role: user?.role,
      });
      setRfps(response.rfps);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this RFP?')) {
      try {
        await apiService.deleteRFP(id);
        fetchRFPs();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete RFP');
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiService.publishRFP(id);
      fetchRFPs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish RFP');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'response_submitted':
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

  if (loading && rfps.length === 0) {
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {user?.role === 'buyer' ? 'My RFPs' : 'Available RFPs'}
          </Typography>
          {user?.role === 'buyer' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/rfps/create')}
            >
              Create RFP
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search RFPs"
                  value={search}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Services">Services</MenuItem>
                    <MenuItem value="Construction">Construction</MenuItem>
                    <MenuItem value="Consulting">Consulting</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
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
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="response_submitted">Response Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* RFPs Grid */}
        <Grid container spacing={3}>
          {rfps.map((rfp) => (
            <Grid item xs={12} md={6} lg={4} key={rfp.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" noWrap>
                      {rfp.title}
                    </Typography>
                    <Chip
                      label={rfp.status.replace('_', ' ').toUpperCase()}
                      size="small"
                      color={getStatusColor(rfp.status) as any}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {rfp.description.length > 150 
                      ? `${rfp.description.substring(0, 150)}...`
                      : rfp.description
                    }
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Category: {rfp.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rfp.budget && formatCurrency(rfp.budget, rfp.currency)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Deadline: {new Date(rfp.deadline).toLocaleDateString()}
                  </Typography>

                  {rfp.buyer && (
                    <Typography variant="body2" color="text.secondary">
                      By: {rfp.buyer.firstName} {rfp.buyer.lastName}
                      {rfp.buyer.company && ` (${rfp.buyer.company})`}
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => router.push(`/rfps/${rfp.id}`)}
                  >
                    View Details
                  </Button>
                  
                  {user?.role === 'buyer' && rfp.buyerId === user.id && (
                    <>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => router.push(`/rfps/${rfp.id}/edit`)}
                      >
                        Edit
                      </Button>
                      {rfp.status === 'draft' && (
                        <Button
                          size="small"
                          startIcon={<Publish />}
                          onClick={() => handlePublish(rfp.id)}
                        >
                          Publish
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(rfp.id)}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {rfps.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No RFPs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === 'buyer' 
                ? 'Create your first RFP to get started'
                : 'No RFPs are currently available'
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

export default RFPsPage;

