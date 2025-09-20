'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Description,
  Reply,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RFP, RFPResponse } from '@/types';
import Layout from '@/components/Layout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [responses, setResponses] = useState<RFPResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [rfpsData, responsesData] = await Promise.all([
          apiService.getRFPs({ limit: 5 }),
          apiService.getResponses({ limit: 5 }),
        ]);
        setRfps(rfpsData.rfps);
        setResponses(responsesData.responses);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getStatusColor = (
    status: string
  ): 'default' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'published':
      case 'approved':
        return 'success';
      case 'draft':
        return 'default';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
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
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {user?.role === 'buyer' 
            ? 'Manage your RFPs and review supplier responses'
            : 'Browse available RFPs and manage your responses'}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => location.reload()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total RFPs
                </Typography>
                <Typography variant="h4">
                  {user?.role === 'buyer' 
                    ? rfps.filter(rfp => rfp.buyerId === user.id).length
                    : rfps.filter(rfp => rfp.isPublic).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Responses
                </Typography>
                <Typography variant="h4">{responses.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active RFPs
                </Typography>
                <Typography variant="h4">
                  {rfps.filter(rfp => rfp.status === 'published').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Reviews
                </Typography>
                <Typography variant="h4">
                  {responses.filter(resp => resp.status === 'submitted').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent RFPs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent RFPs</Typography>
                  <Button size="small" onClick={() => router.push('/rfps')}>
                    View All
                  </Button>
                </Box>
                {rfps.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No RFPs found
                  </Typography>
                ) : (
                  <List>
                    {rfps.slice(0, 3).map(rfp => (
                      <ListItem key={rfp.id} divider>
                        <ListItemText
                          primary={rfp.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {rfp.category} •{' '}
                                {rfp.deadline
                                  ? new Date(rfp.deadline).toLocaleDateString()
                                  : 'No deadline'}
                              </Typography>
                              <Chip
                                label={rfp.status.replace('_', ' ').toUpperCase()}
                                size="small"
                                color={getStatusColor(rfp.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => router.push(`/rfps/${rfp.id}`)}>
                            <Visibility />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Responses */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent Responses</Typography>
                  <Button size="small" onClick={() => router.push('/responses')}>
                    View All
                  </Button>
                </Box>
                {responses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No responses found
                  </Typography>
                ) : (
                  <List>
                    {responses.slice(0, 3).map(response => (
                      <ListItem key={response.id} divider>
                        <ListItemText
                          primary={response.rfp?.title || 'Unknown RFP'}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {response.supplier?.firstName} {response.supplier?.lastName}
                                {response.supplier?.company && ` • ${response.supplier.company}`}
                              </Typography>
                              <Chip
                                label={response.status.replace('_', ' ').toUpperCase()}
                                size="small"
                                color={getStatusColor(response.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => router.push(`/responses/${response.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {user?.role === 'buyer' && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => router.push('/rfps/create')}
                    >
                      Create New RFP
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Description />}
                    onClick={() => router.push('/rfps')}
                  >
                    Browse RFPs
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Reply />}
                    onClick={() => router.push('/responses')}
                  >
                    View Responses
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default DashboardPage;
