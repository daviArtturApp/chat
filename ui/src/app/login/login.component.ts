import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  formControl = new FormGroup({
    email: new FormControl('', [Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  constructor(private httpClient: HttpClient, private router: Router) {}

  submitForm() {
    const values = this.formControl.value
    this.httpClient.post('http://localhost:3000/auth', values).subscribe((result) => {
      const data = result as { token: string }
      window.localStorage.setItem('token', data.token);
      this.router.navigateByUrl('chat')
    });
  }
}
