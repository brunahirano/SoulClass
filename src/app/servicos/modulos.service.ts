import { orderBy } from 'firebase/firestore';
import { Modulo } from 'src/app/shared/modulo';
import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';

import  firebase  from 'firebase/compat/app';
import 'firebase/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class ModulosService {

  // variavel para guardar o nome do curso em que a página está mirada
  nomeCurso=""

  constructor( private firebaseAng: AngularFirestore) { }

  // função para adicionar um modulo dentro de um curso
  // @@entrada: id do curso e objeto do modulo contendo os dados a serem inseridos
  // @@retorno: nenhuma
  adicionarModulo(keyCurso:string, modulo:Modulo){
    this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos").add(modulo)
  }//adicionarModulo

  // função para listar todos os modulo dentro de um curso
  // @@entrada: id do curso cujos modulos devem ser listados
  // @@retorno: nenhuma
  listarModulos(keyCurso:string):Observable<any>{
    return this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos",ordem => ordem.orderBy("index")).valueChanges({idField:"keyModulo"})
  }//listarModulos


  // função para pegar o nome do curso mediante o seu id
  // @@entrada: id do curso
  // @@retorno: Promise
  async pegarNomeCurso(keyCurso:string){
    await firebase.firestore().collection("Cursos").where(firebase.firestore.FieldPath.documentId(), '==' , keyCurso).get().then((snapshot)=>{
      snapshot.docs.forEach(doc=>{
        this.nomeCurso = doc.data()['nome']
      })
    })
  }//pegarNomeCurso

  // função que reoganiza um lista de indices. Essa organização se dá da seguinte forma: é indicado a posição em que um novo elemento será inserido, então todos os objetos que possuírem indices com valor igual ou maior (menor no caso seja uma organização de deleção) devem ser ajustados, seja aumentando (decrementando, caso deleção) 1.
  // @@entrada: id do curso, indice a partir do qual deve se propagar os incrementos ou decrementos, id do modulo, vetor contendo os elementos e o valor que deve ser ajustado (+1 uma nova adição será realizada, -1 uma deleção será realizada)
  // @@saida: Promise
  organiza(keyCurso:string, index:number, vetorModulos: any, valor:number):Promise<any>{
      vetorModulos.forEach((e:any) => {
        if(e.index >= index){
          e.index += valor
          this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos").doc(e.keyModulo).update(e)
        }
      });
      return new Promise((resolve, reject) => {
        resolve(true)
        reject("erro na organização dos modulos")
      })
  }//organiza

  // função para editar um modulo
  // @@entrada: id do curso, objeto contendo as informações que deve ser inseridas no banco, id do modulo que será atualizado
  // @@retorno: nenhuma
  editarModulo(keyCurso:string, moduloEditado:any, moduloKey:string){
    this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos")
    .doc(moduloKey)
    .update(moduloEditado)
  }//editarModulo

  // função para excluir um modulo e todas as aulas que estão dentro
  // @@entrada: id do modulo que será excluído, index do modulo que será excluído, id do curso, vetor com os modulos daquele curso (terão seus index atualizados), valor que deve ser utilizado para ajustar os index (-1 pq é deleção)
  // @@retorno: nenhum
  excluirModulo(keyModulo: string, index:any, keyCurso: string, vetorModulos: any, valor:number){
    // ajustando os indices para que fiquem em ordem quando a deleção do objeto ocorrer
    this.organiza(keyCurso, index, vetorModulos, valor).then(()=>{
      // deletando o modulo
      this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos")
      .doc(keyModulo)
      .delete()
      .then(()=>{
        // listando as aulas para exclusão
        this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos/"+keyModulo+"/Aulas")
        .valueChanges({idField:"keyAula"})
        .subscribe((e)=>{
          e.forEach(element => {
            this.firebaseAng.collection("Cursos/"+keyCurso+"/Modulos/"+keyModulo+"/Aulas")
            .doc(element.keyAula)
            .delete()
          });
        })
      })
    })
  }//excluirModulo

  // função para atualizar os dados de uma aula no banco de dados
  // @@entrada: objeto da aula, id do curso, objeto do modelo e id da aula
  // @@retorno: Promise
  updateAula(Aula:any, keyCurso: string, moduloEdit:any, keyAula:any):Promise<any>{
    return this.firebaseAng.collection("Cursos/"+ keyCurso + "/Modulos/" + moduloEdit.keyModulo + "/Aulas").doc(keyAula).update(Aula)
  }//updateAula
}//clase
