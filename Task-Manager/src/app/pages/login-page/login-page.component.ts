import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(private authService : AuthService, private router: Router ,private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
      this.matIconRegistry.addSvgIcon(
        "p-completed",
        this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/svg/p-completed.svg")
      );
     }

  ngOnInit(): void {
  }

  onLoginButtonClicked(email:string , password:string){
    this.authService.login(email, password).subscribe((res: HttpResponse<any>)=>{
      if(res.status === 200){
        //Logged in Successfully
        this.router.navigate(['/lists']);
      }
     
      console.log(res);
    })
    
  }
}
