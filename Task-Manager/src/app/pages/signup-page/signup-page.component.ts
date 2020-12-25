import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { AuthService } from 'src/app/auth.service';
import { Router } from '@angular/router';
import {NgForm} from '@angular/forms'
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit {

  constructor(private authService: AuthService , private router: Router , private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
      this.matIconRegistry.addSvgIcon(
        "ctask",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/svg/ctask.svg")
      );
    }

  ngOnInit(): void {
  }

  onSignUpButtonClicked(email:string , password:string){
    this.authService.signup(email, password).subscribe((res:HttpResponse<any>)=>{
      if(res.status === 200){
        //Logged in Successfully
        this.router.navigate(['/lists']);
      }
      console.log(res);
    })
  }
  
  
}
