import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';
import { Task } from '../models/task.models';

import { List } from '../models/list.model';
import { AuthService } from 'src/app/auth.service';


@Component({
  selector: 'app-taskview',
  templateUrl: './taskview.component.html',
  styleUrls: ['./taskview.component.scss']
})
export class TaskviewComponent implements OnInit {

  lists: List[];
  tasks:  Task[];

  selectedListId: string;
  constructor(private taskService: TaskService , private route:ActivatedRoute, private router:Router , private authService: AuthService ) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params)=>{
      // console.log(params);
       if(params.listId){
         this.selectedListId = params.listId;
         this.taskService.getTasks(params.listId).subscribe((tasks: Task[])=>{
            this.tasks=tasks;
          })
        }
          else{
            this.tasks=undefined;
        }

      

      })

    this.taskService.getLists().subscribe((lists: List[])=>{
      console.log(lists);
      this.lists=lists;

    })
  }

  onTaskClick(task: Task){
    this.taskService.complete(task).subscribe(()=>{
      console.log("completed succesfully");
      task.completed=!task.completed;
    })
  }

  onDeleteListClick(){
    this.taskService.deleteList(this.selectedListId).subscribe((res: any)=>{
      this.router.navigate(['/lists']);
      console.log(res);
    })
  }

  onTaskDeleteClick(id: string){
    this.taskService.deleteTask(this.selectedListId ,id).subscribe((res: any)=>{
      this.tasks = this.tasks.filter(value => value._id !=id);
      console.log(res);
    })
  }

  onClickLogout(){
    this.authService.logout()
    this.router.navigate(['/login']);
    
  }

   navTogglerBtn = document.querySelector(".nav-toggler");
      sidebar = document.querySelector(".sidebar");
  nav(){
      this.sidebar.classList.toggle("open");
      this.navTogglerBtn.classList.toggle("open");
  }
}
