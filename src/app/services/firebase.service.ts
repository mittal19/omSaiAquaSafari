import { Injectable } from '@angular/core';
import { Database, ref, push, set, onValue } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private db: Database) {}

  // 🔹 Add Data
  addUser(user: any) {
    const userRef = ref(this.db, 'users');
    return push(userRef, user);
  }

  // 🔹 Get Data (Realtime)
  getUsers(): Observable<any[]> {
    return new Observable(observer => {
      const userRef = ref(this.db, 'users');

      onValue(userRef, snapshot => {
        const data = snapshot.val();
        const users = data ? Object.values(data) : [];
        observer.next(users);
      });
    });
  }
}
