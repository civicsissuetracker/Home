const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger when a new issue document is created
exports.notifyAdminOnNewIssue = functions.firestore
  .document('issues/{issueId}')
  .onCreate(async (snap, context) => {
    const issue = snap.data();
    const title = issue.title || 'New civic issue reported';
    const body = `${(issue.category || 'General').toUpperCase()}: ${issue.description ? issue.description.substring(0, 80) : ''}`;

    // Fetch all admin tokens from adminTokens collection
    const tokensSnap = await admin.firestore().collection('adminTokens').get();
    const tokens = [];
    tokensSnap.forEach(doc => {
      const d = doc.data();
      if (d && d.token) tokens.push(d.token);
    });

    if (!tokens.length) {
      console.log('No admin tokens registered.');
      return null;
    }

    const payload = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        issueId: context.params.issueId,
        category: issue.category || '',
      }
    };

    try {
      // Send to multiple registration tokens
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log('FCM response:', response);
      // Optionally, remove invalid tokens
      const tokensToRemove = [];
      response.results.forEach((res, idx) => {
        const error = res.error;
        if (error) {
          console.error('Failure sending to', tokens[idx], error);
          // If token is invalid, remove from Firestore
          if (error.code === 'messaging/registration-token-not-registered' ||
              error.code === 'messaging/invalid-registration-token') {
            tokensToRemove.push(tokens[idx]);
          }
        }
      });
      // Remove invalid tokens
      for (const t of tokensToRemove) {
        const docRef = admin.firestore().collection('adminTokens').doc(t);
        await docRef.delete();
      }
    } catch (err) {
      console.error('Error sending FCM:', err);
    }
    return null;
  })
;
