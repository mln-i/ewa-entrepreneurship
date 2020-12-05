export class Mooc {
  constructor(
    public id: number,
    public unique_id: string,
    public title: string,
    public description: string,
    public image: string,
    public url: string,
    public show_on_top: number,
    public show_hide: number,
    public competences: string,
    public deleted: number
  ) {}
}
