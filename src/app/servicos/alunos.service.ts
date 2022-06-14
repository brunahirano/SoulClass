import { Injectable } from '@angular/core';
import { Aluno } from '../shared/alunos';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage'
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from "@angular/material/snack-bar"



@Injectable({
  providedIn: 'root'
})
export class AlunosService {
  numero: number
  //Conexão ao Banco de Dados
  storageRef = firebase.app().storage().ref()


  private edicaoAluno = new Subject<any>()

  constructor(private firebaseAngular: AngularFirestore, private snackBar: MatSnackBar) {
    this.numero = 0
  }

  // função do authenticator. Essa função cria uma nova entrada no banco de dados do authenticator e permite que um usuário acesse a plataforma com um login
  doRegister(value:any){
    return new Promise<any>((resolve, reject) => {
      firebase
      .auth()
      .createUserWithEmailAndPassword(value.email, "123456")
      .then(
        (res:any) => {
          resolve(res);
        },
        (err:any) => reject(err)
      )
    });
  }

  // função do authenticator. Essa função envia um email para que o usuário que se cadastrou troca a seu senha.
  Resetarsenha(value: any) {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth().sendPasswordResetEmail
        (value.email)
        .then(
          (res: any) => {
            resolve(res);
          },
          (err: any) => reject(err)
        );
    });
  }
  //Método criado para adicionar um novo aluno no BD
  // @@entrada: um objeto do tipo Aluno com os dados e o id da turma em que será inserido o aluno recém cadastrado
  // @@retorno: retorna uma promise com a referência ao documento recem inserido
  adicionarAluno(aluno: Aluno, idTurma: any):Promise<any> {
    this.numero += 1
    let nomeTurma: string | undefined = aluno.id
    nomeTurma = nomeTurma?.split('-')[0]

    this.firebaseAngular.collection('Usuarios').doc().set({'nome':aluno.nome, 'email':aluno.email, 'id':nomeTurma})

    this.doRegister(aluno).then(()=>{
      console.log("o resetar senha está comentado")
      // this.Resetarsenha(aluno) <<<<<<<<<<<<<<<<<<<<<<<<<<
    })
    return this.firebaseAngular.collection('Turmas/' + idTurma + '/Alunos').add(aluno)
  }//adicionarAluno


  //função para fazer a exclusão do registro de um aluno de uma turma
  // @@entrada: id da turma que possui o registro do aluno e o id do aluno que será excluído
  // @@retorno: promise
  excluirAluno(idTurma: any, idAluno: string): Promise<any> {
    return this.firebaseAngular.collection('Turmas/' + idTurma + '/Alunos')
    .doc(idAluno)
    .delete()
  } //excluir aluno

  //Método criado para pegar alunos (get)
  // front
  mostrarAluno(aluno: Aluno) {
    this.edicaoAluno.next(aluno)
  }

  // Método criado para transformar em Observable
  // front
  // entrada:
  // retorno: Observable
  selecionarAluno(): Observable<Aluno> {
    return this.edicaoAluno.asObservable()
  }

  // função para editar o registro de um aluno no banco
  // entrada: id da turma que possui o aluno a ser editado. Id do aluno que será editado, objeto do aluno com as informações para serem atualizadas e o valor do email anterior a edição.
  // Esse email será comparado com o que está inserido dentro do objeto, se forem diferentes um novo auth deve ser gerado
  // retorno: Promise
  editarAluno(idTurma:string, idAluno: string, aluno: any, email:string): Promise<any> {
    //temos que verificar se o email foi trocado, caso sim temos que gerar outro autentication
    if(aluno.email != email){
      this.doRegister(aluno)
      this.Resetarsenha(aluno)
    }
    // this.firebaseAngular.collection('Turmas/'+parametro+'/Alunos')
    return this.firebaseAngular.collection('Turmas/'+idTurma+'/Alunos').doc(idAluno).update(aluno)
  }

  // Método referente ao MatSnackBar do Material, para mostrar mensagem quando as funções de CRUD funcionarem
  mensagem(msg: string): void {
    this.snackBar.open(msg, "X", {
      duration: 3000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ['cor-mensagem']
    })
  }//
}
