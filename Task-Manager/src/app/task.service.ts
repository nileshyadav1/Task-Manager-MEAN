import { Injectable } from '@angular/core';
import { Task } from './pages/models/task.models';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService : WebRequestService) { }
 
 

  getLists(){
    return this.webReqService.get('lists');
  }
  createList(title: string){
    //Send a web request to create a list (we do not want to put HTTP logic in this service)
   return this.webReqService.post('lists',{title});
  }
  updateList(id: string, title:string ){
    //Send a web request to update a list 
   return this.webReqService.patch(`lists/${id}`,{title});
  }
  updateTask(listId: string, taskId: string, title:string ){
    //Send a web request to update a task
   return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`,{title});
  }

  deleteList(id: string){
    return this.webReqService.delete(`lists/${id}`); 
  }
  deleteTask(listId: string,taskId: string){
    return this.webReqService.delete(`lists/${listId}/tasks/${taskId}`); 
  }
  getTasks(listId : string){
    return this.webReqService.get(`lists/${listId}/tasks`);

  }
  createTask(title: string, listId: string){
    //Send a web request to create a Atask (we do not want to put HTTP logic in this service)
   return this.webReqService.post(`lists/${listId}/tasks`,{title});
  }

  complete(task: Task){
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`,{
      completed: !task.completed
    });
  }
}
