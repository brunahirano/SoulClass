export class Turma{
  
  nome: string
  descricao: string
  foto: any
  dataCriacao: Date
  dataModificacao: Date

  constructor(){
    this.nome = ''
    this.descricao = ''
    this.foto = ''
    this.dataCriacao = new Date()
    this.dataModificacao = new Date()
  }
}
