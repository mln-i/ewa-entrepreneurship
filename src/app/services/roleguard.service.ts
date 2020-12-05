import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Userdata } from "../models/userdata";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class RoleGuard {
  user = new Userdata(
    null, //firstname
    null, //lastname
    null, //email
    null, //classname
    null, //role
    null, //teacher
    null //class
  );

  constructor(private router: Router, private _http: HttpClient) {}

  checkAuthorizationBasedOnRole() {
    if (localStorage.getItem("currentUser")) {
      let token = localStorage.getItem("currentUser");
      let jwtData = token.split(".")[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      let email = decodedJwtData.sub;
      var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;

      this._http.get<any>(_getUserIdUrl).subscribe(response => {
        var _getUserUrl = "http://localhost:8080/api/users/user/" + response;

        this._http.get<any>(_getUserUrl).subscribe(response => {
          switch (response.role) {
            case "Student":
              this.router.navigateByUrl("/studenthome");
              break;
            case "Teacher":
              this.router.navigateByUrl("/teacherhome");
              break;
            case "Admin":
              this.router.navigateByUrl("/adminhome");
              break;
            default:
              this.router.navigateByUrl("**");
              break;
          }
        });
      });
    } else {
      this.router.navigateByUrl("/login");
    }
  }
}
