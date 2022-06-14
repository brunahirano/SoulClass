import { TestesService } from './../../servicos/testes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Teste } from './../../shared/teste';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AlunosService } from 'src/app/servicos/alunos.service';
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { Papa } from 'ngx-papaparse';
import { iif } from 'rxjs';

@Component({
  selector: 'app-teste',
  templateUrl: './teste.component.html',
  styleUrls: ['./teste.component.css'],
})
export class TesteComponent implements OnInit {
  // formularios
  formQuestoes!: FormGroup;
  formTeste!: FormGroup;

  // variavel para esconder as questões caso seja uma questão do tipo multipla escolha
  estaVisivel!: boolean;

  // vetor contendo todos os testes da página
  vetorTeste: Teste[] = [];
  titulo: string = '';

  closeResult: string = '';
  aparecer: any;

  // parametros vindos via url
  paramsCurso: string = '';
  paramsTurma: string = '';
  keyTeste: any;

  //variavel para guardar os registros proveninentes do
  csvRecords: any;
  criado: string[] = [];
  questoesTeste: any[] = [];
  idTeste: any;
  // determina se será uma adição ou edição
  idQuestao: any;
  botao = 'Criar';
  resposta: any = '';
  selected: string = '';
  verificacao: boolean;
  respostaAnterior: any;

