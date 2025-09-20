export interface TemplateVariables {
  [key: string]: any;
}

export interface RenderedTemplate {
  subject: string;
  html: string;
}

// Welcome Template
const welcome_template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bridge</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .welcome-message {
      font-size: 18px;
      margin-bottom: 25px;
      color: #2c3e50;
    }
    .account-info {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      border-left: 4px solid #667eea;
    }
    .account-info h3 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      font-size: 16px;
    }
    .account-info p {
      margin: 5px 0;
      color: #6c757d;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 15px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .features {
      margin: 30px 0;
    }
    .features h3 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .feature-list {
      list-style: none;
      padding: 0;
    }
    .feature-list li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }
    .feature-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #28a745;
      font-weight: bold;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      color: #6c757d;
      font-size: 14px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Bridge!</h1>
      <p>Your journey starts here</p>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        <p>Hello <strong>{{name}}</strong>,</p>
        <p>Welcome to Bridge! We're thrilled to have you join our community. You're now part of something special.</p>
      </div>
      
      <div class="account-info">
        <h3>📧 Your Account Details</h3>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Account Status:</strong> Active</p>
        <p><strong>Member Since:</strong> {{signupDate}}</p>
      </div>
      
      <div class="cta-section">
        <a href="{{dashboardUrl}}" class="cta-button">Get Started</a>
      </div>
      
      <div class="features">
        <h3>🚀 What you can do now:</h3>
        <ul class="feature-list">
          <li>Explore our platform features</li>
          <li>Connect with other members</li>
          <li>Access exclusive content</li>
          <li>Customize your profile</li>
          <li>Join discussions and events</li>
        </ul>
      </div>
      
      <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team. We're here to help!</p>
    </div>
    
    <div class="footer">
      <p>Thank you for choosing Bridge!</p>
      <div class="social-links">
        <a href="#">Help Center</a>
        <a href="#">Contact Support</a>
        <a href="#">Community</a>
      </div>
      <p>This email was sent to {{email}} because you created an account with us.</p>
      <p>© 2024 Bridge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

// Send OTP Template
const send_otp_template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .otp-container {
      background-color: #f8f9fa;
      border: 2px dashed #28a745;
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #28a745;
      margin: 20px 0;
      font-family: 'Courier New', monospace;
    }
    .expiry-info {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .security-notice {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: left;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      color: #6c757d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Your OTP Code</h1>
      <p>Secure verification code</p>
    </div>
    
    <div class="content">
      <p>Hello <strong>{{name}}</strong>,</p>
      <p>You requested a one-time password (OTP) for your account. Here is your verification code:</p>
      
      <div class="otp-container">
        <p style="margin: 0 0 10px 0; color: #6c757d;">Your OTP Code:</p>
        <div class="otp-code">{{otp}}</div>
      </div>
      
      <div class="expiry-info">
        <strong>⏰ Important:</strong> This code will expire in <strong>{{expiresIn}} minutes</strong>.
      </div>
      
      <div class="security-notice">
        <strong>🛡️ Security Notice:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Never share this code with anyone</li>
          <li>Our team will never ask for your OTP</li>
          <li>If you didn't request this code, please ignore this email</li>
          <li>For security, this code can only be used once</li>
        </ul>
      </div>
      
      <p>If you didn't request this OTP, please contact our support team immediately.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 Bridge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

export class TemplateService {
  private static templates: Record<string, { subject: string; html: string }> = {
    welcome: {
      subject: 'Welcome to Bridge - Your Journey Starts Here!',
      html: welcome_template
    },
    
    send_otp: {
      subject: 'Your OTP Code - {{otp}}',
      html: send_otp_template
    }
  };

  static async renderEmail(templateName: string, variables: TemplateVariables) {
    const template = this.templates[templateName];
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let subject = template.subject;
    let html = template.html;

    // Replace variables in subject and html
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key] || '';
      
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject, html };
  }
}
