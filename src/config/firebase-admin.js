const config = require('../config/config');

const firebaseConfig = {
    type: "service_account",
    project_id: "tracking-d5908",
    private_key_id: "e4a82411f2976e2b68a8b806cb935d4dc5a07100",
    private_key: config.firebase.apikey,
    client_email: "firebase-adminsdk-fbsvc@tracking-d5908.iam.gserviceaccount.com",
    client_id: "106108379328190083467",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tracking-d5908.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };
module.exports = firebaseConfig;  