import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { apiFirebase } from '../environments/api-config';

const firebaseConfig = {
  apiKey: apiFirebase.apiKey,
  authDomain: apiFirebase.authDomain,
  databaseURL: apiFirebase.databaseURL,
  projectId: apiFirebase.projectId,
  storageBucket: apiFirebase.storageBucket,
  messagingSenderId: apiFirebase.messagingSenderId,
  appId: apiFirebase.appId,
};

@NgModule({
  declarations: [],
  imports: [CommonModule, AngularFirestoreModule, AngularFireAuthModule, AngularFireModule.initializeApp(firebaseConfig)],
})
export class AppFirebaseModule {}
