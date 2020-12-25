import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';
import { List } from '../models/list.model';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private taskService : TaskService, private router: Router) { }

  ngOnInit(): void {
  }
   
  createList(title: string){
    
      this.taskService.createList(title).subscribe((list: List)=>{
        console.log(list);
        
        //To navigate to /lists/response._id
        this.router.navigate(["/lists",list._id]);
      });
    
  }
}
