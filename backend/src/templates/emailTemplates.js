const getRFPNotificationTemplate = (rfp, supplier) => {
  return {
    subject: `New RFP Available: ${rfp.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New RFP Available</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .rfp-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New RFP Available</h1>
          </div>
          <div class="content">
            <p>Dear ${supplier.firstName} ${supplier.lastName},</p>
            <p>A new Request for Proposal (RFP) has been published and is now available for your response.</p>
            
            <div class="rfp-details">
              <h2>${rfp.title}</h2>
              <p><strong>Category:</strong> ${rfp.category}</p>
              <p><strong>Description:</strong> ${rfp.description}</p>
              <p><strong>Budget:</strong> ${rfp.currency} ${rfp.budget ? rfp.budget.toLocaleString() : 'Not specified'}</p>
              <p><strong>Deadline:</strong> ${new Date(rfp.deadline).toLocaleDateString()}</p>
              <p><strong>Published by:</strong> ${rfp.buyer.firstName} ${rfp.buyer.lastName}${rfp.buyer.company ? ` (${rfp.buyer.company})` : ''}</p>
            </div>
            
            <p>Please log in to the RFP system to view the full details and submit your response.</p>
            <a href="${process.env.FRONTEND_URL}/rfps/${rfp.id}" class="button">View RFP Details</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the RFP Contract Management System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New RFP Available: ${rfp.title}
      
      Dear ${supplier.firstName} ${supplier.lastName},
      
      A new Request for Proposal (RFP) has been published and is now available for your response.
      
      RFP Details:
      - Title: ${rfp.title}
      - Category: ${rfp.category}
      - Description: ${rfp.description}
      - Budget: ${rfp.currency} ${rfp.budget ? rfp.budget.toLocaleString() : 'Not specified'}
      - Deadline: ${new Date(rfp.deadline).toLocaleDateString()}
      - Published by: ${rfp.buyer.firstName} ${rfp.buyer.lastName}${rfp.buyer.company ? ` (${rfp.buyer.company})` : ''}
      
      Please log in to the RFP system to view the full details and submit your response.
      
      This is an automated message from the RFP Contract Management System.
    `
  };
};

const getResponseNotificationTemplate = (rfp, response, buyer) => {
  return {
    subject: `New Response Received for RFP: ${rfp.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Response Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .response-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Response Received</h1>
          </div>
          <div class="content">
            <p>Dear ${buyer.firstName} ${buyer.lastName},</p>
            <p>A new response has been submitted for your RFP.</p>
            
            <div class="response-details">
              <h2>RFP: ${rfp.title}</h2>
              <p><strong>Supplier:</strong> ${response.supplier.firstName} ${response.supplier.lastName}</p>
              <p><strong>Company:</strong> ${response.supplier.company || 'Not specified'}</p>
              <p><strong>Proposed Budget:</strong> ${rfp.currency} ${response.proposedBudget ? response.proposedBudget.toLocaleString() : 'Not specified'}</p>
              <p><strong>Timeline:</strong> ${response.timeline || 'Not specified'}</p>
              <p><strong>Submitted:</strong> ${new Date(response.submittedAt).toLocaleString()}</p>
            </div>
            
            <p>Please log in to the RFP system to review the full response.</p>
            <a href="${process.env.FRONTEND_URL}/responses/${response.id}" class="button">Review Response</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the RFP Contract Management System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Response Received for RFP: ${rfp.title}
      
      Dear ${buyer.firstName} ${buyer.lastName},
      
      A new response has been submitted for your RFP.
      
      Response Details:
      - RFP: ${rfp.title}
      - Supplier: ${response.supplier.firstName} ${response.supplier.lastName}
      - Company: ${response.supplier.company || 'Not specified'}
      - Proposed Budget: ${rfp.currency} ${response.proposedBudget ? response.proposedBudget.toLocaleString() : 'Not specified'}
      - Timeline: ${response.timeline || 'Not specified'}
      - Submitted: ${new Date(response.submittedAt).toLocaleString()}
      
      Please log in to the RFP system to review the full response.
      
      This is an automated message from the RFP Contract Management System.
    `
  };
};

const getStatusUpdateTemplate = (rfp, user, status) => {
  const statusMessages = {
    'published': 'Your RFP has been published and is now visible to suppliers.',
    'response_submitted': 'A response has been submitted to your RFP.',
    'under_review': 'Your response is currently under review.',
    'approved': 'Congratulations! Your response has been approved.',
    'rejected': 'Your response has been rejected.'
  };

  return {
    subject: `RFP Status Update: ${rfp.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RFP Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .status.published { background: #4caf50; color: white; }
          .status.response_submitted { background: #2196f3; color: white; }
          .status.under_review { background: #ff9800; color: white; }
          .status.approved { background: #4caf50; color: white; }
          .status.rejected { background: #f44336; color: white; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RFP Status Update</h1>
          </div>
          <div class="content">
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>The status of your RFP has been updated.</p>
            
            <div class="status-details">
              <h2>${rfp.title}</h2>
              <p><strong>New Status:</strong> <span class="status ${status}">${status.replace('_', ' ').toUpperCase()}</span></p>
              <p>${statusMessages[status] || 'The status of your RFP has been updated.'}</p>
            </div>
            
            <p>Please log in to the RFP system to view the updated details.</p>
            <a href="${process.env.FRONTEND_URL}/rfps/${rfp.id}" class="button">View RFP Details</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the RFP Contract Management System.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      RFP Status Update: ${rfp.title}
      
      Dear ${user.firstName} ${user.lastName},
      
      The status of your RFP has been updated.
      
      RFP Details:
      - Title: ${rfp.title}
      - New Status: ${status.replace('_', ' ').toUpperCase()}
      - Message: ${statusMessages[status] || 'The status of your RFP has been updated.'}
      
      Please log in to the RFP system to view the updated details.
      
      This is an automated message from the RFP Contract Management System.
    `
  };
};

module.exports = {
  getRFPNotificationTemplate,
  getResponseNotificationTemplate,
  getStatusUpdateTemplate
};

