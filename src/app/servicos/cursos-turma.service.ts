import { Aula } from './../shared/aula';
import { Observable } from 'rxjs';
import { Modulo } from 'src/app/shared/modulo';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';

import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class CursosTurmaService {
  nomeCurso = '';
  vetorCursos: any;

  constructor(private firebaseAng: AngularFirestore) {}

  // função para adcionar um modulo a um curso
  // @@entrada: id da turma, id do curso, objeto do modulo do tipo Modulo que contém as informações que serão enviadas ao banco
  // @@retorno: nenhum
  adicionarModulo(keyTurma: string, keyCurso: string, modulo: Modulo) {
    this.firebaseAng
      .collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos')
      .add(modulo);
  }//adicionarModulo

  // função para encontrar o nome da turma, dado os ids de seus "pais"
  // @@entrada: id da turma e id do curso
  // @@saida: coloca na variavel nomeCurso o nome da turma
  async pegarNomeCurso(keyTurma: string, keyCurso: string) {
    await firebase
      .firestore()
      .collection('Turmas/' + keyTurma + '/Cursos')
      .where(firebase.firestore.FieldPath.documentId(), '==', keyCurso)
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          this.nomeCurso = doc.data()['nome'];
        });
      });
  }//pegarNomeCurso

  // função que reoganiza um lista de indices. Essa organização se dá da seguinte forma: é indicado a posição em que um novo elemento será inserido, então todos os objetos que possuírem indices com valor igual ou maior (menor no caso seja uma organização de deleção) devem ser ajustados, seja aumentando (decrementando, caso deleção) 1.
  // @@entrada: id do curso, id do modulo, indice a partir do qual deve se propagar os incrementos ou decrementos, vetor contendo os elementos e o valor que deve ser ajustado (+1 uma nova adição será realizada, -1 uma deleção será realizada)
  // @@saida: Promise
  organizaModulo(
    keyTurma: string,
    keyCurso: string,
    index: number,
    vetorModulos: any,
    valor: number
  ): Promise<any> {
    vetorModulos.forEach((e: any) => {
      if (e.index >= index) {
        console.log('e', e);
        e.index += valor;
        this.firebaseAng
          .collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos')
          .doc(e.keyModulo)
          .update(e);
      }
    });
    return new Promise((resolve, reject) => {
      resolve(true);
      reject('erro na organização dos modulos');
    });
  }//organizaModulo

  // função que reoganiza um lista de indices. Essa organização se dá da seguinte forma: é indicado a posição em que um novo elemento será inserido, então todos os objetos que possuírem indices com valor igual ou maior (menor no caso seja uma organização de deleção) devem ser ajustados, seja aumentando (decrementando, caso deleção) 1.
  // @@entrada: id do curso, id do modulo, indice a partir do qual deve se propagar os incrementos ou decrementos, vetor contendo os elementos e o valor que deve ser ajustado (+1 uma nova adição será realizada, -1 uma deleção será realizada)
  // @@saida: Promise
  organizaAula(
    keyTurma: string,
    keyCurso: string,
    keyModulo: string,
    index: number,
    vetorAulas: any,
    valor: number
  ): Promise<any> {
    vetorAulas.forEach((e: any) => {
      if (e.index >= index) {
        console.log('e', e);
        e.index += valor;
        this.firebaseAng
          .collection(
            'Turmas/' +
              keyTurma +
              '/Cursos/' +
              keyCurso +
              '/Modulos/' +
              keyModulo +
              '/Aulas/'
          )
          .doc(e.keyAula)
          .update(e);
      }
    });
    return new Promise((resolve, reject) => {
      resolve(true);
      reject('erro na organização dos modulos');
    });
  }//organizaAula

  // função para fazer a alteração dos dados do modulo no banco de dados
  // @@entrada: id da turma, id do curso, objeto do modulo contendo os dados do modulo para serem atualizados no banco e id do modulo
  // @@saida: nenhuma
  editarModulo(
    keyTurma: string,
    keyCurso: string,
    moduloEditado: any,
    moduloKey: string
  ) {
    this.firebaseAng
      .collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos')
      .doc(moduloKey)
      .update(moduloEditado);
  }//editarModulo

  // função para excluir o modulo do banco de dados
  // @@entrada: id da turma, id do modulo, indice do modulo, id do curso, vetor contendo os modulos e valor do decremento
  // @@saida: nenhum
  excluirModulo(
    keyTurma: string,
    keyModulo: string,
    index: any,
    keyCurso: string,
    vetorModulos: any,
    valor: number
  ) {
    this.organizaModulo(keyTurma, keyCurso, index, vetorModulos, valor).then(
      () => {
        this.firebaseAng
          .collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos')
          .doc(keyModulo)
          .delete()
          .then(() => {
            this.firebaseAng
              .collection(
                'Turmas/' +
                  keyTurma +
                  '/Cursos/' +
                  keyCurso +
                  '/Modulos/' +
                  keyModulo +
                  '/Aulas'
              )
              .valueChanges({ idField: 'keyAula' })
              .subscribe((e) => {
                e.forEach((element) => {
                  this.firebaseAng
                    .collection(
                      'Turmas/' +
                        keyTurma +
                        '/Cursos/' +
                        keyCurso +
                        '/Modulos/' +
                        keyModulo +
                        '/Aulas'
                    )
                    .doc(element.keyAula)
                    .delete();
                });
              });
          });
      }
    );
  } //excluirModulo

  // função para fazer a atualização dos dados de uma aula
  // @@entrada: id da turma, objeto com os dados da aula, id do curso, objeto com os dados do modulo, id da aula
  // @@retorno: Promise
  updateAula(
    keyTurma: string,
    Aula: any,
    keyCurso: string,
    moduloEdit: any,
    keyAula: any
  ): Promise<any> {
    console.log('dando update');
    console.log('keyAula', keyAula);
    return this.firebaseAng
      .collection(
        'Turmas/' +
          keyTurma +
          '/Cursos/' +
          keyCurso +
          '/Modulos/' +
          moduloEdit.keyModulo +
          '/Aulas'
      )
      .doc(keyAula)
      .update(Aula);
  }//updateAula

  // adiciona uma aula dentro de um modulo
  // @@entrada: id da turma, id do modulo, id do curso, objeto do tipo aula contendo os dados da aula que será adicionada
  // @@retorno: Promise
  AdicionarAula(
    keyTurma: string,
    keyModulo: string,
    keyCurso: string,
    aula: Aula
  ) {
    const AULA = {
      index: aula.index,
      keyAula: aula.keyAula,
      link: aula.link,
      nome: aula.nome,
      tipo: aula.tipo,
      dataCriacao: aula.dataCriacao,
      dataModificacao: aula.dataModificacao,
    };
    console.log('aula', aula);
    return this.firebaseAng
      .collection(
        'Turmas/' +
          keyTurma +
          '/Cursos/' +
          keyCurso +
          '/Modulos/' +
          keyModulo +
          '/Aulas'
      )
      .add(AULA);
  }//AdicionarAula

  // função para excluir uma aula do banco de dados
  // @@entrada: id da turma, id do curso, id do modulo, id da aula
  // @@saida: nenhuma
  excluirAula(keyTurma: any, keyCurso: any, keyModulo: any, keyAula: any) {
    this.firebaseAng
      .collection(
        'Turmas/' +
          keyTurma +
          '/Cursos/' +
          keyCurso +
          '/Modulos/' +
          keyModulo +
          '/Aulas'
      )
      .doc(keyAula)
      .delete();
  }//excluirAula

  // lista todas as aulas que existem dentro de um modulo
  // @@entrada: id do curso que contem o modulo, id do modulo que contém as aulas
  // @@retorno: Observable
  listarConteudo(
    keyTurma: string,
    keyCurso: any,
    keyModulo: any
  ): Observable<any> {
    return this.firebaseAng
      .collection(
        'Turmas/' +
          keyTurma +
          '/Cursos/' +
          keyCurso +
          '/Modulos/' +
          keyModulo +
          '/Aulas',
        (ordem) => ordem.orderBy('index')
      )
      .valueChanges({ idField: 'keyAula' });
  }//listarConteudo

  //procura um curso no banco e retorna a referência desse, caso encontre
  // @@entrada: id do curso
  // @@retorno: Promise
  async procurarCurso(keyCurso: string, keyTurma: string): Promise<any> {
    return await firebase
      .firestore()
      .collection('Cursos')
      .where(firebase.firestore.FieldPath.documentId(), '==', keyCurso)
      .get();
  }//procurarCurso

  // função que lista todos os modulos de um determinado curso
  // @@entrada: id do curso
  // @@retorno: Observable
  procurarModulo(idCurso: string):Observable<any>{
    return this.firebaseAng.collection('Cursos/'+idCurso+'/Modulos')
    .valueChanges({idField: 'idModulo'})
  }//procurarCurso

  // função que lista todas as aulas de um determinado módulo
  // @@entrada: id do curso, id do módulo
  // @@retorno: Observable
  procurarAulas(idCurso: any, idModulo: any):Observable<any>{
    return this.firebaseAng.collection("Cursos/" +idCurso+ "/Modulos/" + idModulo + "/Aulas")
    .valueChanges({idField:"keyAula"})
  }//procurarCurso

  // função adiciona um novo curso a uma turma
  // @@entrada: id da turma, id do documento (gerado manualmente), objeto do documento contendo as informações
  // @@retorno: Promise
  adicionarCurso(keyTurma: any, docKey:any, doc: any): Promise<any> {
    return this.firebaseAng.collection("Turmas/" + keyTurma + "/Cursos")
    .doc(docKey)
    .set(doc)
  }//adicionarCurso

  // função para listar os cursos de uma turma
  // @@entrada: id da turma
  // @@retorno: Promise
  listarCursos(keyTurma: any):Observable<any> {
    return this.firebaseAng.collection("Turmas/" + keyTurma + "/Cursos")
    .valueChanges({idField: 'idCurso'})
  }//listarCursos

  // função para listar os módulos de um curso
  // @@entrada: id da turma, id do curso
  // @@retorno: Promise
  listarModulos(keyTurma: any, keyCurso: any):Observable<any> {
    return this.firebaseAng.collection("Turmas/" + keyTurma+ '/Cursos/'+keyCurso+'/Modulos',
    (ordem) => ordem.orderBy('index'))
    .valueChanges({idField: 'keyModulo'})
  }//listarModulos

  // função para adicionar um modulo dentro de uma turma
  // @@entrada: id da turma, id do curso, id do modulo, objeto do modulo
  // @@retorno: Promise
  async adicionarModulos(keyTurma: any, idCurso: any, idModulo:any , modulo: any):Promise<any>{
     return await this.firebaseAng.collection("Turmas/" + keyTurma + "/Cursos/" +idCurso +'/Modulos')
    .doc(idModulo)
    .set(modulo)
  }//adicionarModulos

  // função para adicionar aula dentro de um modulo
  // @@entrada: id da turma, id do curso, id do modulo, objeto da aula
  // @@retorno: Promise
  adicionarAulas(keyTurma: any, idCurso: any, idModulo: any, aula: any):Promise<any>{
    return this.firebaseAng.collection("Turmas/" + keyTurma + "/Cursos/" +idCurso+ "/Modulos/"+ idModulo + "/Aulas")
    .add(aula)
  }//adicionarAulas

  // função que faz a procura das aulas e as adiciona dentro do modulo já criado e enviado por parâmetro
  // @@entrada: id da turma, id do curso, id do modulo, id do curso de origem, id do modulo de origem
  // @@saida: adiciona no modulo dentro da turma as aulas presentes no curso
  // @@retorno: nenhum
  fun(idTurma:string, idCurso:string, idModulo:string, idCursoPadrao:string, idModuloPadrao:string){
    let arrayAulasIndex:any = []
    this.procurarAulas(idCursoPadrao, idModuloPadrao).subscribe((aulas)=>{
      aulas.forEach((element:any)=> {
        if(arrayAulasIndex.includes(element.index) == false){
          arrayAulasIndex.push(element.index)
          this.firebaseAng.collection("Turmas/"+idTurma+"/Cursos/"+idCurso +"/Modulos/"+idModulo+"/Aulas").add(element)
        }
      });
    })
  }//fun

  // função para gerar uma key aleatoria
  // @@entrada: numero que diz o tamanho da que a cadeia aleatoria deve ter
  // @@retorno: uma string aleatoria com o tamanho dadona entrada
  randomString (strLength:number) {
    var result = [];
    strLength = strLength || 20;
    let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    while (--strLength) {
        result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    }
    return result.join('');
  }//randomString


  // função para deletar o curso e consequentemente os modulos, as aulas e os testes que estão dentro/vinculados
  // @@entrada: id da turma e id do curso
  // @@saida: nenhum
  deletarCursos(keyTurma: any, keyCurso: any) {
    this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos')
    .valueChanges({ idField: 'keyModulo' })
    .subscribe((modulos) => {
      modulos.forEach((modulo: any) => {
        this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos/' + modulo.keyModulo + '/Aulas')
        .valueChanges({ idField: 'keyAula' })
        .subscribe((aulas) => {
            aulas.forEach((aula: any) => {
              this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos/' + modulo.keyModulo + '/Aulas')
              .doc(aula.keyAula)
              .delete()
            })
          })
          this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Modulos/')
          .doc(modulo.keyModulo)
          .delete()
      })
    }) //exclusao do modulos

    // deletando os testes vinculados à turma
    this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Testes').valueChanges({idField: 'keyTeste'})
    .subscribe((Testes) => {
        Testes.forEach((Teste:any) => {
          this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Testes/'+Teste.keyTeste+ "/Questoes")
          .valueChanges({idField: 'keyQuestao'})
          .subscribe((questoes)=>{
            questoes.forEach((questao:any)=>{
              this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Testes/'+Teste.keyTeste+ "/Questoes")
              .doc(questao.keyQuestao).delete()
            })
          })
          this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/' + keyCurso + '/Testes')
          .doc(Teste.keyTeste)
          .delete()
        })
    })

    this.firebaseAng.collection('Turmas/' + keyTurma + '/Cursos/').doc(keyCurso).delete()
  }//deletarCursos

}//classe
