import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import _ from 'lodash';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey || '',
  authDomain: process.env.REACT_APP_authDomain || '',
  projectId: process.env.REACT_APP_projectId || '',
  storageBucket: process.env.REACT_APP_storageBucket || '',
  messagingSenderId: process.env.REACT_APP_messagingSenderId || '',
  appId: process.env.REACT_APP_appId || '',
  measurementId: process.env.REACT_APP_measurementId || '',
};

// Initialize Firebase
const validConfigs =
  !_.isEmpty(firebaseConfig.apiKey) &&
  !_.isEmpty(firebaseConfig.authDomain) &&
  !_.isEmpty(firebaseConfig.projectId) &&
  !_.isEmpty(firebaseConfig.storageBucket) &&
  !_.isEmpty(firebaseConfig.messagingSenderId) &&
  !_.isEmpty(firebaseConfig.appId) &&
  !_.isEmpty(firebaseConfig.measurementId);
const app = validConfigs ? initializeApp(firebaseConfig) : null;
export const analytics = app ? getAnalytics(app) : null;
