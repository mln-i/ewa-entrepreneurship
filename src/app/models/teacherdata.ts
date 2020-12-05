export class TeacherData {
  constructor(
    public user_id: number,
    public email: string,
    public first_name: string,
    public last_name: string,
    public role: string,
    public class_id: number,
    public class_name: string
  ) {}
}
