const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/User');
const RFP = require('../src/models/RFP');

describe('RFP Management', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Clear database
    await RFP.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create and login a test user
    const userData = {
      email: 'buyer@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'buyer'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('POST /api/rfps', () => {
    it('should create a new RFP', async () => {
      const rfpData = {
        title: 'Test RFP',
        description: 'This is a test RFP',
        category: 'Technology',
        budget: 50000,
        currency: 'USD',
        deadline: '2024-12-31T23:59:59.000Z',
        requirements: ['React', 'Node.js'],
        evaluationCriteria: ['Price', 'Timeline'],
        submissionInstructions: 'Submit via email'
      };

      const response = await request(app)
        .post('/api/rfps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(rfpData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'RFP created successfully');
      expect(response.body).toHaveProperty('rfp');
      expect(response.body.rfp.title).toBe(rfpData.title);
      expect(response.body.rfp.status).toBe('draft');
    });

    it('should not create RFP without required fields', async () => {
      const rfpData = {
        title: 'Test RFP'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/rfps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(rfpData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should not create RFP without authentication', async () => {
      const rfpData = {
        title: 'Test RFP',
        description: 'This is a test RFP',
        category: 'Technology',
        deadline: '2024-12-31T23:59:59.000Z'
      };

      const response = await request(app)
        .post('/api/rfps')
        .send(rfpData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'No token, authorization denied');
    });
  });

  describe('GET /api/rfps', () => {
    beforeEach(async () => {
      // Create test RFPs
      const rfps = [
        {
          title: 'RFP 1',
          description: 'Description 1',
          category: 'Technology',
          deadline: '2024-12-31T23:59:59.000Z',
          buyerId: userId,
          status: 'draft'
        },
        {
          title: 'RFP 2',
          description: 'Description 2',
          category: 'Services',
          deadline: '2024-12-31T23:59:59.000Z',
          buyerId: userId,
          status: 'published',
          isPublic: true
        }
      ];

      await RFP.bulkCreate(rfps);
    });

    it('should get RFPs for buyer', async () => {
      const response = await request(app)
        .get('/api/rfps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('rfps');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.rfps).toHaveLength(2);
    });

    it('should filter RFPs by status', async () => {
      const response = await request(app)
        .get('/api/rfps?status=draft')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.rfps).toHaveLength(1);
      expect(response.body.rfps[0].status).toBe('draft');
    });

    it('should search RFPs by title', async () => {
      const response = await request(app)
        .get('/api/rfps?search=RFP 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.rfps).toHaveLength(1);
      expect(response.body.rfps[0].title).toBe('RFP 1');
    });
  });

  describe('GET /api/rfps/:id', () => {
    let rfpId;

    beforeEach(async () => {
      const rfp = await RFP.create({
        title: 'Test RFP',
        description: 'Test Description',
        category: 'Technology',
        deadline: '2024-12-31T23:59:59.000Z',
        buyerId: userId,
        status: 'draft'
      });

      rfpId = rfp.id;
    });

    it('should get RFP by ID', async () => {
      const response = await request(app)
        .get(`/api/rfps/${rfpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('rfp');
      expect(response.body.rfp.id).toBe(rfpId);
      expect(response.body.rfp.title).toBe('Test RFP');
    });

    it('should not get non-existent RFP', async () => {
      const response = await request(app)
        .get('/api/rfps/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'RFP not found');
    });
  });

  describe('PUT /api/rfps/:id', () => {
    let rfpId;

    beforeEach(async () => {
      const rfp = await RFP.create({
        title: 'Test RFP',
        description: 'Test Description',
        category: 'Technology',
        deadline: '2024-12-31T23:59:59.000Z',
        buyerId: userId,
        status: 'draft'
      });

      rfpId = rfp.id;
    });

    it('should update RFP', async () => {
      const updateData = {
        title: 'Updated RFP',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/rfps/${rfpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'RFP updated successfully');
      expect(response.body.rfp.title).toBe('Updated RFP');
    });

    it('should not update RFP of another user', async () => {
      // Create another user
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'buyer'
      });

      const anotherRfp = await RFP.create({
        title: 'Another RFP',
        description: 'Another Description',
        category: 'Technology',
        deadline: '2024-12-31T23:59:59.000Z',
        buyerId: anotherUser.id,
        status: 'draft'
      });

      const updateData = {
        title: 'Hacked RFP'
      };

      const response = await request(app)
        .put(`/api/rfps/${anotherRfp.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Access denied');
    });
  });

  describe('DELETE /api/rfps/:id', () => {
    let rfpId;

    beforeEach(async () => {
      const rfp = await RFP.create({
        title: 'Test RFP',
        description: 'Test Description',
        category: 'Technology',
        deadline: '2024-12-31T23:59:59.000Z',
        buyerId: userId,
        status: 'draft'
      });

      rfpId = rfp.id;
    });

    it('should delete RFP', async () => {
      const response = await request(app)
        .delete(`/api/rfps/${rfpId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'RFP deleted successfully');

      // Verify RFP is deleted
      const deletedRfp = await RFP.findByPk(rfpId);
      expect(deletedRfp).toBeNull();
    });
  });
});

