import { LoginService } from '../../servicos/login.service';
import { CursosTurmaService } from '../../servicos/cursos-turma.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Aluno } from '../../shared/alunos';
import { AlunosService } from '../../servicos/alunos.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TurmasService } from 'src/app/servicos/turmas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { NgbModal, ModalDismissReasons, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { Curso } from 'src/app/shared/cursos';
import { CursosService } from 'src/app/servicos/cursos.service.service';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { tap } from 'rxjs';

@Component({
  selector: 'app-conteudo-turma',
  templateUrl: './conteudo-turma.html',
  styleUrls: ['./conteudo-turma.component.css'],
})

export class ConteudoTurmaComponent implements OnInit {
  // variável ara mat-table
  displayedColumns: string[] = [
    'nome',
    'email',
    'key',
  ];
  displayedColumns2: string[] = [
    'nome',
    'descricao',
    'key',
  ];
  //variavel para armazenar os alunos na tabela
  tabelaAlunos: any;

  //variavel para armazenar os cursos na tabela
  tabelaCursos: any;

  //variavel do form, para trazer os dados proveninentes do formulario
  form: FormGroup;
  formAddCurso: FormGroup;

  //guarda a matrícula do aluno, usada para controlar se ocorrerá uma edição ou adição
  id: string | undefined;

  // array para guardar os alunos da turma que está sendo mostrada no momento
  alunosTurma: Aluno[] = [];

  // array para guardar os alunos da turma que está sendo mostrada no momento
  cursosTurma: Curso[] = [];

  //front
  botao: string = 'Cadastrar'; //******************** */

  // array para guardar os alunos da turma que está sendo mostrada no momento
  listaAlunos: any = [];

  //front
  closeResult = '';

  //variavel para guardar os registros proveninentes do
  csvRecords: any;

  // variavel para guardar o nome da turma que está sendo exibida
  nomeTurma = '';

  // variavel que armazena a key da turma que vem pela url
  params='';

  // variavel que armazena todos os cursos da turma focada na página
  arrayCurso: any;

  // usado para armazenar os cursos presentes no banco
  cursos: Curso[] = [];

  // paginator
  @ViewChild("paginatorAluno") paginatorAluno!: MatPaginator;
  @ViewChild("paginatorCurso") paginatorCurso!: MatPaginator;
  // estabelecendo breakpoint do paginator
  bpPaginator: boolean = false;

  // var para checar se o email será trocado durante a edição
  emailTroca = '';
  // objeto de quem apertou pra editar
  keyAluno = '';

  // sidebar
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  // front
  control = new FormControl();

  constructor(
    private alunoService: AlunosService,
    private fb: FormBuilder,
    private turmasService: TurmasService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private papa: Papa,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private cursoService: CursosService,
    private cursosTurmaService: CursosTurmaService, private observer: BreakpointObserver,
    private loginservice: LoginService
  ) {
    // inicializando as variáveis
    this.csvRecords = Array();
    this.arrayCurso = new Array();

    // validação do formulário
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });

    // validação do formulário
    this.formAddCurso = this.fb.group({
      checkbox: ['', [Validators.required]],
    });

    config.keyboard = false;
  } //constructor


  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.params['turma'];

    this.alunoService.selecionarAluno().subscribe((resultado) => {
      console.log('resultado', resultado);
      this.id = resultado.id;
      this.keyAluno = resultado.key;
      this.form.patchValue({
        nome: resultado.nome,
        email: resultado.email,
      });
      this.botao = 'Editar';
    });

    // pegando o id da turma passado pela url
    this.params = this.activatedRoute.snapshot.params['turma'];

    // pegando qual o nome da turma em função do id na url
    this.turmasService.pegaNomeTurma(this.params).then(() => {
      this.nomeTurma = this.turmasService.nomeTurma;
      // console.log('listar-alunosTurmaComponent', this.nomeTurma);
    });

    // função para testar se o banco já existe (deixar comentada)
    // TESTAR
    // this.verificaBanco(this.params);


    // traz a lista de alunos passando como parametro o id da turma "this.params"
    this.listarAlunosTurma(this.params);

    //testando se o parametro existe
    // traz a lista de cursos passando como parametro a turma "this.params"
    this.listarCursosTurma(this.params);

    // pegando a key da turma
    // inicia a variável idTurma no turmas.service, essa variável marca ql o nome da turma que está sendo visualizada no momento, querendo ou não é meio inutil pq nós já temos isso no this.params
    // caso queira remover tem que verificar e trocar os idTurma pelo params
    //********************  VERIFICAR FUNÇÃO ***************** */
    this.turmasService.pegaKeyTurma(this.params);
    // console.log("o componente listar-alunos foi chamado")
    // ***************************************************

    // lista os cursos anexados à turma que está focada na página
    this.listarCursos();

    // função para esconder o paginator em telas abaixo de 450px. Se possui a width mínima, a página receberá a variável do paginator criada para cada uma das tabelas. Caso o tamanho seja inferior ao mínimo, o null não permitirá que o paginator apareça.
    // o observe irá ler o parâmetro que passarmos na string
    this.observer.observe([
      '(min-width: 450px)'
    ]).pipe(
      tap((resultado: any) => this.bpPaginator = resultado.matches)
    ).subscribe((resultado: any) => {
      if (resultado.matches) {
        this.tabelaCursos.paginator = this.paginatorCurso;
        this.tabelaAlunos.paginator = this.paginatorAluno
      } else {
        this.tabelaCursos.paginator = null;
        this.tabelaAlunos.paginator = null
      }
    });
  } //ngOnInit

  // Essa função é disparada quando se decide por meio da função [salvarAluno] se o usuário selecionou um novo cadastro ou a edição de um cadastro já existente
  // pega os dados do formulário de cadastro e envia para o banco para efetuar o cadastro
  // @@entrada: pega os dados para cadastro diretamente do formulário dentro do modal
  // @@saida: caso o email não esteja repetido dentro da turma, passa os dados para o service fazer a inserção no banco. Se o email já ocorrer dentro daquela turma, ele simplesmente não é inserido
  cadastrarAluno() {
    if (this.form.value.nome == '' || this.form.value.email == '') {
      console.log('campos inválidos');
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // criando o objeto referente ao novo aluno
      const ALUNO: any = {
        id: this.gerarMatricula(),
        nome: this.form.value.nome,
        email: this.form.value.email,
        dataCriacao: new Date(),
        dataModificacao: new Date(),
      };
      // fazendo o teste para determinar se o email já se repete naquela turma
      let flag=false
      this.alunosTurma.forEach((alunoListado)=>{
        if (alunoListado.email == ALUNO.email){
          // o email já existe
          flag=true
        }
      })//forEach
      // o email nao existe, podemos inseri-lo na turma
      if (flag == false){
        this.alunoService.adicionarAluno(ALUNO, this.params).then((resultado) => {
          this.listaAlunos.push(ALUNO);
          this.form.reset();
          this.alunoService.mensagem('Aluno adicionado com sucesso.');
        });
      }//if
      else{
        this.alunoService.mensagem('Erro ao cadastrar aluno : E-mail já cadastrado.')
      }//else
    }
  } //cadastrarAluno

  //comparando com as turmas já existentes no banco se a turma passada por parâmetro já existe, se ela não existir
  //qr dizer que é o cadastro não pode ocorrer, pq o user tá tentando mexer no banco pela url. Isso não pode ocorrer
  // @@entrada: id da turma a ser verificada quanto a existência no banco
  // @@saida: redireciona caso a página não exista
  verificaBanco(nomeBanco: string) {
    // listando as turmas cadastradas
    this.turmasService.listarTurmas().subscribe((resultado) => {
      // console.log("sou as turmas", resultado)
      let flag = 0;
      resultado.forEach((element: any) => {
        // pegando uma a uma e verificando se existe uma igualdade
        if (element.id == nomeBanco) {
          // console.log('IF turma encontrada', element);
          flag = 1;
        }
      });
      // não existe igualdade, a rota não é segura e deve ser abortada
      if (flag == 0) {
        // console.log('IF turma não encontrada');
        this.router.navigate(['/cardsTurmas']);
      }
    });
  } //verificaBanco

  // pega os dados diretamente do formulario de edição e envia junto do id da turma (id do documento) para o service que comunicará o banco para efetuar a atualização dos dados
  // @@entrada: id do aluno que deve ser atualizado
  // @@saida: chamada do service para efetuar a atualização dos dados no banco de dados
  editarAluno(id: string) {
    // console.log("info turma", nomeTurma, id)
    if (this.form.value.nome == '' || this.form.value.email == '') {
      console.log('campos inválidos');
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // objeto contendo quais informações devem ser enviadas para o banco
      const ALUNO: any = {
        nome: this.form.value.nome,
        email: this.form.value.email,
        dataModificacao: new Date(),
      };

      this.alunoService
        .editarAluno(this.params, id, ALUNO, this.emailTroca)
        .then(
          () => {
            console.log('Aluno editado com sucesso.');
            this.alunoService.mensagem(
              'Dados do(a) aluno(a) editados com sucesso.'
            );
            this.form.reset();
            this.id = undefined;
          },
          (erro) => {
            console.log(erro);
          }
        );
    }
  } //editarAluno

  //front
  cadastrar() {
    this.botao = 'Cadastrar';
    this.form.reset();
  } //cadastrar

  // função para definir qual modal abrir mediante o tipo de operação que será realizada
  // @@entrada: basicamente dispara as funções
  // @@saida: nenhuma
  salvarAluno() {
    // console.log("parametro", this.keyAluno)
    // se ele não tem id, um novo aluno será criado
    if (this.id === undefined) {
      this.cadastrarAluno();
    } else {
      //se o aluno já existe, ele é editado
      this.editarAluno(this.keyAluno);
    }
  } //salvarAluno

  // pega no banco todos os alunos que estão vinculadas àquela determinada turma, para tal precisa do id da turma, ou seja, do id do documento que armazena a collection contendo os alunos.
  // @@entrada: id da turma que contém a collection Alunos, ou seja, os alunos a serem listados
  // @@saida: coloca o vetor de retorno contendo os objetos dos alunos diretamente na variável que guarda os alunos da turma. Essa variável faz armazena os objetos para listagem dos alunos na página
  listarAlunosTurma(id: any) {
    this.turmasService.listarAlunosTurma(id).subscribe((doc) => {
      this.alunosTurma = doc;
      this.tabelaAlunos = new MatTableDataSource(doc);
      // this.tabelaAlunos.paginator = this.paginator;

      // console.log(doc) PARA TESTE
      this.tabelaAlunos.paginator = this.paginatorAluno;
    });
    console.log('pegar nome turma:');
  } //listarAlunosTurma

  // pega no banco todos os cursos que estão vinculadas àquela determinada turma, para tal precisa do id da turma, ou seja, do id do documento que armazena a collection contendo os cursos
  // @@entrada: id da turma que contém a collection Cursos, ou seja, os cursos a serem listados
  // @@saida: coloca o vetor de retorno contendo os objetos dos cursos daquela turma diretamente na variável que guarda os cursos da turma. Essa variável faz armazena os objetos para posterior listagem
  listarCursosTurma(id: any) {
    this.turmasService.listarCursosTurma(id).subscribe((doc) => {
      this.cursosTurma = doc;
      this.tabelaCursos = new MatTableDataSource(doc);
      // this.tabelaCursos.paginator = this.paginator;

      // console.log(doc) PARA TESTE
      this.tabelaCursos.paginator = this.paginatorCurso
    });
    console.log('pegar nome turma:');
  } //listarCursosTurma

  //função para ler o csv
  changeListener(files: FileList) {
    console.log(files);
  }

  // função que fica ouvindo esperando que o input de anexar arquivo mude de estado, ao mudar de estado ele entende que um arquivo foi anexado e então ele pode começar a trabalhar. Essa função faz a leitura de um arquivo no formato de Csv, ou seja, o parse. Porém delega o processamento das informações de cada linha à função [preencheCsv]
  // @@entrada: o evento contendo o evento de anexar o arquivo csv
  // @@saida: coloca na variável csvRecords as linhas já processadas pela lib que executa o parse
  async fileChangeListener($event: any) {
    // Select the files from the event
    const files = $event.srcElement.files;
    return new Promise((resolve) => {
      this.papa.parse(files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
          this.csvRecords = results.data;
        },
      });
    }).then(() => {
      this.preencheCsv();
    });
  } //fileChageListener

  // pega os dados do csv que foram colocados na varivel csvRecords e as processa de forma que cada linha vire uma adição no banco
  // @@entrada: dados referente aos objetos que foram extraídos do csv e que devem ser inseridos no banco de dados. Os dados vêm por meio da variável csvRecords e devem ser inseridos no banco de dados
  // @@saida: chamadas ao service para efetuar a inclusão dos dados no banco
  preencheCsv() {
    this.turmasService.pegaKeyTurma(this.nomeTurma).then(() => {
      // gera um objeto para cada registro extraído do csv. Para cada um desses é verificado a unicidade do campo email, mediante isso é iniciada a inserção desse objeto no banco. Dessa forma é criada um novo aluno no banco de dados dentro da collection Alunos dentro da turma apontada.

      let qntAlunosRepetidos =0
      this.csvRecords.forEach((element: any) => {
        let flag=false
        const ALUNO: any = {
          id: this.gerarMatricula(),
          nome: element.nome,
          email: element.email,
          dataCriacao: new Date(),
          dataModificacao: new Date(),
        };


        this.alunosTurma.forEach((alunoListado)=>{
          if (alunoListado.email == ALUNO.email){
            flag=true
            qntAlunosRepetidos++
          }
        })//forEach

        if((!(ALUNO.nome == "Preencha aqui o nome do aluno" || ALUNO.email== "Preencha aqui o e-mail do aluno")) && flag == false)
        {
          this.alunoService
          .adicionarAluno(ALUNO, this.turmasService.idTurma)
        }

      });//forEach
      if(qntAlunosRepetidos >0){
        this.alunoService.mensagem('Erro ao cadastrar '+qntAlunosRepetidos+' aluno(s): E-mail(s) já cadastrado(s).')
      }
      else{
        this.alunoService.mensagem('Todos alunos cadastrados com sucesso.')
      }
    });
  } //preencheCsv

  // dado um objeto do tipo Aluno, faz a exclusão desse registro do banco dados
  // @@entrada: um objeto do tipo Aluno
  // @@saida: faz a chamada da função de exclusão dentro do service
  excluir(aluno: Aluno) {
    this.alunoService.excluirAluno(this.params, aluno.key).then(
      () => {
        this.alunoService.mensagem('Aluno(a) excluído(a) com sucesso.');
      },
      (error) => {
        console.log(error);
      }
    );
  } //excluir

  //função pra preencher o modal de edição do aluno
  editar(aluno: Aluno) {
    //******************** */
    this.botao = 'Editar';
    // salvando o email para comparar com o final na edição, para ver se houve troca de email
    this.emailTroca = aluno.email;
    this.alunoService.mostrarAluno(aluno);
  } //editar

  // gera uma matrícula aleatória, tendo o nome da turma como parte inicial
  // @@entrada: nenhuma
  // @@retorno: uma string contendo uma matricula aleatória
  gerarMatricula() {
    let numCaracteres = 4;
    let matricula = '';
    let caracteres = '0123456789';

    for (let i = 0; i < numCaracteres; i++) {
      matricula += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return this.nomeTurma + '-' + matricula;
  } //gerarMatricula

  // modal
  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  } //open

  // função para capturar a forma com que o modal foi fechado
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  } //getDismissReason


  // ***************************** VALIDAR **************************************
  // exclui todos os aluno da turma, pega ql turma excluir pela variavel nomeTurma
  // excluirAlunosTurma() {
  //   this.turmasService.pegaKeyTurma(this.nomeTurma).then(() => {
  //     console.log("aqui é o params", this.params)
  //     console.log("aqui é nomeTurma", this.nomeTurma)
  //     this.turmasService.excluirAlunosTurma(this.params);
  //     console.log('Acabou a exclusão');
  //     // window.location.reload();
  //   });
  // } //excluirAlunosTurma

  // JP:exclui todos os aluno da turma, pega ql turma excluir pela variavel nomeTurma
  excluirAlunosTurma() {
    // console.log("aqui é o params", this.params)
    // console.log("aqui é nomeTurma", this.nomeTurma)
    this.turmasService.excluirAlunosTurma(this.params, this.alunosTurma);
    // console.log('Acabou a exclusão');

  } //excluirAlunosTurma
  // ***************************** VALIDAR **************************************

  // lista todos os cursos presentes na collection cursos, essa collection armazena todos os cursos cadastrados na plataforma. Esses cursos podem ser anexados às turmas posteriormente.
  // @@entrada: nenhuma
  // @@saida: coloca diretamente na variável os cursos encontrados dentro da collection Cursos
  listarCursos() {
    this.cursoService.listarCursos().subscribe((doc) => {
      console.log(doc);
      this.cursos = doc;
    });
  }

  // dado o id de um curso (id do documento) traz todos os módulos/aulas daquele curso
  // @@entrada: o id de um curso
  // @@saida: coloca dentro de vetorCursos no service os módulos/aulas daquele curso
  mostrarCursoTurma(id: any) {
    // lista os alunos daquela turma
    this.turmasService.listarCursosTurma(id).subscribe((doc) => {
      // preenche o vetorCursos no turmaservice com os alunos da turma
      this.cursosTurmaService.vetorCursos = doc;
      // vai para listagem dos alunos
      this.router.navigate(['/curso/' + this.params + '/' + id]);
    });
  } //

  //Função para armazenar em um obj os cursos selecionados no check-box de cursos
  cursoSelecionado(event: any) {
    this.arrayCurso = []
    const obj = { id: event.target.value, status: event.target.checked };
    this.arrayCurso.push(obj)
  }

  // Copia um objeto da collection cursos e a copia pra dentro de uma turma
  // @@entrada: um array contendo os identificadores dos cursos que devem ser copiados para a turma que está selecionada, ou seja, a turma em que a página está
  // @@saida: o documento que representa a turma e todas as suas subcollections que denotam um curso se transforma em uma subcollection da turma. Essa é armazenada dentro de Turma/Cursos
  cont = "" // variavel para controlar a geração de ids
  addCursoTurma() {
    this.cont = this.cursosTurmaService.randomString(20)

    // para todos os cursos no array
    this.arrayCurso.forEach((element: any) => {
      // estamos procurando o curso na collection Curso que tenha o id igual ao id no array que ta vindo
      this.cursosTurmaService
        .procurarCurso(element.id, this.params)
        .then((snapshot) => {
          // para cada curso
          snapshot.docs.forEach((doc: any) => {
            // adiciona o curso dentro da turma
            this.cursosTurmaService.adicionarCurso(this.params, this.cont, doc.data()).then(() => {
              // indo dentro da collection Cursos e trazendo os modulos do curso em questão
              this.cursosTurmaService.procurarModulo(element.id).subscribe((modulos) => {
                // para cada modulo dentro do curso
                let idmodulo = ""
                let arrayModulosIndex: any = []
                modulos.forEach((modulo: any) => {
                  // aqui tá trazendo os modulos corretamente
                  console.log("modulo", modulo.idModulo)
                  idmodulo = this.cursosTurmaService.randomString(20)
                  // se o index do modulo está dentro desse array, não insere ele dentro da collection
                  if (arrayModulosIndex.includes(modulo.index) == false) {
                    arrayModulosIndex.push(modulo.index)

                    this.cursosTurmaService.adicionarModulos(this.params, this.cont, idmodulo, modulo)
                    console.log("criei o modulo", idmodulo)

                    // lista as aulas e já add no curso
                    this.cursosTurmaService.fun(this.params, this.cont, idmodulo, element.id, modulo.idModulo)
                  }//if
                  else {
                    console.log("modulo.index já cadastrado", modulo.index)
                  }
                })
              })
            })
          })
        });
    });this.alunoService.mensagem('Curso adicionado com sucesso!');
  }//addCursoTurma

  // recebe o registro de um curso faz a deleção dele e de todas as collections que estão localizadas dentro, ou seja, excluí toda a hierarquia que representa o curso.
  // @@entrada: um objeto que representa o modelo do curso, não precisa ser do tipo Curso
  // @@saida: chama o service para realizar a deleção do curso
  deletarCursos(curso: any) {
    // excluindo a imagem do curso que está no storage
    this.cursosTurmaService.deletarCursos(this.params,curso.key)

    if (curso.foto != "" && curso.foto != '../../assets/img/fotoPadrao.png') {
      this.turmasService.excluirDadoStorage(curso.foto)
    }
    this.alunoService.mensagem("Curso excluído com sucesso")
  }//deletarCursos

  // responsividade do sidebar
  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 1024px)'])
      .pipe(delay(1))
      .subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
  }
  // logout da aplicação
  logout() {
    this.loginservice.doLogout();
    this.router.navigate(['/login']);
  }
} //classe
