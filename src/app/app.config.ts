import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"danotes-7a5b1","appId":"1:993533275455:web:c54d21917c05e12ea3b78a","storageBucket":"danotes-7a5b1.firebasestorage.app","apiKey":"AIzaSyAnPQo60QJzlVtT7enZ9eSaD2fvJMGggKQ","authDomain":"danotes-7a5b1.firebaseapp.com","messagingSenderId":"993533275455"}))), importProvidersFrom(provideFirestore(() => getFirestore()))]
};
