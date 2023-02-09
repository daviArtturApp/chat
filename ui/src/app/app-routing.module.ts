import { HttpClient } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterModule, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable, take } from 'rxjs';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';


interface User {
  email: string;
  id: number;
  name: string;
  number: string;
  password: string;
}

@Injectable()
export class UserState {
  user = new BehaviorSubject<User | null>(null)

  getUserData() {
    return this.user.value
  }

  setUserData(data: User) {
    this.user.next(data)
  }
}

@Injectable()
export class Auth implements CanActivate {

  constructor(private userState: UserState, private router: Router) {}

  async canActivate() {

    const response = await fetch('http://localhost:3000/auth/user', {
      headers: {
        authorization: `Bearer ${window.localStorage.getItem('token')}`
      }
    })

    const data = await response.json()

    if (!data.id) {
      return this.router.navigateByUrl('login');
    };

    this.userState.setUserData(data);
    return true
  }
}

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: []},
  { path: 'chat', component: ChatComponent, canActivate: [Auth] },
  { path: 'qwe', component: LoginComponent, canActivate: [Auth] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
