import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(public afAuth: AngularFireAuth) {}

  // função para resetar a senha no authentication
  Resetarsenha(value: any) {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth()
        .sendPasswordResetEmail(value.email, value.password)
        .then(
          (res: any) => {
            resolve(res);
          },
          (err: any) => reject(err)
        );
    });
  }

  // função para efetuar o login por meio do authentication
  doLogin(value: any) {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth()
        .signInWithEmailAndPassword(value.email, value.password)
        .then(
          (res: any) => {
            resolve(res);
          },
          (err: any) => reject(err)
        );
    });
  }

  // função para realizar o logout do authentication e consequentemente da plataforma
  doLogout() {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then(
          (res: any) => {
            resolve(res);
          },
          (err: any) => reject(err)
        );
    });
  }

  // função para checar o email
  verificarEmail() {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().currentUser?.displayName;
    });
  }
}
