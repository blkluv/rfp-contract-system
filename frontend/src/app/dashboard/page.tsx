'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2'; // ✅ Grid2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Add, Description, Reply, Visibility } from '@mui/icons-material';
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
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total RFPs
                </Typography>
                <Typography variant="h4">
                  {user?.role === 'buyer'
                    ? rfps.filter((rfp) => rfp.buyerId === user.id).length
                    : rfps.filter((rfp) => rfp.isPublic).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Responses
                </Typography>
                <Typography variant="h4">{responses.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active RFPs
                </Typography>
                <Typography variant="h4">
                  {rfps.filter((rfp) => rfp.status === 'published').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Reviews
                </Typography>
                <Typography variant="h4">
                  {responses.filter((resp) => resp.status === 'submitted').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent RFPs */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent RFPs</Typography>
                  <Button size="small" onClick={() => router.push('/rfps')}>
                    View All
                  </Button>
                </Box>
                <List>
                  {rfps.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No RFPs found
                    </Typography>
                  ) : (
                    rfps.slice(0, 3).map((rfp) => (
                      <ListItem key={rfp.id} divider>
                        <ListItemText
                          primary={rfp.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {rfp.category}{' '}
                                {rfp.deadline && `• ${new Date(rfp.deadline).toLocaleDateString()}`}
                              </Typography>
                              <Chip
                                label={rfp.status.replace('_', ' ').toUpperCase()}
                                size="small"
                                color={getStatusColor(rfp.status) as
                                  | 'default'
                                  | 'error'
                                  | 'info'
                                  | 'success'
                                  | 'warning'}
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
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Responses */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent Responses</Typography>
                  <Button size="small" onClick={() => router.push('/responses')}>
                    View All
                  </Button>
                </Box>
                <List>
                  {responses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No responses found
                    </Typography>
                  ) : (
                    responses.slice(0, 3).map((response) => (
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
                                color={getStatusColor(response.status) as
                                  | 'default'
                                  | 'error'
                                  | 'info'
                                  | 'success'
                                  | 'warning'}
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
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid xs={12}>
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
