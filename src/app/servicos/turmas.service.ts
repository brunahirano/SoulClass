import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';
import { Turma } from '../shared/turmas';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { environment } from 'src/environments/environment';
import { DocumentReference } from 'firebase/firestore';
import { url } from 'inspector';



@Injectable({
  providedIn: 'root'
})
export class TurmasService {
  // é a referencia ao storage que armazenará as fotos
  storageReference = firebase.app().storage().ref()

  numero: number
  turmas: Turma[] = []

  //vetores para armazenar Collections
  vetorAlunos: any
  vetorCursos: any

  imgPlaceHolder: string

  // variaveis para pesquisa
  nomeTurma = ""
  idTurma = ""
  keyAluno = ""

  constructor(private firebaseAng: AngularFirestore) {
    this.numero = 0
    this.vetorAlunos = Array()
    this.vetorCursos = Array()
    this.imgPlaceHolder = ""
    this.carregaImgPlaceHolder()
  }//constructor

  //cria a turma na collection de turmas a partir do parâmetro modeloTurma preenchido em formulário
  async criarTurma(modeloTurma: Turma): Promise<any> {
    this.numero += 1
    console.log(modeloTurma)
    return this.firebaseAng.collection('Turmas').add(modeloTurma)
  }//criarTurma

  //Lista todas as turmas da collection Turmas no componente cards-turmas
  listarTurmas(): Observable<any> {
    return this.firebaseAng.collection("Turmas", ordem => ordem.orderBy("nome")).valueChanges({ idField: "id" })
  }//listarTurmas

  // listar os alunos que existem dentro da collection Alunos dentro do 'documento' de uma Turma
  // entrada
  listarAlunosTurma(nomeBanco: string): Observable<any> {
    // console.log(nomeBanco)
    this.vetorAlunos = this.firebaseAng.collection('Turmas/' + nomeBanco + '/Alunos', ordem => ordem.orderBy("nome")).valueChanges({ idField: "key" })
    return this.vetorAlunos
  }//listarAlunosTurma

  // listar os Cursos que existem dentro da collection Cursos dentro do 'documento' de uma Turma
  // entrada
  listarCursosTurma(keyTurma: string): Observable<any> {
    // console.log(nomeBanco)
    this.vetorCursos = this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos').valueChanges({ idField: "key" })
    return this.vetorCursos
  }//listarCursosTurma

  // função para pegar o id aleatório do documento no banco dado o nome de uma turma
  async pegaNomeTurma(id: string) {
    console.log("id turma", id)
    await firebase.firestore().collection('Turmas').where(firebase.firestore.FieldPath.documentId(), '==', id).get().then((snapshot) => {
      // console.log("snapshot",snapshot)
      snapshot.docs.forEach(doc => {
        // console.log(doc.data()['nome'])
        this.nomeTurma = doc.data()['nome']
        // console.log("service-nometurma", this.nomeTurma)
      })
    })
    // return this.firebaseAng.collection('Turmas').doc(id).get()
  }//pegaNomeTurma

  // função para retornar o id do documento da turma no banco mediante o valor do seu campo nome
  async pegaKeyTurma(nomeTurma: string) {
    await firebase.firestore().collection('Turmas').where('nome', '==', nomeTurma).get().then((snapshot) => {
      snapshot.docs.forEach(element => {
        console.log("snapshot", element.id)
        this.idTurma = element.id
        return
      });
    })
  }//pegarKeyTurma


  //Função que edita turma passando modificações através de modeloTurma(variavel preenchida em modal de edição no componente cards-turma)
  turmaEdit(modeloTurma: any): Promise<any> {
    return this.firebaseAng.collection('Turmas').doc(this.idTurma).update(modeloTurma)
  }

