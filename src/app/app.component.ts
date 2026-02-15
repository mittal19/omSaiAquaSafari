import { Component } from '@angular/core';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { ContactComponent } from './common/contact/contact.component';
import { WhatsappComponent } from './common/whatsapp/whatsapp.component';
import { EnquireComponent } from './common/enquire/enquire.component';
import { RouterOutlet } from '@angular/router';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent, FooterComponent, ContactComponent, WhatsappComponent, EnquireComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'omsai';

  // constructor(private firebaseService: FirebaseService){}
  
  ngOnInit(){
    //  this.firebaseService.getUsers()
    //   .subscribe(data => console.log(data));
  }
    // test() {
    //   console.log("fds")
    //   this.firebaseService.addUser({
    //     name: 'Priyanshu',
    //     age: 23
    //   }).catch(err=>console.log(err));
    // }
  
}
