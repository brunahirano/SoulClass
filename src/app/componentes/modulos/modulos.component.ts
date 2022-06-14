import { LoginService } from './../../servicos/login.service';
import { AlunosService } from 'src/app/servicos/alunos.service';
import { ModulosService } from './../../servicos/modulos.service';
import { AulasService } from 'src/app/servicos/aulas.service';
import { TurmasService } from 'src/app/servicos/turmas.service';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Modulo } from 'src/app/shared/modulo';
import { Aula } from 'src/app/shared/aula';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.css'],
})
export class ModulosComponent implements OnInit {
  // variaveis para controlar o eventos no front
  closeResult = '';
  botao = 'Adicionar';

  // controla as opçoes selecionadas nos selects
  selected = '';
  selected2 = '';
  selectedAula = -2;
  selectedModulo = -2;

  // variavel para controlar o upload de um arquivo
  progresso: boolean = false;

  // formulários para o módulo e para a aula do módulo
  form!: FormGroup;
  formAula!: FormGroup;

  // id do curso que está vindo como parâmtro no link
  paramsCurso: any;

  // variavel do tipo lista de modulo que armazenará todas os modulos do curso que está sendo visualizado no momento
  vetorModulos: Modulo[] = [];

  // variavel para guardar as aulas existentes em um módulo em determinado momento
  vetorAulas: Aula[] = [];

  // controlam as informações que são exibidas na página, tipo o nome do curso no título da página
  nomeCurso = '';
  nomeAula: string = '';

  // controla se o modal será uma edição ou exclusão
  verificacaoKey: boolean = false;
  keyModulo: string = '';

  // variaveis para controlar a exibição de elementos no front
  linkDocumento: any;
  tipoDocumento: any;
  imgDefault: string = '../../assets/img/fotoPadrao.png';

  // variavel para guardar a informação do documento que estava anteriormente anexado
  documentoAnterior = '';

  // pega o modulo em que a aula que está sendo modificada está inserida
  moduloEdit = '';

  // guarda a key da aula que está sendo editada no momento
  keyAulaEdit = '';