  // Mateus: Através de diversos forEach's encadeados, a turma é excluida, assim como todas subcoleções e docimentos aninhados
  excluirTurma(id: string) {
    this.firebaseAng.collection('Turmas/' + id + '/Cursos').valueChanges({ idField: 'keyCurso' })
      .subscribe((cursos) => {
        cursos.forEach((curso: any) => {
          this.firebaseAng.collection('Turmas/' + id + '/Cursos/' + curso.keyCurso + '/Modulos').valueChanges({ idField: 'keyModulo' }).subscribe((modulos) => {
            modulos.forEach((modulo: any) => {
              this.firebaseAng.collection('Turmas/' + id + '/Cursos/' + curso.keyCurso + '/Modulos/' + modulo.keyModulo + '/Aulas').valueChanges({ idField: 'keyAula' }).subscribe((aulas) => {
                aulas.forEach((aula: any) => {
                  this.firebaseAng.collection('Turmas/' + id + '/Cursos/' + curso.keyCurso + '/Modulos/' + modulo.keyModulo + '/Aulas').doc(aula.keyAula).delete()
                })
              })
              this.firebaseAng.collection('Turmas/' + id + '/Cursos/' + curso.keyCurso + '/Modulos/').doc(modulo.keyModulo).delete()
            })
            // excluir os testes
            // pegando cada documento da collection de teste
            this.firebaseAng.collection('Turmas/' + id+ '/Cursos/' + curso.keyCurso + '/Testes').valueChanges({idField: 'keyTeste'})
            .subscribe((Testes) => {
              // pegando cada documento da collection de questão
              Testes.forEach((Teste:any) => {
                this.firebaseAng.collection('Turmas/' + id + '/Cursos/' + curso.keyCurso + '/Testes/'+Teste.keyTeste+ "/Questoes")
                .valueChanges({idField: 'keyQuestao'})
                .subscribe((questoes)=>{
                  // acessando cada questão para excluir
                  questoes.forEach((questao:any)=>{
                    this.firebaseAng.collection('Turmas/' + id+ '/Cursos/' + curso.keyCurso + '/Testes/'+Teste.keyTeste+ "/Questoes")
                    .doc(questao.keyQuestao)
                    .delete()
                  })
                  this.firebaseAng.collection('Turmas/' + id + '/Cursos/' + curso.keyCurso + '/Testes')
                    .doc(Teste.keyTeste)
                    .delete()
                  })
                })

            })//percorrendo os testes
          })
          // excluindo o curso por final
          this.firebaseAng.collection('Turmas/' + id + '/Cursos/').doc(curso.keyCurso).delete()
        })


        this.firebaseAng.collection('Turmas').doc(id).delete().then(() => {
          this.listarAlunosTurma(id).subscribe(result => {
            result.forEach((e: any) => {
              this.firebaseAng.collection('Turmas/' + id + '/Alunos').doc(e.key).delete()
            })
            console.log(result)
          })

        })
      })
  }//excluirTurma

  //Método para excluir todos alunos dentro da subcoletion de uma turma, passando como parametro o id aleatório da turma e o vetor de alunos a serem excluidos(é passado o vetor da listagem de TODOS os alunos ao iniciar o componente conteudo-turma)
  excluirAlunosTurma(id: string, vetorAlunosTurma:Array<any>) {

    vetorAlunosTurma.forEach((e: any) => {
        // console.log("pessoas", e)
        this.firebaseAng.collection('Turmas/' + id + '/Alunos').doc(e.key).delete();
        console.log("excluiu o " ,e )
      })


  }//excluirAlunosTurma

  // função para fazer a conversao da imagem para base64 e retorna o link para a imagem upada
  // que estará dentro do storage
  async carregarImagem(nome: string, imgBase64: any) {
    try {
      let resultado = await this.storageReference.child("thumbsTurmas/" + nome).putString(imgBase64, "data_url")
      // console.log("nome do caminho da imagem", resultado.ref.getDownloadURL())
      return await resultado.ref.getDownloadURL()
    } catch (error) {
      console.log("erro na imagem Storage", error)
      return this.storageReference.child("thumbsTurmas/" + "imagemPlaceHolder.png").getDownloadURL()
    }
  }//carregarImagem

  //Função que pega a URL da "imagemPlaceHolder.png" no banco de dados e atribui a variavel "imgPlaceHolder"
  carregaImgPlaceHolder() {
    this.storageReference.child("thumbsTurmas/" + "imagemPlaceHolder.png").getDownloadURL().then(resultado => {
      this.imgPlaceHolder = resultado
    })
  }//carregaImgPlaceHolder

  // A partir da URL de um documento armazenado no storage, faz a deleção do mesmo
  excluirDadoStorage(urlImg: string) {
    if (urlImg == "" || urlImg == '../../assets/img/fotoPadrao.png') {

    }
    else {
      console.log("excluindo dado do storage")
      console.log(urlImg)
      this.storageReference.storage.refFromURL(urlImg).delete()
    }

  }//excluirDadoStorage
}
