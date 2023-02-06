import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  inputControl = new FormControl('', [Validators.required]);

  constructor(private route: Router) {}

  handleSubmit() {
    const userId = this.inputControl.value;
    this.route.navigateByUrl(`chat/${userId}`)
  }

}
