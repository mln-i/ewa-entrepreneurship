import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class TokenService {
  constructor() {}

  setToken(token: any): void {
    localStorage.setItem("currentUser", token);
  }

  isLogged() {
    return localStorage.getItem("currentUser") != null;
  }

  getToken() {
    return localStorage.getItem("currentUser");
  }

  logout() {
    // Remove user from local storage to log user out
    localStorage.removeItem("currentUser");
  }
}
