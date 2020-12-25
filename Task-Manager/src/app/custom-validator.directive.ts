import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
@Directive({
  selector: '[appCustomValidator]',
  providers: [{provide: NG_VALIDATORS , useExisting: CustomValidatorDirective, multi:true }]
})
export class CustomValidatorDirective implements Validator{

  constructor() { }

   validate(control: AbstractControl){
     const elementValue = control.value;

     if (elementValue === null || elementValue ===undefined || elementValue ===''){
     return {'validate_required':'Field is required' };
   }

     const regExp = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
    
    if(!regExp.test(elementValue)){
      return {"validate_email": 'Enter a valid Email'};
    }

     
    return null;
  }
}
