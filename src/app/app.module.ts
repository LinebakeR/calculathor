import {importProvidersFrom, NgModule} from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {CalculateComponent} from "./component/calculate/calculate.component";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";


const firebaseConfig = {
  apiKey: "AIzaSyD-BuUZ9qoysvBUvalfc0DS9nY31wwXYAw",
  authDomain: "calculathor-f0e41.firebaseapp.com",
  projectId: "calculathor-f0e41",
  storageBucket: "calculathor-f0e41.appspot.com",
  messagingSenderId: "66822562266",
  appId: "1:66822562266:web:d095ede90d09ff1a8fe0e3",
  measurementId: "G-E32LXRTZ3X"
};

@NgModule({
  declarations: [
    AppComponent, CalculateComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MatFormField,
        MatInput,
        MatLabel,
        FormsModule
    ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom([provideFirebaseApp(() => initializeApp(firebaseConfig))])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
