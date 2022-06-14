import { LoginService } from './../../servicos/login.service';
import { TurmasComponent } from './../turmas/turmas.component';
import { TurmasService } from 'src/app/servicos/turmas.service';
import { AlunosService } from 'src/app/servicos/alunos.service';
import { Turma } from 'src/app/shared/turmas';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-cards-turmas',
  templateUrl: './cards-turmas.component.html',
  styleUrls: ['./cards-turmas.component.css'],
})
export class CardsTurmasComponent implements OnInit {
  // usado para trazer os dados do formulario do HTML
  form: FormGroup;

  // usado para listar as turmas armazenadas no banco, utilizando o Modelo da turma(shared/turma.ts)
  turmas: Turma[] = [];

  // usada para guardar a imagem referente a thumb da turma no firebase
  valorImg = '';

  // usada para comparar se a imagem foi trocada durante a edição
  imgAnterior = '';

  // usada para armazenar a data já armazenada no registro, usada na hora da edição do curso
  dataCriacao: Date;

  // usada para indicar qual turma foi selecionada. Dps esse nome será passado para as funções que referenciam o banco
  nomeTurma = '';

  // uso do angular-material
  closeResult = '';

  // variavel inicial para mostrar a barra de progresso no carregamento de arquivos
  progresso: boolean = false;

  // URL da imagem padrão (placeholder)
  imagemPlaceHolder = '../../assets/img/fotoPadrao.png';

  // variével para utilizar a biblioteca do input de filtrar
  filterTerm!: string;

