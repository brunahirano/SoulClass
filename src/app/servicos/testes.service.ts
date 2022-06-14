import { orderBy } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Teste } from '../shared/teste';
import  firebase  from 'firebase/compat/app';
import 'firebase/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class TestesService {
  //referencia ao storage
  storageReference = firebase.app().storage().ref()

  // variaveis para controlar o funcionamento do front
  idTeste = ''
  tituloTeste = ''

  constructor(private firebaseAng: AngularFirestore) {}

  // função para criar um novo teste e vinculá-lo a um curso
  // @@entrada: objeto do tipo Teste contendo as informações do teste, id da turma e id do curso
  // @@retorno: Promise
  async criarTeste(modeloTeste: Teste, keyTurma:string, keyCurso:string):Promise<any> {
    return this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+"/Testes" ).add(modeloTeste)
  }//criarTurma

  // função para listar os testes vinculados a uma turma e um curso
  // @@entrada: id da turma e id do curso
  // @@retorno: Observable
  mostrarTeste(keyTurma:string, keyCurso:string):Observable<any>{
    return this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+"/Testes", ordem => ordem.orderBy("titulo"))
    .valueChanges({idField: "id"})
  }

  // função para converter o nome de um teste no seu id
  // @@entrada: titulo de um teste
  // @@saida: coloca o id do teste diretamente dentro da variavel idTeste
  async pegaKeyTeste(tituloTeste: string){
    await firebase.firestore().collection('Teste')
    .where('titulo', '==' , tituloTeste)
    .get()
    .then((snapshot)=>{
      snapshot.docs.forEach(element => {
        this.idTeste = element.id
      });
    })
  }//pegarKeyTeste

  // função para efetuar a exclusão de um teste que se encontra dentro de um curso. Essa deleção contempla as questões vinculadas a esse teste
  // @@entrada: id da turma, id do curso, id do teste
  // @@saida: nenhum
  excluirTeste(keyTurma:string, keyCurso:string, keyTeste:string){
    // listando as questoes que estão dentro desse teste
    this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+"/Testes/"+keyTeste+"/Questoes")
    .valueChanges({idField: 'idQuestao'})
    .subscribe((questoes)=>{
      // excluindo as questões
      questoes.forEach((questao:any)=>{
        this.firebaseAng.collection('Turmas/' + keyTurma+ '/Cursos/' + keyCurso + '/Testes/'+keyTeste+ "/Questoes")
        .doc(questao.idQuestao)
        .delete()
      })
    })
    // por fim, excluindo o teste
    this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+"/Testes").doc(keyTeste).delete()
  }//excluirTeste

  // realiza a atualização dos dados de um determinado teste
  // @@entrada: id da turma, id do curso, objeto contendo as informações que devem ser atualizadas sob o dado antigo que está armazenado no banco
  // @@saida: nenhuma
  editarTeste(keyTurma:string, keyCurso:string, teste:any){
    this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+"/Testes")
    .doc(teste.id)
    .update(teste)
  }//editarTeste

  // insere uma nova questão dentro da collection Questões que fica dentro do Curso
  // @@entrada: id da turma, id do curso, id do teste, objeto contendo a questao
  // @@saida: Promise
  criarQuestao(keyTurma: any, keyCurso: any, keyTeste: any, questao: any):Promise<any> {
    return this.firebaseAng.collection("Turmas/"+keyTurma+"/Cursos/"+keyCurso+"/Testes/"+keyTeste+ '/Questoes')
    .add(questao)
  }//criarQuestao

  // exibe as questões que estão inseridas dentro de um teste
  // @@entrada: id da turma, id do curso, id do teste
  // @@saida: Observable contendo uma lista com as questões daquele teste
  mostrarQuestoes(keyTurma: any, keyCurso: any, keyTeste: any):Observable<any>{
    return this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+'/Testes/'+keyTeste+ '/Questoes')
    .valueChanges({idField: 'idQuestao'})
  }//mostrarQuestoes

  // exibe as questões que estão inseridas dentro de um teste
  // @@entrada: id da turma, id do curso, id do teste
  // @@saida: Observable contendo uma lista com as questões daquele teste
  mostrarQuestoesCSVverificacao(keyTurma: any, keyCurso: any, keyTeste: any):Observable<any>{
    return this.firebaseAng.collection('Turmas/'+keyTurma+'/Cursos/'+keyCurso+'/Testes/'+keyTeste+ '/Questoes').valueChanges({idField: 'idQuestao'})
  }//mostrarQuestoesCSVverificacao

  // realiza a atualização dos dados de uma determinada questão
  // @@entrada: id da turma, id do curso, id do teste, id da questao e objeto com a questão que deve ter suas informações que devem ser atualizadas sob o dado antigo que está armazenado no banco
  // @@saida: nenhuma
  editarQuestao(idTurma: any, idCurso: any, idTeste: any ,idQuestao: any, questao: any){
    return this.firebaseAng.collection('Turmas/'+idTurma+'/Cursos/'+idCurso+'/Testes/'+idTeste+'/Questoes').doc(idQuestao).set(questao)
  }//editarQuestao

  // realiza exclusão do dados de uma determinada questão
  // @@entrada: id da turma, id do curso, id da questao e id do teste.
  // @@saida: Promise
  excluirQuestao(idTurma: any, idCurso: any ,idQuestao: any, idTeste: any):Promise<any> {
    return this.firebaseAng.collection('Turmas/'+idTurma+'/Cursos/'+idCurso+'/Testes/'+idTeste+ '/Questoes').doc(idQuestao).delete()
  }//excluirQuestao
}//classe
