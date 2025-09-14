const { User, RFP, RFPResponse, Document } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Document.destroy({ where: {} });
    await RFPResponse.destroy({ where: {} });
    await RFP.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('🗑️  Cleared existing data');

    // Create test users
    const plainPassword = 'password123';

    const buyer1 = await User.create({
      email: 'buyer1@test.com',
      password: plainPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'buyer',
      company: 'TechCorp Inc.',
      phone: '+1-555-0101',
      isActive: true
    });

    const buyer2 = await User.create({
      email: 'buyer2@test.com',
      password: plainPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'buyer',
      company: 'Innovation Labs',
      phone: '+1-555-0102',
      isActive: true
    });

    const supplier1 = await User.create({
      email: 'supplier1@test.com',
      password: plainPassword,
      firstName: 'Mike',
      lastName: 'Wilson',
      role: 'supplier',
      company: 'Digital Solutions LLC',
      phone: '+1-555-0201',
      isActive: true
    });

    const supplier2 = await User.create({
      email: 'supplier2@test.com',
      password: plainPassword,
      firstName: 'Lisa',
      lastName: 'Brown',
      role: 'supplier',
      company: 'Creative Agency Co.',
      phone: '+1-555-0202',
      isActive: true
    });

    const supplier3 = await User.create({
      email: 'supplier3@test.com',
      password: plainPassword,
      firstName: 'David',
      lastName: 'Lee',
      role: 'supplier',
      company: 'Enterprise Systems',
      phone: '+1-555-0203',
      isActive: true
    });

    console.log('👥 Created test users');

    // Create test RFPs
    const rfp1 = await RFP.create({
      title: 'Website Redesign Project',
      description: 'We need a complete redesign of our corporate website with modern UI/UX, responsive design, and CMS integration. The project should include user research, wireframing, visual design, and frontend development.',
      category: 'Web Development',
      budget: 50000,
      currency: 'USD',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'published',
      isPublic: true,
      publishedAt: new Date(),
      requirements: [
        '5+ years experience in modern web development',
        'Portfolio of responsive website designs',
        'Experience with React/Next.js',
        'Knowledge of accessibility standards',
        'CMS integration experience (WordPress/Strapi)'
      ],
      evaluationCriteria: [
        'Technical expertise (30%)',
        'Design quality (25%)',
        'Project timeline (20%)',
        'Cost effectiveness (15%)',
        'Communication skills (10%)'
      ],
      submissionInstructions: 'Please submit your proposal including portfolio samples, detailed timeline, and cost breakdown. Include at least 3 references from similar projects.',
      contactEmail: 'john.smith@techcorp.com',
      buyerId: buyer1.id
    });

    const rfp2 = await RFP.create({
      title: 'Mobile App Development',
      description: 'Development of a cross-platform mobile application for iOS and Android. The app should include user authentication, real-time data synchronization, push notifications, and offline capabilities.',
      category: 'Mobile Development',
      budget: 75000,
      currency: 'USD',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      status: 'published',
      isPublic: true,
      publishedAt: new Date(),
      requirements: [
        'Experience with React Native or Flutter',
        'Backend API development skills',
        'Database design and optimization',
        'Push notification implementation',
        'App Store and Google Play deployment experience'
      ],
      evaluationCriteria: [
        'Technical architecture (35%)',
        'User experience design (25%)',
        'Performance optimization (20%)',
        'Security implementation (10%)',
        'Maintenance and support plan (10%)'
      ],
      submissionInstructions: 'Submit a detailed technical proposal with architecture diagrams, development timeline, and maintenance plan. Include demo apps or portfolio samples.',
      contactEmail: 'sarah.johnson@innovationlabs.com',
      buyerId: buyer2.id
    });

    const rfp3 = await RFP.create({
      title: 'E-commerce Platform Integration',
      description: 'Integration of our existing inventory management system with a new e-commerce platform. This includes API development, data migration, payment gateway integration, and order management system.',
      category: 'E-commerce',
      budget: 35000,
      currency: 'USD',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      status: 'draft',
      isPublic: false,
      requirements: [
        'E-commerce platform experience (Shopify, WooCommerce, Magento)',
        'API development and integration',
        'Payment gateway integration (Stripe, PayPal)',
        'Database migration experience',
        'Inventory management system knowledge'
      ],
      evaluationCriteria: [
        'Integration expertise (40%)',
        'Data migration experience (25%)',
        'Security and compliance (20%)',
        'Timeline and delivery (15%)'
      ],
      submissionInstructions: 'Provide examples of similar integrations, detailed technical approach, and risk mitigation strategies.',
      contactEmail: 'john.smith@techcorp.com',
      buyerId: buyer1.id
    });

    console.log('📋 Created test RFPs');

    // Create test RFP responses
    const response1 = await RFPResponse.create({
      rfpId: rfp1.id,
      supplierId: supplier1.id,
      proposal: 'We are excited to propose our comprehensive website redesign solution. Our team has 8+ years of experience in modern web development and has successfully delivered 50+ responsive websites. We will use React with Next.js for optimal performance and SEO, implement a headless CMS for easy content management, and ensure full accessibility compliance. Our approach includes user research, wireframing, iterative design, and agile development methodology.',
      proposedBudget: 45000,
      timeline: '8-10 weeks',
      status: 'submitted',
      submittedAt: new Date(),
      notes: 'We can start immediately and have availability for weekly progress meetings.',
      evaluationScore: null,
      evaluationComments: null
    });

    const response2 = await RFPResponse.create({
      rfpId: rfp1.id,
      supplierId: supplier2.id,
      proposal: 'Our creative agency specializes in brand-focused website redesigns. We will conduct comprehensive user research, create detailed wireframes and prototypes, and deliver a stunning visual design that aligns with your brand identity. We use modern technologies including React, TypeScript, and Tailwind CSS for optimal performance and maintainability.',
      proposedBudget: 48000,
      timeline: '10-12 weeks',
      status: 'submitted',
      submittedAt: new Date(),
      notes: 'We include 3 months of post-launch support and training for your team.',
      evaluationScore: null,
      evaluationComments: null
    });

    const response3 = await RFPResponse.create({
      rfpId: rfp2.id,
      supplierId: supplier1.id,
      proposal: 'We propose developing a cross-platform mobile app using React Native for code reusability and faster development. Our solution includes real-time data sync using Firebase, secure authentication, push notifications, and offline-first architecture. We will implement proper state management with Redux and ensure smooth performance across both platforms.',
      proposedBudget: 70000,
      timeline: '12-14 weeks',
      status: 'submitted',
      submittedAt: new Date(),
      notes: 'We provide comprehensive testing on multiple devices and app store optimization.',
      evaluationScore: null,
      evaluationComments: null
    });

    const response4 = await RFPResponse.create({
      rfpId: rfp2.id,
      supplierId: supplier3.id,
      proposal: 'Our enterprise-grade mobile solution uses Flutter for consistent performance across platforms. We will implement a robust backend using Node.js and PostgreSQL, ensure enterprise-level security, and provide comprehensive analytics and monitoring. Our solution includes automated testing, CI/CD pipeline, and 24/7 monitoring.',
      proposedBudget: 80000,
      timeline: '14-16 weeks',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: 'We offer enterprise support and can scale to handle millions of users.',
      evaluationScore: 85,
      evaluationComments: 'Strong technical proposal with good enterprise focus. Timeline is longer than preferred but quality seems high.'
    });

    console.log('💬 Created test RFP responses');

    // Create some sample documents
    const document1 = await Document.create({
      filename: 'proposal_techcorp_website.pdf',
      originalName: 'Website_Redesign_Proposal.pdf',
      filePath: '/uploads/proposals/proposal_techcorp_website.pdf',
      fileSize: 2048576,
      mimeType: 'application/pdf',
      fileType: 'response_document',
      description: 'Detailed proposal document for website redesign project',
      version: 1,
      isLatest: true,
      uploadedBy: supplier1.id,
      rfpId: rfp1.id,
      responseId: response1.id
    });

    const document2 = await Document.create({
      filename: 'portfolio_samples.zip',
      originalName: 'Portfolio_Samples_2024.zip',
      filePath: '/uploads/portfolios/portfolio_samples.zip',
      fileSize: 15728640,
      mimeType: 'application/zip',
      fileType: 'response_document',
      description: 'Portfolio samples and case studies',
      version: 1,
      isLatest: true,
      uploadedBy: supplier2.id,
      rfpId: rfp1.id,
      responseId: response2.id
    });

    const document3 = await Document.create({
      filename: 'rfp_requirements.pdf',
      originalName: 'RFP_Requirements_Mobile_App.pdf',
      filePath: '/uploads/rfps/rfp_requirements.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      fileType: 'rfp_document',
      description: 'Detailed requirements document for mobile app development',
      version: 1,
      isLatest: true,
      uploadedBy: buyer2.id,
      rfpId: rfp2.id
    });

    console.log('📄 Created sample documents');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: 5 (2 buyers, 3 suppliers)`);
    console.log(`📋 RFPs: 3 (2 published, 1 draft)`);
    console.log(`💬 Responses: 4 (3 submitted, 1 under review)`);
    console.log(`📄 Documents: 3`);
    console.log('\n🔑 Test Credentials:');
    console.log('Buyer 1: buyer1@test.com / password123');
    console.log('Buyer 2: buyer2@test.com / password123');
    console.log('Supplier 1: supplier1@test.com / password123');
    console.log('Supplier 2: supplier2@test.com / password123');
    console.log('Supplier 3: supplier3@test.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n🎉 Seeding completed! You can now test the application.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
