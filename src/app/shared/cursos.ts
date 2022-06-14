export class Curso{

  key?: string
  nome: string
  descricao: string
  foto: any
  dataCriacao?: Date
  dataModificacao?: Date

  constructor(){
    this.key = ''
    this.nome = ''
    this.descricao = ''
    this.foto = ''
    this.dataCriacao = new Date()
    this.dataModificacao = new Date()
  }
}
