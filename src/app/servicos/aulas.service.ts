import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage'
import { Aula } from 'src/app/shared/aula';
import { orderBy } from 'firebase/firestore';
import 'firebase/compat/storage';


@Injectable({
  providedIn: 'root'
})
export class AulasService {
  // referencia ao banco
  storageReference = firebase.app().storage().ref()

  constructor(private firebaseAngular: AngularFirestore) {
  }

  // função para adicionar uma aula dentro de uma collection dentro de um modulo
  // entrada o id do documento do Curso, e o id do documento do do Modulo
  // @@entrada: id do Modulo que receberá a aula, id do curso que possui o modulo e objeto do tipo Aula que contém os dados que devem ser persistidos no banco
  // @@retorno: Promise
  AdicionaAula(keyModulo: string, keyCurso: string, aula:Aula){

    const AULA = {
      index: aula.index,
      keyAula: aula.keyAula,
      link:aula.link,
      nome:aula.nome,
      tipo: aula.tipo,
      dataCriacao: aula.dataCriacao,
      dataModificacao: aula.dataModificacao
    }
    return this.firebaseAngular.collection("Cursos/" + keyCurso + "/Modulos/" + keyModulo + "/Aulas").add(AULA)
  }//AdicionarAula

  // lista todas as aulas que existem dentro de um modulo
  // @@entrada: id do curso que contem o modulo, id do modulo que contém as aulas
  // @@retorno: Observable
  listarConteudo(keyCurso: any, keyModulo: any):Observable<any> {
    return this.firebaseAngular.collection('Cursos/'+keyCurso+'/Modulos/'+keyModulo+'/Aulas', ordem => ordem.orderBy("index")).valueChanges({idField: 'keyAula'})
  }

  // função que reoganiza um lista de indices. Essa organização se dá da seguinte forma: é indicado a posição em que um novo elemento será inserido, então todos os objetos que possuírem indices com valor igual ou maior (menor no caso seja uma organização de deleção) devem ser ajustados, seja aumentando (decrementando, caso deleção) 1.
  // @@entrada: id do curso, id do modulo, indice a partir do qual deve se propagar os incrementos ou decrementos, vetor contendo os elementos e o valor que deve ser ajustado (+1 uma nova adição será realizada, -1 uma deleção será realizada)
  // @@saida: Promise
  organiza(keyCurso:string, keyModulo:string, index:number, vetorAulas: any, valor:number):Promise<any>{
    // percorrendo todos os objetos e ajustando os indices
    vetorAulas.forEach((e:any) => {
      if(e.index >= index){
        e.index += valor
        // salvando as alterações no banco
        this.firebaseAngular.collection("Cursos/"+keyCurso+"/Modulos/" + keyModulo + "/Aulas/").doc(e.keyAula).update(e)
      }
    });
    return new Promise((resolve, reject) => {
      resolve(true)
      reject("erro na organização dos modulos")
    })
  }//organiza

  // função para excluir uma aula
  // @@entrada: id do curso, id do modulo, id da aula
  // @@retorno: nenhuma
  excluirAula(keyCurso: any, keyModulo: any, keyAula: any){
    this.firebaseAngular.collection('Cursos/'+keyCurso+'/Modulos/'+keyModulo+'/Aulas').doc(keyAula).delete()
  }//excluirAula

  // faz a submissão do arquivo para o storage
  // @@entrada: nome do arquivo, formato da codificação do arquivo
  // @@retorno: Promise<string> contendo a url de onde o documento está no storage
  async carregarAula(nome:string, imgBase64:any){
    try{
      let resultado = await this.storageReference.child("thumbsAulas/" + nome).putString(imgBase64, "data_url")
      // console.log("nome do caminho da imagem", resultado.ref.getDownloadURL())
      return await resultado.ref.getDownloadURL()
    }catch(error){
      console.log("erro na imagem Storage", error)
      return this.storageReference.child("thumbsTurmas/" + "imagemPlaceHolder.png").getDownloadURL()
    }
  }//carregarImagem
}//classe
