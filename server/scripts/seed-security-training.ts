/**
 * Seed Security Training Modules
 * 
 * This script seeds the database with initial security training modules.
 */

import { db } from '../db';
import { 
  securityTrainingModules, 
  securityTrainingQuizQuestions,
  InsertSecurityTrainingModule,
  InsertSecurityTrainingQuizQuestion
} from '@shared/schema/security-training';
import { logger } from '../utils/logger';

async function seedSecurityTrainingModules() {
  try {
    // Check if modules already exist
    const existingModules = await db.query.securityTrainingModules.findMany();
    
    if (existingModules.length > 0) {
      logger.info(`Security training modules already exist (${existingModules.length} found). Skipping seeding.`);
      return;
    }
    
    logger.info('Seeding security training modules...');
    
    // Define modules
    const modules: InsertSecurityTrainingModule[] = [
      {
        title: 'Password Security Fundamentals',
        description: 'Learn the basics of creating and managing strong passwords to protect your accounts.',
        content: `
          <div class="prose max-w-none">
            <h2>Password Security Fundamentals</h2>
            <p>Strong passwords are your first line of defense against unauthorized access to your accounts and sensitive information.</p>
            
            <h3>Creating Strong Passwords</h3>
            <p>A strong password should:</p>
            <ul>
              <li>Be at least 12 characters long</li>
              <li>Include a mix of uppercase and lowercase letters</li>
              <li>Include numbers</li>
              <li>Include special characters (!@#$%^&*)</li>
              <li>Not contain easily guessable information (names, birthdays, common words)</li>
            </ul>
            
            <h3>Password Management Best Practices</h3>
            <ul>
              <li>Use a different password for each account</li>
              <li>Change passwords regularly (every 90 days)</li>
              <li>Never share passwords with others</li>
              <li>Don't write passwords down or store them in unsecured locations</li>
              <li>Consider using a password manager to generate and store complex passwords</li>
            </ul>
            
            <h3>Signs Your Password May Be Compromised</h3>
            <ul>
              <li>Unexpected account activity or login notifications</li>
              <li>Changes to account settings you didn't make</li>
              <li>Emails about password reset requests you didn't initiate</li>
            </ul>
            
            <h3>What to Do If Your Password Is Compromised</h3>
            <ol>
              <li>Change your password immediately</li>
              <li>Enable two-factor authentication if available</li>
              <li>Check for any unauthorized activity</li>
              <li>Change passwords on other accounts if you've used the same password</li>
              <li>Report the incident to your IT department or security team</li>
            </ol>
          </div>
        `,
        type: 'article',
        difficulty: 'beginner',
        estimatedDuration: 15,
        requiredForRoles: ['care_worker', 'manager', 'admin', 'super_admin'],
        prerequisites: [],
        isActive: true,
        order: 1,
        tags: ['password', 'security', 'basics'],
        thumbnail: 'https://via.placeholder.com/300x200?text=Password+Security',
        expiryPeriod: 365 // Expires after 1 year
      },
      {
        title: 'Two-Factor Authentication',
        description: 'Learn how to add an extra layer of security to your accounts with two-factor authentication.',
        content: `
          <div class="prose max-w-none">
            <h2>Two-Factor Authentication (2FA)</h2>
            <p>Two-factor authentication adds an extra layer of security to your accounts by requiring two different types of verification.</p>
            
            <h3>What is Two-Factor Authentication?</h3>
            <p>Two-factor authentication (2FA) is a security process that requires users to provide two different authentication factors to verify their identity. This provides stronger security than single-factor authentication (just a password).</p>
            
            <h3>Types of Authentication Factors</h3>
            <ol>
              <li><strong>Something you know</strong> - Password, PIN, or security question</li>
              <li><strong>Something you have</strong> - Mobile phone, security key, or authentication app</li>
              <li><strong>Something you are</strong> - Fingerprint, face recognition, or other biometric</li>
            </ol>
            
            <h3>Benefits of Two-Factor Authentication</h3>
            <ul>
              <li>Significantly improves account security</li>
              <li>Protects against password theft and phishing attacks</li>
              <li>Adds a layer of protection even if your password is compromised</li>
              <li>Helps meet compliance requirements in healthcare and other regulated industries</li>
            </ul>
            
            <h3>Common Two-Factor Authentication Methods</h3>
            <ul>
              <li><strong>SMS Text Messages</strong> - A code is sent to your phone via text message</li>
              <li><strong>Authentication Apps</strong> - Apps like Google Authenticator or Authy generate time-based codes</li>
              <li><strong>Security Keys</strong> - Physical devices that connect to your computer or phone</li>
              <li><strong>Biometric Verification</strong> - Fingerprint or face recognition</li>
            </ul>
            
            <h3>Setting Up Two-Factor Authentication in CareUnity</h3>
            <ol>
              <li>Go to Security Settings in your profile</li>
              <li>Select "Enable Two-Factor Authentication"</li>
              <li>Choose your preferred 2FA method</li>
              <li>Follow the on-screen instructions to complete setup</li>
              <li>Save your backup codes in a secure location</li>
            </ol>
          </div>
        `,
        type: 'article',
        difficulty: 'beginner',
        estimatedDuration: 20,
        requiredForRoles: ['care_worker', 'manager', 'admin', 'super_admin'],
        prerequisites: [1], // Password Security Fundamentals
        isActive: true,
        order: 2,
        tags: ['2fa', 'authentication', 'security'],
        thumbnail: 'https://via.placeholder.com/300x200?text=Two-Factor+Authentication',
        expiryPeriod: 365 // Expires after 1 year
      },
      {
        title: 'Phishing Awareness',
        description: 'Learn how to identify and avoid phishing attempts that target your personal and work accounts.',
        content: `
          <div class="prose max-w-none">
            <h2>Phishing Awareness</h2>
            <p>Phishing is a type of social engineering attack often used to steal user data, including login credentials and credit card numbers.</p>
            
            <h3>What is Phishing?</h3>
            <p>Phishing attacks typically come in the form of fraudulent emails, messages, or websites that appear to come from reputable sources. They attempt to trick you into revealing sensitive information or installing malware.</p>
            
            <h3>Common Types of Phishing Attacks</h3>
            <ul>
              <li><strong>Email Phishing</strong> - Fraudulent emails that appear to come from legitimate organizations</li>
              <li><strong>Spear Phishing</strong> - Targeted attacks directed at specific individuals or companies</li>
              <li><strong>Whaling</strong> - Phishing attacks specifically targeting senior executives or high-profile targets</li>
              <li><strong>Smishing</strong> - Phishing conducted via SMS text messages</li>
              <li><strong>Vishing</strong> - Voice phishing conducted over phone calls</li>
            </ul>
            
            <h3>Red Flags to Watch For</h3>
            <ul>
              <li>Urgent or threatening language</li>
              <li>Poor spelling and grammar</li>
              <li>Mismatched or suspicious URLs</li>
              <li>Requests for personal information</li>
              <li>Unexpected attachments or links</li>
              <li>Too-good-to-be-true offers</li>
              <li>Unusual sender email address</li>
            </ul>
            
            <h3>How to Protect Yourself</h3>
            <ol>
              <li>Verify the sender's email address</li>
              <li>Hover over links before clicking to see the actual URL</li>
              <li>Never provide sensitive information in response to an email request</li>
              <li>Be wary of attachments, especially unexpected ones</li>
              <li>When in doubt, contact the purported sender directly using contact information you know is legitimate</li>
              <li>Keep your software and security systems updated</li>
              <li>Use multi-factor authentication when available</li>
            </ol>
            
            <h3>What to Do If You Suspect a Phishing Attempt</h3>
            <ol>
              <li>Don't click any links or download any attachments</li>
              <li>Report the suspicious email to your IT department</li>
              <li>Delete the email from your inbox</li>
              <li>If you've already clicked a link or provided information, change your passwords immediately</li>
              <li>Monitor your accounts for suspicious activity</li>
            </ol>
          </div>
        `,
        type: 'article',
        difficulty: 'beginner',
        estimatedDuration: 25,
        requiredForRoles: ['care_worker', 'manager', 'admin', 'super_admin'],
        prerequisites: [],
        isActive: true,
        order: 3,
        tags: ['phishing', 'email', 'security', 'social engineering'],
        thumbnail: 'https://via.placeholder.com/300x200?text=Phishing+Awareness',
        expiryPeriod: 365 // Expires after 1 year
      },
      {
        title: 'Security Best Practices Quiz',
        description: 'Test your knowledge of security best practices with this comprehensive quiz.',
        content: `
          <div class="prose max-w-none">
            <h2>Security Best Practices Quiz</h2>
            <p>This quiz will test your knowledge of security best practices covered in the previous training modules.</p>
            <p>Please answer all questions to complete the quiz. You need a score of 70% or higher to pass.</p>
          </div>
        `,
        type: 'quiz',
        difficulty: 'beginner',
        estimatedDuration: 15,
        requiredForRoles: ['care_worker', 'manager', 'admin', 'super_admin'],
        prerequisites: [1, 2, 3], // Previous modules
        isActive: true,
        order: 4,
        tags: ['quiz', 'assessment', 'security'],
        thumbnail: 'https://via.placeholder.com/300x200?text=Security+Quiz',
        expiryPeriod: 365 // Expires after 1 year
      }
    ];
    
    // Insert modules
    for (const module of modules) {
      const [insertedModule] = await db.insert(securityTrainingModules)
        .values(module)
        .returning();
      
      logger.info(`Created security training module: ${insertedModule.title}`);
    }
    
    // Define quiz questions for the quiz module
    const quizModule = await db.query.securityTrainingModules.findFirst({
      where: (modules, { eq }) => eq(modules.type, 'quiz')
    });
    
    if (quizModule) {
      const questions: InsertSecurityTrainingQuizQuestion[] = [
        {
          moduleId: quizModule.id,
          question: 'Which of the following is NOT a characteristic of a strong password?',
          options: [
            'At least 12 characters long',
            'Includes special characters',
            'Uses a common word or phrase',
            'Combines uppercase and lowercase letters'
          ],
          correctOption: 2, // Zero-based index
          explanation: 'Strong passwords should not use common words or phrases as they are easy to guess or crack.',
          points: 1,
          order: 1
        },
        {
          moduleId: quizModule.id,
          question: 'What is two-factor authentication?',
          options: [
            'Using two different passwords for the same account',
            'Requiring two different types of verification to access an account',
            'Changing your password twice a year',
            'Having two people approve access to sensitive information'
          ],
          correctOption: 1,
          explanation: 'Two-factor authentication requires two different types of verification: something you know (like a password) and something you have (like a phone) or something you are (like a fingerprint).',
          points: 1,
          order: 2
        },
        {
          moduleId: quizModule.id,
          question: 'Which of the following is a common sign of a phishing email?',
          options: [
            'Comes from a known sender with their usual email address',
            'Contains specific information relevant to your work',
            'Has urgent or threatening language',
            'Includes a company logo and professional formatting'
          ],
          correctOption: 2,
          explanation: 'Urgent or threatening language is a common tactic in phishing emails to pressure you into taking action without thinking carefully.',
          points: 1,
          order: 3
        },
        {
          moduleId: quizModule.id,
          question: 'What should you do if you suspect your password has been compromised?',
          options: [
            'Wait and see if there are any unauthorized activities',
            'Change your password immediately',
            'Use the same password but add an extra character',
            'Share the concern with a colleague to see if they experienced the same issue'
          ],
          correctOption: 1,
          explanation: 'If you suspect your password has been compromised, you should change it immediately to prevent unauthorized access.',
          points: 1,
          order: 4
        },
        {
          moduleId: quizModule.id,
          question: 'Which of the following is the best practice for managing passwords?',
          options: [
            'Use the same password for all accounts to avoid forgetting them',
            'Write down passwords and keep them near your computer',
            'Share passwords with trusted colleagues for backup purposes',
            'Use a password manager to generate and store unique passwords'
          ],
          correctOption: 3,
          explanation: 'Password managers help you generate strong, unique passwords for each account and store them securely.',
          points: 1,
          order: 5
        },
        {
          moduleId: quizModule.id,
          question: 'What should you do before clicking a link in an email?',
          options: [
            'Check if the email has a professional signature',
            'Hover over the link to see the actual URL',
            'Click the link in a private browsing window',
            'Forward the email to a colleague to check'
          ],
          correctOption: 1,
          explanation: 'Hovering over a link shows you the actual URL it will take you to, which helps identify fraudulent links.',
          points: 1,
          order: 6
        },
        {
          moduleId: quizModule.id,
          question: 'How often should you change your passwords?',
          options: [
            'Never, if they are strong enough',
            'Every week',
            'Every 90 days',
            'Only when there is a security breach'
          ],
          correctOption: 2,
          explanation: 'Changing passwords regularly (about every 90 days) is a good security practice, especially for accounts with sensitive information.',
          points: 1,
          order: 7
        },
        {
          moduleId: quizModule.id,
          question: 'Which of the following is NOT a type of two-factor authentication?',
          options: [
            'SMS text message codes',
            'Authentication apps',
            'Security questions',
            'Biometric verification'
          ],
          correctOption: 2,
          explanation: 'Security questions are a form of knowledge-based authentication, not two-factor authentication. They are still something you know, like a password.',
          points: 1,
          order: 8
        },
        {
          moduleId: quizModule.id,
          question: 'What should you do if you receive a suspicious email at work?',
          options: [
            'Delete it immediately',
            'Forward it to your personal email to examine it more carefully',
            'Report it to your IT department or security team',
            'Reply to ask the sender to verify their identity'
          ],
          correctOption: 2,
          explanation: 'Reporting suspicious emails to your IT department or security team helps protect the entire organization and allows security professionals to investigate.',
          points: 1,
          order: 9
        },
        {
          moduleId: quizModule.id,
          question: 'What is the purpose of backup codes in two-factor authentication?',
          options: [
            'To share with trusted colleagues in case of emergency',
            'To access your account if you lose your authentication device',
            'To reset your password',
            'To verify your identity when setting up 2FA'
          ],
          correctOption: 1,
          explanation: 'Backup codes allow you to access your account if you lose your authentication device (like your phone) or cannot receive authentication codes.',
          points: 1,
          order: 10
        }
      ];
      
      // Insert questions
      for (const question of questions) {
        await db.insert(securityTrainingQuizQuestions)
          .values(question);
      }
      
      logger.info(`Created ${questions.length} quiz questions for module: ${quizModule.title}`);
    }
    
    logger.info('Security training modules seeded successfully.');
  } catch (error) {
    logger.error('Error seeding security training modules:', error);
    throw error;
  }
}

// Export the function for use in other scripts
export { seedSecurityTrainingModules };

// If this script is run directly, execute the seeding function
if (require.main === module) {
  seedSecurityTrainingModules()
    .then(() => {
      logger.info('Seeding completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}
