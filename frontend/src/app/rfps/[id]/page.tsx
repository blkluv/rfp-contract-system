'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Publish,
  Reply,
  AttachFile,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RFP } from '@/types';
import Layout from '@/components/Layout';

const RFPDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const rfpId = params.id as string;
  
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (rfpId) {
      fetchRFP();
    }
  }, [rfpId]);

  const fetchRFP = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRFPById(rfpId);
      setRfp(response.rfp);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load RFP');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this RFP?')) {
      try {
        await apiService.deleteRFP(rfpId);
        router.push('/rfps');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete RFP');
      }
    }
  };

  const handlePublish = async () => {
    try {
      await apiService.publishRFP(rfpId);
      fetchRFP();
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

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !rfp) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error">
            {error || 'RFP not found'}
          </Alert>
        </Container>
      </Layout>
    );
  }

  const canEdit = user?.role === 'buyer' && rfp.buyerId === user.id;
  const canRespond = user?.role === 'supplier' && rfp.isPublic && rfp.status === 'published';

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {rfp.title}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Chip
                    label={rfp.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(rfp.status) as any}
                  />
                  <Box>
                    {canEdit && (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => router.push(`/rfps/${rfp.id}/edit`)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        {rfp.status === 'draft' && (
                          <Button
                            variant="contained"
                            startIcon={<Publish />}
                            onClick={handlePublish}
                            sx={{ mr: 1 }}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => router.push(`/rfps/${rfp.id}/edit`)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <IconButton color="error" onClick={handleDelete}>
                          <Delete />
                        </IconButton>
                      </>
                    )}
                    {canRespond && (
                      <Button
                        variant="contained"
                        startIcon={<Reply />}
                        onClick={() => router.push(`/rfps/${rfp.id}/respond`)}
                      >
                        Submit Response
                      </Button>
                    )}
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {rfp.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                {rfp.requirements && rfp.requirements.length > 0 ? (
                  <List>
                    {rfp.requirements.map((requirement, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={requirement} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific requirements listed.
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Evaluation Criteria
                </Typography>
                {rfp.evaluationCriteria && rfp.evaluationCriteria.length > 0 ? (
                  <List>
                    {rfp.evaluationCriteria.map((criteria, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={criteria} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific evaluation criteria listed.
                  </Typography>
                )}

                {rfp.submissionInstructions && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Submission Instructions
                    </Typography>
                    <Typography variant="body1">
                      {rfp.submissionInstructions}
                    </Typography>
                  </>
                )}

                {rfp.documents && rfp.documents.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Attached Documents
                    </Typography>
                    <List>
                      {rfp.documents.map((doc) => (
                        <ListItem key={doc.id}>
                          <AttachFile sx={{ mr: 1 }} />
                          <ListItemText
                            primary={doc.originalName}
                            secondary={`${(doc.fileSize / 1024).toFixed(1)} KB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  RFP Details
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {rfp.category}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Budget
                  </Typography>
                  <Typography variant="body1">
                    {rfp.budget ? formatCurrency(rfp.budget, rfp.currency) : 'Not specified'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Deadline
                  </Typography>
                  <Typography variant="body1">
                    {new Date(rfp.deadline).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Published
                  </Typography>
                  <Typography variant="body1">
                    {rfp.publishedAt 
                      ? new Date(rfp.publishedAt).toLocaleDateString()
                      : 'Not published'
                    }
                  </Typography>
                </Box>

                {rfp.buyer && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Buyer
                    </Typography>
                    <Typography variant="body1">
                      {rfp.buyer.firstName} {rfp.buyer.lastName}
                    </Typography>
                    {rfp.buyer.company && (
                      <Typography variant="body2" color="text.secondary">
                        {rfp.buyer.company}
                      </Typography>
                    )}
                    {rfp.contactEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {rfp.contactEmail}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(rfp.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default RFPDetailsPage;
