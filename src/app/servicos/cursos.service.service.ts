import { Curso } from './../shared/cursos';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';
import firebase from 'firebase/compat/app'
import 'firebase/compat/storage'
import { Aluno } from '../shared/alunos'
import { orderBy } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  // referência ao storage
  storageReference = firebase.app().storage().ref()

  constructor(private firebaseAng: AngularFirestore) { }

  // função para inserir no banco um novo curso
  // @@entrada: objeto do tipo curso
  // @@retorno: Promise
  inserirCurso(curso: Curso): Promise<any> {
    return this.firebaseAng.collection('Cursos').add(curso)
  }//inserirCurso

  // função para listar os todos os cursos do banco
  // @@entrada: nenhuma
  // @@retorno: Observable
  listarCursos(): Observable<any> {
    return this.firebaseAng.collection('Cursos').valueChanges({ idField: 'key' })
  }

  // funçao para deletar um curso. Deleta o curso e todas as informações que estão dentro
  // @@entrada: id do curso que será deletado
  // @@retorno: nenhum
  deletarCursos(keyCurso: any) {
    this.firebaseAng.collection('Cursos/' + keyCurso + '/Modulos').valueChanges({ idField: 'keyModulo' })
    .subscribe((modulos) => {
      modulos.forEach((modulo: any) => {
        this.firebaseAng.collection('Cursos/' + keyCurso + '/Modulos/' + modulo.keyModulo + '/Aulas').valueChanges({ idField: 'keyAula' })
          .subscribe((aulas) => {
            aulas.forEach((aula: any) => {
              this.firebaseAng.collection('Cursos/' + keyCurso + '/Modulos/' + modulo.keyModulo + '/Aulas').doc(aula.keyAula).delete()
            })
          })
          this.firebaseAng.collection('Cursos/' + keyCurso + '/Modulos/').doc(modulo.keyModulo).delete()
      })
    })
    this.firebaseAng.collection('Cursos').doc(keyCurso).delete()
  }

  // envia a imagem para o storage e retorna a url dessa imagem dentro do storage
  // @@entrada: nome da imagem que enviada ao storage
  // @@retorno: url da imagem dentro do storage
  async carregarImagem(nome: string, imgBase64: any) {
    try {
      let resultado = await this.storageReference.child("thumbsCursos/" + nome).putString(imgBase64, "data_url")
      // console.log("nome do caminho da imagem", resultado.ref.getDownloadURL())
      return await resultado.ref.getDownloadURL()
    } catch (error) {
      console.log("erro na imagem Storage", error)
      return this.storageReference.child("thumbsTurmas/" + "imagemPlaceHolder.png").getDownloadURL()
    }
  }//carregarImagem

  // atualiza os dados de um curso
  // @@entrada: objeto do curso do tipo curso e id do curso
  // @@retorno: Promise
  update(curso: Curso, keyCurso: any) {
    return this.firebaseAng.collection('Cursos').doc(keyCurso).update(curso)
  }

}
