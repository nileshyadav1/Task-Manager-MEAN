import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskviewComponent } from './pages/taskview/taskview.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewListComponent } from './pages/new-list/new-list.component';
import { CommonModule } from "@angular/common";
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { WebReqInterceptor } from './web-req.interceptor';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';
import {FormsModule} from '@angular/forms';
import { CustomValidatorDirective } from './custom-validator.directive';
import { MatIconModule } from "@angular/material/icon"

  
@NgModule({
  declarations: [
    AppComponent,
   
    NewListComponent,
    TaskviewComponent,
    NewTaskComponent,
    LoginPageComponent,
    SignupPageComponent,
    EditListComponent,
    EditTaskComponent,
    CustomValidatorDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatIconModule
    
   
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