  // sidebar
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private moduloService: ModulosService,
    private aulasService: AulasService,
    private turmaService: TurmasService,
    private alunoService: AlunosService,
    private observer: BreakpointObserver,
    private loginservice: LoginService,
    private route: Router
  ) {
    // validação do form
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
      posicao: ['-1'],
    });

    // validação do form
    this.formAula = this.fb.group({
      nome: ['', [Validators.required]],
      tipoDocumento: ['', [Validators.required]],
      linkDocumento: [''],
      posicao: ['-1'],
    });

    // starta o comportamento dos elementos exibidos nos modais
    this.linkDocumento = undefined;
    this.tipoDocumento = this.formAula.value.tipoDocumento;
  } //constructor

  ngOnInit(): void {
    // parametro passado pela url que exibe o id do curso
    this.paramsCurso = this.activatedRoute.snapshot.params['curso'];

    // lista os modulos do curso
    this.listarModulos(this.paramsCurso);
  }

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

  // pega a forma com que o modal é fechado
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  } //getDismissReason

  // função que adiciona um novo módulo na posição desejada pelo usuário
  // @@entrada: pega os dados do modal de cadastro para realizar a adição desse no banco de dados
  // @@saida: faz acesso ao banco por meio do service para persistir a adição dos dados
  adicionarModulo() {
    // controla a posição em que será inserido o novo modulo
    var pos = -1;
    if (this.form.value.posicao == -2) {
      pos = this.vetorModulos.length;
    } else if (this.form.value.posicao == -1) {
      pos = 0;
    } else {
      pos = this.form.value.posicao + 1;
    }
    // objeto com as informações do novo modulo
    const modulo: Modulo = {
      nome: this.form.value.nome,
      descricao: this.form.value.descricao,
      index: pos,
      keyModulo: '',
      dataCriacao: new Date(),
      dataModificacao: new Date(),
      // aulas: []
    };
    // insere e organiza a ordem com que os modulos devem ser exibidos
    this.moduloService
      .organiza(this.paramsCurso, pos, this.vetorModulos, 1)
      .then(() => {
        this.moduloService.adicionarModulo(this.paramsCurso, modulo);
        this.alunoService.mensagem('Módulo adicionado com sucesso.');
      });
  }

  // lista os módulos que estão presentes no curso que está focado no momento, ou seja, aquele ao qual a página se refere, por meio do parametro na url
  // @@entrada: o id do curso que deve ter seus modulos listados
  // @@saida: coloca os modulos dentro da variável vetorModulos, para que sejam trabalhados em outras áreas posteriormente.
  listarModulos(keyCurso: string) {
    this.moduloService.listarModulos(keyCurso).subscribe((modulos) => {
      // this.vetorModulos = result
      // listando todos os modulos
      modulos.forEach((element: any) => {
        // pra cada modulo eu preciso pegar suas Aulas
        // listando as aulas do modulo da atual iteração
        this.aulasService
          .listarConteudo(this.paramsCurso, element.keyModulo)
          .subscribe((aulas) => {
            element.aulas = aulas;
          });
      });
      this.vetorModulos = modulos;
    });
    this.moduloService.pegarNomeCurso(keyCurso).then(() => {
      this.nomeCurso = this.moduloService.nomeCurso;
    });
  }

  // preenche o modal de edição com os dados do modulo clicado na listagem
  // @@entrada: pega o objeto do tipo modulo que foi clicado
  // @@saida: envia os dados para preencher o modal que permite a edição
  preencheEditarModulo(modulo: Modulo) {
    this.botao = 'Editar';
    this.verificacaoKey = true;

    this.form.patchValue({
      nome: modulo.nome,
      descricao: modulo.descricao,
    });
    this.keyModulo = modulo.keyModulo;
  }

   // função que decide se será feita uma edição ou adição e chama as respectivas funções
  // @@entrada: nenhuma
  // @@saida: chama as funções que fazem a edição ou adição
  salvarModulo() {
    console.log('false -> cadastro', this.verificacaoKey);
    if (this.verificacaoKey === false) {
      this.adicionarModulo();
      console.log('modal adicionando');
    } else {
      this.SalvarEdicaoModulo(this.keyModulo);
      console.log('modal editando');
    }
  }//salvarModulo

  // função para persistir as alterações realizadas por meio do modal
  // @@entrada: id do modulo que foi editado
  // @@saida: chama o service para que os novos dados sejam salvos no banco
  SalvarEdicaoModulo(keyModulo: string) {
    if (this.form.value.nome == '' || this.form.value.descricao == '') {
      //Mensagem Toast de retorno
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      const MODULO: any = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        dataModificacao: new Date(),
      };
      this.moduloService.editarModulo(this.paramsCurso, MODULO, keyModulo);
      this.alunoService.mensagem('Módulo editado com sucesso.');
    }
    this.form.reset();
    this.botao = 'Cadastrar';
  }//SalvarEdicaoModulo

  // função para excluir o modulo
  // @@entrada: um objeto do tipo Modulo, contendo as informações pertinentes a exclusão, tais como id e index
  // @@saida: acesso ao service para fazer a exclusão do modulo
  excluirModulo(modulo: Modulo) {
    this.moduloService.excluirModulo(
      modulo.keyModulo,
      modulo.index,
      this.paramsCurso,
      this.vetorModulos,
      -1
    );
    this.alunoService.mensagem('Módulo excluído com sucesso.');
  }//excluirModulo

  // função para limpar o modal e preparar as variaveis que controlam o comportamento de adição e edição, uma vez que o mesmo modal é utilizado para realizar as duas ações
  // @@entrada: nenhuma
  // @@saida: toggle nas variáveis
  resetModal() {
    this.botao = 'Cadastrar';
    this.form.reset();
    this.formAula.reset();
    this.verificacaoKey = false;
  }//resetModal

  // modal para a parte das aulas, ele limpa o modal e prepara as variaveis que controlam o comportamento de áreas que se fundem devido a funções compartilhadas
  // @@entrada: nenhuma
  // @@saida: toggle nas variáveis
  resetModal2(modulo: Modulo) {
    this.botao = 'Cadastrar';
    this.selected2 = ''
    this.form.reset();
    this.formAula.reset();
    this.verificacaoKey = false;
    this.keyModulo = modulo.keyModulo;

    this.aulasService
      .listarConteudo(this.paramsCurso, this.keyModulo)
      .subscribe((result) => {
        this.vetorAulas = result;
      });

    this.linkDocumento = '';
    this.tipoDocumento = '';
    this.nomeAula = '';
  }//resetModal2

  // função que faz a criação de novas aulas mediante o preenchimento do formulário
  // @@entrada: informações vindas do modal de formulário
  // @@saida: dados para o banco de dados
  addAula() {
    if (
      this.formAula.value.nome == '' ||
      this.formAula.value.tipoDocumento == ''
    ) {
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      var pos = -1;
      if (this.formAula.value.posicao == -2) {
        pos = this.vetorAulas.length;
      } else if (this.formAula.value.posicao == -1) {
        pos = 0;
      } else {
        pos = parseInt(this.formAula.value.posicao) + 1;
      }

      // objeto que conterá as informações que serão inseridas no banco
      const AULA = new Aula();
      AULA.nome = this.formAula.value.nome;
      AULA.tipo = this.formAula.value.tipoDocumento;
      AULA.link = this.linkDocumento;
      AULA.index = pos;

      // fazendo a chamada ao service, para que ele organize a ordem das aulas e faça a inserção dessa no banco
      this.aulasService
        .organiza(this.paramsCurso, this.keyModulo, pos, this.vetorAulas, 1)
        .then(() => {
          this.aulasService
            .AdicionaAula(this.keyModulo, this.paramsCurso, AULA)
            .then(() => {
              // console.log("aula adicionada") PARA TESTE
              this.alunoService.mensagem('Aula adicionada com sucesso.');
            });
        });
    }
  } //addAula

  // função para efetuar a edição de aula e inserir a alteração no banco por meio do service
  // @@entrada: dados vindos do formulário dentro do modal
  // @@saida: dados para serem salvados no banco de dados
  editarAula() {
    if (
      this.formAula.value.nome == '' ||
      this.formAula.value.tipoDocumento == ''
    ) {
      this.alunoService.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      if (
        this.linkDocumento != this.documentoAnterior &&
        this.linkDocumento != ''
      ) {
        this.turmaService.excluirDadoStorage(this.documentoAnterior);
      }

      //objeto que armazenará as informações que serão atualizadas no banco
      const Aula = {
        nome: this.formAula.value.nome,
        tipo: this.formAula.value.tipoDocumento,
        link: this.linkDocumento,
        dataModificacao: new Date(),
      };

      // chamando o service para que ele acesse o banco
      this.moduloService
        .updateAula(Aula, this.paramsCurso, this.moduloEdit, this.keyAulaEdit)
        .then(() => {
          // console.log("aula editada com sucesso")
          this.alunoService.mensagem('Aula editada com sucesso.');
        });
    }
  }

  // função para consultar a key e decidir se será uma adição ou edição
  // @@entrada: nenhuma
  // @@saida: chama as funções que fazem a edição ou salvamento dos dados do modal
  verificaSalvamento() {
    if (this.verificacaoKey == false) {
      this.addAula();
    } else {
      this.editarAula();
    }
  }

  // função que efetua a exclusão das aulas
  // @@entrada: vetor contendo as aulas, o objeto da aula, o objeto do modulo que contém a aula
  // @@saida: chama o service que faz a exclusão
  excluirAula(vetorAula: any, aula: any, modulo: any) {
    // excluindo o conteúdo vinculado à aula do storage
    if (aula.link != '') {
      this.turmaService.excluirDadoStorage(aula.link);
    }
    // chamando do service a função para reorganizar a lista de aulas e a função para excluir do banco
    this.aulasService
      .organiza(this.paramsCurso, modulo.keyModulo, aula.index, vetorAula, -1)
      .then(() => {
        this.aulasService.excluirAula(
          this.paramsCurso,
          modulo.keyModulo,
          aula.keyAula
        );
        this.alunoService.mensagem('Aula excluída com sucesso.');
      });
  }

  // função que pega o evento de anexo do arquivo e chama o service para enviar a imagem para o storage
  // @@entrada: evento do upload do arquivo
  // @@saida: coloca na variavel linkDocumento a url da imagem no storage
  carregarDocumento(event: any) {
    let arquivo = event.target.files;
    // função para fazer a leitura do arquivo
    let reader = new FileReader();
    this.progresso = true;

    // função para ler o aquivo
    reader.readAsDataURL(arquivo[0]);
    // quando terminar de carregar a foto
    var nomeAula = 'Aula' + Date.now();
    reader.onloadend = () => {
      // this.imagem = reader.result
      this.aulasService
        .carregarAula(nomeAula, reader.result)
        .then((documento) => {
          this.linkDocumento = documento;
          this.progresso = false;
        });
    };
  }
  // evento que é disparado quando ocorre uma mudança no modal de seleção do formato de arquivo. Isso filtra os documentos que aparecem no explorer
  changeDocumento(event: any) {
    this.linkDocumento = '';
    this.tipoDocumento = this.formAula.value.tipoDocumento;
  }

   // preenche os dados da aula selecionada no modal e preenche as variáveis que controlam o funcionamento dos modais
  preencherModalAula(aula: any, modulo: any) {
    this.botao = 'Editar';
    this.linkDocumento = aula.link;
    // pegando o documento que estava antes de começar a edição, caso o link mude temos que excluir o antigo
    this.documentoAnterior = aula.link;
    this.tipoDocumento = aula.tipo;
    this.selected2 = aula.tipo
    this.verificacaoKey = true;

    this.formAula.patchValue({
      nome: aula.nome,
      tipoDocumento: aula.tipo,
      posicao: aula.posicao,
    });

    this.nomeAula = aula.nome;
    // pega o modulo em que a aula que está sendo modificada está inserida
    this.moduloEdit = modulo;
    // pega a key da aula que está sendo editada no momento
    this.keyAulaEdit = aula.keyAula;
  }

  // função para chamar modal lg
  openLg(content: any) {
    this.modalService.open(content, { size: 'lg', scrollable: true });
  }

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
    this.route.navigate(['/login']);
  }
} //classe