  toggle: boolean = true;
  toggle2: boolean = true;
  toggle3: boolean = true;
  toggle4: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alunoService: AlunosService,
    private serviceTeste: TestesService,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    config: NgbModalConfig,
    private papa: Papa
  ) {
    // define se está ocorrendo uma edição ou uma adição
    this.idTeste == undefined;

    config.keyboard = false;

    // validação de formulário
    this.formTeste = this.fb.group({
      titulo: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
      tentativa: [
        '',
        [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
      ],
      acerto: ['', [Validators.required]],
    });

    // validação de formulario
    this.formQuestoes = this.fb.group({
      keyTeste: [''],
      titulo: [''],
      opcao1: [''],
      opcao2: [''],
      opcao3: [''],
      opcao4: [''],
    });

    // controlar a aparição de elementos no modal
    this.estaVisivel = false;
    this.aparecer = '';
    // controlar o tipo de operação que será realizada
    this.verificacao = false;
  }

  ngOnInit(): void {
    // tirando as informações da url
    this.paramsCurso = this.activatedRoute.snapshot.params['curso'];
    this.paramsTurma = this.activatedRoute.snapshot.params['turma'];
    // lista os testes que estão vinculados a esta página
    this.mostrarTestes();
  }//ngOnInit

  // função para mostrar o formulário
  mostrarForm() {
    this.estaVisivel = true;
  }//mostrarForm

  // função para controlar qual tipo de questão foi selecionada no select e qual tipo de visualização deve ser proporcionada
  mostrarFormQuestao(event: any) {
    if (event.target.value == 'verdadeira-falsa') {
      this.aparecer = 'verdadeira-falsa';
    } else {
      this.aparecer = 'multipla-escolha';
    }
  }//mostrarFormQuestao

  // direciona para uma area de visualização
  visualizarTeste() {
    this.router.navigate(['/visualizar']);
  }//visualizarTeste

  // determina se está ocorrendo a adição de um teste ou edição, isso se faz necessário pq o modal é o mesmo, daí temos uma variavel de toggle para tal
  salvaTeste() {
    if (this.idTeste == undefined) {
      this.criarTeste();
    } else {
      this.editarTeste();
    }
  }//salvaTeste

  // função para realizar o cadastro de um novo teste no banco de dados
  // @@entrada: os dados são extraídos do formulario em que o teste é preenchido
  // @@saida: envia os dados ao banco de dados por intermedio do service
  criarTeste(): void {
    // validação do formulário
    if (
      this.formTeste.value.titulo == '' ||
      this.formTeste.value.descricao == '' ||
      this.formTeste.value.tentativa == ''
    ) {
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // criando o objeto que contem todas as informações que devem ser armazenadas no banco de dados
      const TESTE = {
        titulo: this.formTeste.value.titulo,
        descricao: this.formTeste.value.descricao,
        tentativa: this.formTeste.value.tentativa,
        acerto: this.formTeste.value.acerto,
        dataCriacao: new Date(),
        dataModificacao: new Date(),
      };
      // envio dos dados para o back
      this.serviceTeste
        .criarTeste(TESTE, this.paramsTurma, this.paramsCurso)
        .then((resultado) => console.log(resultado));
      this.alunoService.mensagem('Teste criado com sucesso');
      this.formTeste.reset();
    }
  } //criarTeste

  // traz todas as turmas cadastradas no banco e as guarda em um vetor
  // @@entrada: os dados necessários são extraídos das variáveis {this.paramsTurma, this.paramsCurso} uma vez que dizem a localidade em que os testes estão inseridos, ou seja, dentro de um curso que está dentro de uma turma
  // @@saida: coloca os testes na variavel vetorTeste
  mostrarTestes() {
    // mostra os testes e as questoes
    this.serviceTeste
      .mostrarTeste(this.paramsTurma, this.paramsCurso)
      .subscribe((doc) => {
        console.log(doc);
        this.vetorTeste = doc;
        doc.forEach((e: any) => {
          this.mostrarQuestoes(e);
        });
      });
  } //mostrarTestes

  //preenche o formulario de edição no card com as infos da turma que se qr editar
  infoTeste(modeloTeste: Teste) {
    // usada para indicar qual teste foi selecionado. Dps esse nome será passado para as funções que referenciam o banco
    this.titulo = modeloTeste.titulo;

    // pegando a info que veio do banco e colocando nos campos do formulario
    this.formTeste.patchValue({
      titulo: modeloTeste.titulo,
      descricao: modeloTeste.descricao,
      quantidade: modeloTeste.quantidade,
    });
  }//infoTeste

  // modal
  open(content: any, idTeste?: any) {
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
    this.keyTeste = idTeste;
  } //open

  // modal lg
  openLg(content: any, keyTeste: any) {
    this.keyTeste = keyTeste;
    this.modalService.open(content, { size: 'lg', scrollable: true });
  } //openLg

  // determina qual modo pode ser utilizado para fechar o modal
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  } //getDismissReason

  // função para fazer com que o modal seja limpo e as variavés que controlam comportamentos visuais sejam reiniciados ou mantidos
  resetModal() {
    this.estaVisivel = false;
    this.formTeste.reset();
    this.formQuestoes.reset();
    this.botao = 'Criar';
    this.idTeste = undefined;
    this.aparecer = undefined;
    this.verificacao = false;
  }

  // função para excluir um teste, essa exclusão exclui o documento com as informações acerca do teste e todos os documentos da collection de questões
  // @@entrada: o identificador do teste que será deletado
  // @@saida: acesso ao banco de dados por intermédio do service. O service que fará a exclusão do registro
  excluirTeste(idTeste: string) {
    this.serviceTeste.excluirTeste(this.paramsTurma, this.paramsCurso, idTeste);
    this.alunoService.mensagem('Teste excluido com sucesso!');
  }

  // função que traz as informações da tabela ( registro que foi clicado) e faz com que vá para o formulário do modal
  // @@entrada: objeto que represente um teste cujas informações são passíveis de serem deletadas
  // @@saida: os dados que vão para o formulário
  preencheEditarTeste(teste: any) {
    // envia os dados no formulário
    this.formTeste.patchValue({
      titulo: teste.titulo,
      descricao: teste.descricao,
      tentativa: teste.tentativa,
      acerto: teste.acerto,
    });
    this.idTeste = teste.id;
    this.botao = 'Editar';
  }

  // função para efetuar a edição do teste e inserir a alteração no banco por meio do service
  // @@entrada: dados vindos do formulário dentro do modal
  // @@saida: dados para serem salvados no banco de dados
  editarTeste() {
    if (
      this.formTeste.value.titulo == '' ||
      this.formTeste.value.descricao == '' ||
      this.formTeste.value.tentativa == ''
    ) {
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // objeto do teste que armazena as informações do teste extraídas do modal e que serão enviadas ao banco
      const TESTE = {
        titulo: this.formTeste.value.titulo,
        descricao: this.formTeste.value.descricao,
        tentativa: this.formTeste.value.tentativa,
        acerto: this.formTeste.value.tentativa,
        dataCriacao: new Date(),
        dataModificacao: new Date(),
        id: this.idTeste,
      };

      // acesso ao banco
      this.serviceTeste.editarTeste(this.paramsTurma, this.paramsCurso, TESTE);
      this.alunoService.mensagem('Teste editado com sucesso');
      this.formTeste.reset();
    }
  }//editarTeste


  // função para detectar se a resposta correta foi alterada na hora de editar o teste
  // pega o evento de click da opção que é marcada como correta
  btn: any;
  opcaoCorreta(event: any) {
    this.resposta = event.target.value;
    this.respostaAnterior = '';
    // console.log(this.resposta);
  }//opcaoCorreta

  // função que decide se será feita uma edição ou adição e chama as respectivas funções
  // @@entrada: nenhuma
  // @@saida: chama as funções que fazem a edição ou adição
  salvarQuestao() {
    if (this.verificacao == false) {
      this.criarQuestoes();
    } else {
      this.editarQuestao();
    }
  }//salvarQuestao

  // extrai as informações do modal de criação de questões e envia para o banco para ser inserido dentro de um teste que está dentro de uma turma que está dentro de um curso turma>>curso>>teste>>questao
  // @@entrada: pega as informações diretamente do formulario de criação da questao
  // @@saida: envia as informações pro banco
  criarQuestoes() {
    const QUESTOES = {
      dataCriacao: new Date(),
      dataModificacao: new Date(),
      titulo: this.formQuestoes.value.titulo,
      opcao1: this.formQuestoes.value.opcao1,
      opcao2: this.formQuestoes.value.opcao2,
      opcao3: this.formQuestoes.value.opcao3,
      opcao4: this.formQuestoes.value.opcao4,
      resposta: this.resposta,
      tipo: this.aparecer,
    };

    this.serviceTeste
      .criarQuestao(this.paramsTurma, this.paramsCurso, this.keyTeste, QUESTOES)
      .then((questao: any) => {
        console.log('Questão adicionada com sucesso !', questao);
        this.alunoService.mensagem('Questão criada com sucesso.');
      });
  }//criarQuestoes


  // dado um teste, mostra as questões que estão associadas a ele
  // @@entrada: pega os objetos da questoes e coloca dentro da propriedade do teste que armazena internamente as questões
  // @@saida: coloca as questões dentro do teste
  mostrarQuestoes(element: any) {
    this.serviceTeste
      .mostrarQuestoes(this.paramsTurma, this.paramsCurso, element.id)
      .subscribe((questoes) => {
        element.questoes = questoes;
      });
  }//mostrarQuestoes

  // exclui a questão que está dentro de um teste, para tal deve ser enviada o id da questão e o id do teste
  // @@entrada: id da questão que deve ser deletada e id do teste que armazena essa questão
  // @@saida: chamada ao banco para efetuar a exclusão
  excluirQuestao(idQuestao: any, idTeste: any) {
    this.serviceTeste
      .excluirQuestao(this.paramsTurma, this.paramsCurso, idQuestao, idTeste)
      .then((excluido) => {
        this.alunoService.mensagem('Questão excluída com sucesso!');
      });
  }

  // preenche o formulário de edição de questão para permitir a edição da questão pelo modal
  // @@entrada: objeto da questão com seus dados e id do teste que engloba a questão
  // @@saida: o preenchimento dos dados no modal
  preencherQuestao(questao: any, idTeste: any) {
    // dados que vão para o formulário
    this.formQuestoes.patchValue({
      titulo: questao.titulo,
      opcao1: questao.opcao1,
      opcao2: questao.opcao2,
      opcao3: questao.opcao3,
      opcao4: questao.opcao4,
    });

    // marcam os comportamentos que controlam a exibição do formulário
    this.botao = 'Editar';
    this.aparecer = questao.tipo;
    this.estaVisivel = true;
    this.verificacao = true;
    this.idTeste = idTeste;
    this.idQuestao = questao.idQuestao;
    this.resposta = questao.resposta;

    // marcam quando houver uma alteração na questão que estava na versão anterior a edição
    if (this.formQuestoes.value.opcao1 == this.resposta) {
      this.respostaAnterior = 1;
    } else if (this.formQuestoes.value.opcao2 == this.resposta) {
      this.respostaAnterior = 2;
    } else if (this.formQuestoes.value.opcao3 == this.resposta) {
      this.respostaAnterior = 3;
    } else if (this.formQuestoes.value.opcao4 == this.resposta) {
      this.respostaAnterior = 4;
    }
  }//preencherQuestao

  // pega os dados do formulário para enviar para o banco de dados
  // @@entrada: pega os dados do formulário, tira do modal e envia para o banco de dados
  // @@saida: envia os dados para serem persistidos no banco de dados
  editarQuestao() {
    // pega qual a alternativa está marcada como certa
    if (this.respostaAnterior == 1) {
      this.resposta = this.formQuestoes.value.opcao1;
    } else if (this.respostaAnterior == 2) {
      this.resposta = this.formQuestoes.value.opcao2;
    } else if (this.respostaAnterior == 3) {
      this.resposta = this.formQuestoes.value.opcao3;
    } else if (this.respostaAnterior == 4) {
      this.resposta = this.formQuestoes.value.opcao4;
    }

    // caso seja um formulário do tipo VF, ele pega as informações que são pertinentes ao vf
    if (this.aparecer == 'verdadeira-falsa') {
      const QUESTAO = {
        titulo: this.formQuestoes.value.titulo,
        opcao1: this.formQuestoes.value.opcao1,
        opcao2: this.formQuestoes.value.opcao2,
        tipo: this.aparecer,
        resposta: this.resposta,
        dataModificacao: new Date(),
      };

      this.serviceTeste.editarQuestao(
        this.paramsTurma,
        this.paramsCurso,
        this.idTeste,
        this.idQuestao,
        QUESTAO
      );
      this.alunoService.mensagem('Questão editada com sucesso!');
    } else {
      // caso seja um formulário do tipo multipla-escolha, ele pega as informações que são pertinentes àquele tipo, no caso, pegar as 4 opções etc.
      const QUESTAO = {
        titulo: this.formQuestoes.value.titulo,
        opcao1: this.formQuestoes.value.opcao1,
        opcao2: this.formQuestoes.value.opcao2,
        opcao3: this.formQuestoes.value.opcao3,
        opcao4: this.formQuestoes.value.opcao4,
        tipo: this.aparecer,
        resposta: this.resposta,
        dataModificacao: new Date(),
      };

      // pega as informações do formulário e envia para o banco
      this.serviceTeste.editarQuestao(
        this.paramsTurma,
        this.paramsCurso,
        this.idTeste,
        this.idQuestao,
        QUESTAO
      );
      this.alunoService.mensagem('Questão editada com sucesso!');
    }
  }//editarQuestão


  // função que pega o evento de anexação do csv e faz o parse das linhas
  // @@entrada: pega o evento de upload do arquivo e envia para a api que faz o parse
  // @@saida: extrai as linhas e coloca cada registro em um indice no vetor csvRecords
  readFileCSV($event: any) {
    this.criado = [];

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
      this.verificarCSV();
    });
  } //fileChageListener

  // função para verificar a integridade dos dados do csv, vê se os registros possuem algum erro de preenchimento
  contagem: number = 1;
  verificarCSV() {
    this.csvRecords.forEach((objectCSV: any) => {
      if (
        objectCSV.tipo == 'multipla-escolha' &&
        (objectCSV.resposta == objectCSV.opcao1 ||
          objectCSV.resposta == objectCSV.opcao2 ||
          objectCSV.resposta == objectCSV.opcao3 ||
          objectCSV.resposta == objectCSV.opcao4)
      ) {
        const cadaObjectME = {
          titulo: objectCSV.titulo,
          tipo: objectCSV.tipo,
          opcao1: objectCSV.opcao1,
          opcao2: objectCSV.opcao2,
          opcao3: objectCSV.opcao3,
          opcao4: objectCSV.opcao4,
          resposta: objectCSV.resposta,
        };
        this.criado.push('true');
        this.contagem += 2;
        console.log(this.contagem);
        this.serviceTeste.criarQuestao(
          this.paramsTurma,
          this.paramsCurso,
          this.keyTeste,
          cadaObjectME
        );
        console.log(cadaObjectME);
      } else if (
        objectCSV.tipo == 'verdadeira-falsa' &&
        (objectCSV.resposta == objectCSV.opcao1 ||
          objectCSV.resposta == objectCSV.opcao2)
      ) {
        const cadaObjectVF = {
          titulo: objectCSV.titulo,
          tipo: objectCSV.tipo,
          opcao1: objectCSV.opcao1,
          opcao2: objectCSV.opcao2,
          resposta: objectCSV.resposta,
        };
        this.criado.push('true');
        this.contagem += 2;
        console.log(this.contagem);
        this.serviceTeste.criarQuestao(
          this.paramsTurma,
          this.paramsCurso,
          this.keyTeste,
          cadaObjectVF
        );

        // console.log(cadaObjectVF);
      } else {
        this.criado.push('false');
      }
    });

    // console.log(this.criado);
    if (this.criado.indexOf('false') == -1) {
      this.alunoService.mensagem('Questões criadas com sucesso !');
    } else {
      this.alunoService.mensagem(
        'Erro ao cadastrar uma ou mais questões: Verifique as propriedades do CSV.'
      );
    }
  }//verificarCsv
}//classe
