'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Layout from '@/components/Layout';
import FileUpload from '@/components/FileUpload';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  budget: yup.number().positive('Budget must be positive').nullable(),
  currency: yup.string().length(3, 'Currency must be 3 characters'),
  deadline: yup.date().min(new Date(), 'Deadline must be in the future').required('Deadline is required'),
  requirements: yup.array().of(yup.string()),
  evaluationCriteria: yup.array().of(yup.string()),
  submissionInstructions: yup.string(),
  contactEmail: yup.string().email('Invalid email'),
});

type FormData = yup.InferType<typeof schema>;

const CreateRFPPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRFP, setCreatedRFP] = useState<any>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      currency: 'USD',
      requirements: [''],
      evaluationCriteria: [''],
    },
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: 'requirements',
  });

  const {
    fields: criteriaFields,
    append: appendCriteria,
    remove: removeCriteria,
  } = useFieldArray({
    control,
    name: 'evaluationCriteria',
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Filter out empty requirements and criteria
      const filteredData = {
        ...data,
        requirements: data.requirements?.filter(req => req.trim() !== '') || [],
        evaluationCriteria: data.evaluationCriteria?.filter(criteria => criteria.trim() !== '') || [],
      };

      const response = await apiService.createRFP(filteredData);
      setCreatedRFP(response.rfp);
      setShowFileUpload(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create RFP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploadComplete = () => {
    // Files uploaded successfully, redirect to RFPs page
    router.push('/rfps');
  };

  const handleSkipFileUpload = () => {
    // Skip file upload, redirect to RFPs page
    router.push('/rfps');
  };

  if (user?.role !== 'buyer') {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error">
            Only buyers can create RFPs.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Create New RFP
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="RFP Title"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select {...field} label="Category">
                          <MenuItem value="Technology">Technology</MenuItem>
                          <MenuItem value="Services">Services</MenuItem>
                          <MenuItem value="Construction">Construction</MenuItem>
                          <MenuItem value="Consulting">Consulting</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {errors.category && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.category.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Controller
                    name="budget"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Budget (Optional)"
                        type="number"
                        error={!!errors.budget}
                        helperText={errors.budget?.message}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Currency"
                        error={!!errors.currency}
                        helperText={errors.currency?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="deadline"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Deadline"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.deadline}
                        helperText={errors.deadline?.message}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="contactEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Contact Email (Optional)"
                        type="email"
                        error={!!errors.contactEmail}
                        helperText={errors.contactEmail?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  {requirementFields.map((field, index) => (
                    <Box key={field.id} display="flex" alignItems="center" mb={1}>
                      <Controller
                        name={`requirements.${index}`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={`Requirement ${index + 1}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      />
                      <Button
                        onClick={() => removeRequirement(index)}
                        disabled={requirementFields.length === 1}
                        sx={{ ml: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button
                    onClick={() => appendRequirement('')}
                    variant="outlined"
                    size="small"
                  >
                    Add Requirement
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Evaluation Criteria
                  </Typography>
                  {criteriaFields.map((field, index) => (
                    <Box key={field.id} display="flex" alignItems="center" mb={1}>
                      <Controller
                        name={`evaluationCriteria.${index}`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={`Criteria ${index + 1}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      />
                      <Button
                        onClick={() => removeCriteria(index)}
                        disabled={criteriaFields.length === 1}
                        sx={{ ml: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button
                    onClick={() => appendCriteria('')}
                    variant="outlined"
                    size="small"
                  >
                    Add Criteria
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="submissionInstructions"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Submission Instructions (Optional)"
                        multiline
                        rows={3}
                        error={!!errors.submissionInstructions}
                        helperText={errors.submissionInstructions?.message}
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
                      {isSubmitting ? <CircularProgress size={24} /> : 'Create RFP'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/rfps')}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        {showFileUpload && createdRFP && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload RFP Documents (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You can upload supporting documents for your RFP such as requirements, specifications, or examples.
              </Typography>
              
              <FileUpload
                rfpId={createdRFP.id}
                fileType="rfp_document"
                onUploadComplete={handleFileUploadComplete}
                onUploadError={(error) => setError(error)}
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
                description="RFP supporting documents"
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
                  Continue to RFPs
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Layout>
  );
};

export default CreateRFPPage;
