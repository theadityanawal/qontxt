// firestore-init.js
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
// Make sure to place your service account JSON file in the same directory
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

// Function to create initial collections
async function initializeFirestore() {
  try {
    // Create a test user
    const testUser = {
      uid: 'test-user-1',
      email: 'test@example.com',
      created_at: admin.firestore.Timestamp.now(),
      last_login: admin.firestore.Timestamp.now(),
      parent_resume_id: null
    };

    // Create a test base resume
    const testResume = {
      id: 'test-resume-1',
      user_id: testUser.uid,
      version: 'base',
      parent_resume_id: null,
      job_description: null,
      created_at: admin.firestore.Timestamp.now(),
      updated_at: admin.firestore.Timestamp.now(),
      personal_info: {
        name: 'Test User',
        headline: 'UI/UX Designer',
        contact: {
          email: 'test@example.com',
          phone: '+1234567890',
          location: 'Remote'
        },
        social_links: [
          {
            platform: 'LinkedIn',
            url: 'https://linkedin.com/in/testuser'
          }
        ]
      },
      summary: null,
      work_experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      languages: []
    };

    // Create collections and documents
    await db.collection('users').doc(testUser.uid).set(testUser);
    await db.collection('resumes').doc(testResume.id).set(testResume);

    // Update user with parent resume ID
    await db.collection('users').doc(testUser.uid).update({
      parent_resume_id: testResume.id
    });

    console.log('Successfully initialized Firestore with test data!');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

// Execute initialization
initializeFirestore().then(() => {
  console.log('Initialization complete!');
  process.exit(0);
}).catch(error => {
  console.error('Initialization failed:', error);
  process.exit(1);
});
