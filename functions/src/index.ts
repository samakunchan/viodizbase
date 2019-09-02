import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
  return admin
    .auth()
    .getUserByEmail(data.email)
    .then(user => {
      return admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
      });
    })
    .then(() => {
      return {
        message: `Success! ${data.email} has been made an admin.`,
      };
    })
    .catch(err => {
      return err;
    });
});

exports.addModoRole = functions.https.onCall((data, context) => {
  return admin
    .auth()
    .getUserByEmail(data.email)
    .then(user => {
      return admin.auth().setCustomUserClaims(user.uid, {
        moderator: true,
      });
    })
    .then(() => {
      return {
        message: `Success! ${data.email} has been made an moderator.`,
      };
    })
    .catch(err => {
      return err;
    });
});

exports.getUserWithToken = functions.https.onCall((data, context) => {
  return admin
    .auth()
    .verifyIdToken(data.token)
    .then(claims => {
      return claims;
    })
    .catch(error => {
      console.log(error);
    });
});