  // sidebar
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(
    private turmaservice: TurmasService,
    private router: Router,
    private fb: FormBuilder,
    private alunoservice: AlunosService,
    private modalService: NgbModal,
    public dialog: MatDialog,
    private observer: BreakpointObserver,
    private loginservice: LoginService,
    private route: Router
  ) {
    // preparando para determinar as novas datas de modificação
    this.dataCriacao = new Date();

    //validações para o formulário de cadastrar uma nova turma
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      foto: [''],
    });
  } //constructor

  ngOnInit(): void {
    // inicializa a página carregando todas as turmas que estão no banco
    this.mostrarTurmas();
    // já traz ql o endereço da imagem de placeholder pré-cadastrada no banco, caso uma foto não seja anexada ao curso, essa imagem é anexada
    this.valorImg = this.turmaservice.imgPlaceHolder;
  } //ngOnInitngOnInit

  // traz todas as turmas cadastradas no banco e as guarda em um vetor
  mostrarTurmas() {
    this.turmaservice.listarTurmas().subscribe((doc) => {
      console.log(doc);
      this.turmas = doc;
    });
  } //mostrarTurmas

  // dado o id de uma turma (id do documento) traz todos os alunos armazenados na collection Aluno dentro da turma
  //@@entrada: id da turma que se quer listar os alunos
  //@@saida: retorna um vetor contendo os alunos e coloca em uma variavel no service
  listarAlunosTurma(turma: any) {
    // lista os alunos daquela turma
    this.turmaservice.listarAlunosTurma(turma.id).subscribe((doc) => {
      // preenche o vetorAlunos no turmaservice com os alunos da turma
      this.turmaservice.vetorAlunos = doc;
      // vai para listagem dos alunos
      this.router.navigate(['/aluno/' + turma.id]);
    });
  } //listarAlunosTurma

  //preenche o formulario de edição no card com as infos da turma que se quer editar
  //@@entrada: um objeto do tipo Turma contendo as informações atuais passíveis de serem modificadas
  //@saida: coloca as informações daquela turma direto no modal que faz o cadastro
  editarTurma(modeloTurma: Turma) {
    // nome da turma pra fazer sabe quem modificar
    this.nomeTurma = modeloTurma.nome;

    // pegando a info que veio do card e colocando nos campos do formulario
    this.form.patchValue({
      nome: modeloTurma.nome,
      descricao: modeloTurma.descricao,
    });
    // essas informações não estão indo pro formulario, elas são guardadas para serem comparadas no momento em que ocorrer a edição de fato. Com isso é possivel determinar se a imagem carregada foi alterada e necessita ser enviada para o storage
    this.valorImg = modeloTurma.foto;
    this.imgAnterior = modeloTurma.foto;

    // preparando para atualizar o banco com uma nova data, uma vez que ele foi alterado
    this.dataCriacao = modeloTurma.dataCriacao;
  } //editarTurma

  // função que dispara quando o user aperta o botão pra confirmar a edição das alterações
  // valida os campos do formulario e envia as informações da turma para serem atualizadas no banco
  //@@entrada: pega os dados diretamente do formulario de edição
  //@@saida: envia os dados para a função do service que faz o update das informações no banco
  updateTurma() {
    //validação do form
    if (this.form.value.nome == '' || this.form.value.descricao == '') {
      console.log('campos inválidos');
      this.alunoservice.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // objeto que contem as edições
      const TURMA = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        foto: this.valorImg,
      };

      // as imagens são diferentes e a imagem anterior não é vazia, pq se for vazia não precisamos procurá-la no storage para excluir, então excluímos a anterior.
      // neste passo a nova imagem já tá no banco
      if (
        this.valorImg != this.imgAnterior &&
        this.imgAnterior != '../../assets/img/fotoPadrao.png'
      ) {
        this.turmaservice.excluirDadoStorage(this.imgAnterior);
      }
      // convertendo o nome em identificador
      this.turmaservice.pegaKeyTurma(this.nomeTurma).then(() => {
        // chamando o service para fazer o update no banco
        this.turmaservice.turmaEdit(TURMA).then(() => {
          console.log('turma editada com sucesso');
          this.alunoservice.mensagem('Turma editada com sucesso');
        });
      });
    }
  } //update turma

  // dado o registro de uma turma faz a deleção dessa no banco de dados
  // @@entrada: objeto da turma que deverá ser deletada, contendo os campos necessários para acessar a informação no banco
  // @@saida: chama o service para efetuar a deleção passando o id do objeto a ser deletado
  excluirTurma(modeloTurma: any) {
    // a foto não é vazia, logo temos que excluir ela
    if (
      modeloTurma.foto != '' &&
      modeloTurma.foto != '../../assets/img/fotoPadrao.png'
    ) {
      this.turmaservice.excluirDadoStorage(modeloTurma.foto);
    }
    this.turmaservice.excluirTurma(modeloTurma.id);
  } //excluirTurma

  // carrega uma imagem no storage e coloca a url dessa na variavel valorImg.
  // pega o evento do onchange do input, ou seja, pega o arquivo que foi inserido no input e faz o upload pro storage
  // @@entrada: o evento da anexação do arquivo
  carregarImg(event: any) {
    // pegando o arquivo que está vindo do evento (o upload da foto)
    let arquivo = event.target.files;
    // função para fazer a leitura do arquivo
    let reader = new FileReader();
    this.progresso = true;

    // função para ler o aquivo
    reader.readAsDataURL(arquivo[0]);
    // quando terminar de carregar a foto
    var nomeImg = 'thumbTurma' + Date.now();
    reader.onloadend = () => {
      // this.imagem = reader.result
      this.turmaservice.carregarImagem(nomeImg, reader.result).then((img) => {
        this.valorImg = img;
        console.log('imagemURL', this.valorImg);
        this.progresso = false;
      });
    };
  } //carregaImg

  // Função para abrir modal
  open(content: any) {
    //formato do modal
    this.modalService.open(content, { size: 'md' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  } //open

  // função do front
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  } //getDismissReason

  // Função para resetar o modal
  reseteModal() {
    this.form.reset();
    this.valorImg =
      'https://firebasestorage.googleapis.com/v0/b/soulclass-da785.appspot.com/o/thumbsCursos%2FimagemPlaceHolder.png?alt=media&token=dd504974-d86f-4179-a262-2884721e1d66';
  } //reseteModal

  // Função para abrir um dialog do Angular-Material
  openDialog() {
    const dialogRef = this.dialog.open(TurmasComponent, { width: '500px' });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  } //openDialog


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
  }//ngAfterViewInit

  // logout da aplicação
  logout() {
    this.loginservice.doLogout();
    this.route.navigate(['/']);
  }
} //classe
