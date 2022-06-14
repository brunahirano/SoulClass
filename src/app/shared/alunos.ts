export class Aluno {
  key: string;
  id?: string;
  nome: string;
  email: string;
  dataCriacao: any;
  dataModificacao: any

  constructor() {
    this.key = "",
    this.nome = "",
    this.email = "",
    this.dataCriacao = new Date(),
    this.dataModificacao = new Date()
  }
}
