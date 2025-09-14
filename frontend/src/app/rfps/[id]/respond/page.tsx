'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import FileUpload from '@/components/FileUpload';

const schema = yup.object({
  proposal: yup.string().required('Proposal is required'),
  proposedBudget: yup.number().positive('Budget must be positive').nullable(),
  timeline: yup.string().required('Timeline is required'),
  notes: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

const RespondToRFPPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const rfpId = params.id as string;
  
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rfp, setRfp] = useState<any>(null);
  const [createdResponse, setCreatedResponse] = useState<any>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      proposal: '',
      proposedBudget: null,
      timeline: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const response = await apiService.getRFPById(rfpId);
        setRfp(response.rfp);
      } catch (err: any) {
        setError('Failed to load RFP details');
      } finally {
        setLoading(false);
      }
    };

    if (rfpId) {
      fetchRFP();
    }
  }, [rfpId]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await apiService.createResponse({
        rfpId,
        proposal: data.proposal,
        proposedBudget: data.proposedBudget,
        timeline: data.timeline,
        notes: data.notes,
      });
      
      setCreatedResponse(response.response);
      setShowFileUpload(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploadComplete = () => {
    // Files uploaded successfully, redirect to responses page
    router.push('/responses');
  };

  const handleSkipFileUpload = () => {
    // Skip file upload, redirect to responses page
    router.push('/responses');
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

  if (!rfp) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error">
            RFP not found.
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (user?.role !== 'supplier') {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error">
            Only suppliers can submit responses.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Submit Response to RFP
        </Typography>

        {/* RFP Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {rfp.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {rfp.description}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {rfp.category}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Budget
                </Typography>
                <Typography variant="body1">
                  {rfp.budget ? `$${rfp.budget.toLocaleString()} ${rfp.currency}` : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Deadline
                </Typography>
                <Typography variant="body1">
                  {new Date(rfp.deadline).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Buyer
                </Typography>
                <Typography variant="body1">
                  {rfp.buyer?.firstName} {rfp.buyer?.lastName}
                  {rfp.buyer?.company && ` (${rfp.buyer.company})`}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Response Form */}
        {!showFileUpload && (
          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="proposal"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Your Proposal"
                          multiline
                          rows={8}
                          error={!!errors.proposal}
                          helperText={errors.proposal?.message}
                          required
                          placeholder="Describe your approach, methodology, and how you will meet the requirements..."
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="proposedBudget"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Proposed Budget"
                          type="number"
                          error={!!errors.proposedBudget}
                          helperText={errors.proposedBudget?.message}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Enter your proposed budget"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="timeline"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Project Timeline"
                          error={!!errors.timeline}
                          helperText={errors.timeline?.message}
                          required
                          placeholder="e.g., 8-12 weeks, 3 months, etc."
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Additional Notes (Optional)"
                          multiline
                          rows={3}
                          error={!!errors.notes}
                          helperText={errors.notes?.message}
                          placeholder="Any additional information, questions, or clarifications..."
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Submit Response'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => router.push(`/rfps/${rfpId}`)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* File Upload Section */}
        {showFileUpload && createdResponse && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Supporting Documents (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You can upload supporting documents for your response such as portfolio samples, case studies, or detailed proposals.
              </Typography>
              
              <FileUpload
                rfpId={rfpId}
                responseId={createdResponse.id}
                fileType="response_document"
                onUploadComplete={handleFileUploadComplete}
                onUploadError={(error) => setError(error)}
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
                description="Response supporting documents"
              />
              
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleSkipFileUpload}
                >
                  Skip File Upload
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFileUploadComplete}
                >
                  Complete Submission
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Layout>
  );
};

export default RespondToRFPPage;

