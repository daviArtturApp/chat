import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SocketIoModule } from 'ngx-socket-io';
import * as io from 'socket.io-client';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { ChatState } from './chat/chat.state';
import { ChatService } from './chat/services/chat.service';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    SocketIoModule.forRoot({
       url: 'http://localhost:3001',
    })
  ],
  providers: [ChatService, ChatState],
  bootstrap: [AppComponent]
})
export class AppModule { }
