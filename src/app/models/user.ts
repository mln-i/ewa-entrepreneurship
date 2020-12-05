export class User {
  constructor(
    public email: string,
    public first_name: string,
    public last_name: string,
    public password: string,
    public confirm_password: string,
    public role: string,
    public teacher: string,
    public enrollment_key: string,
    public teacher_id: number
  ) {}
}
