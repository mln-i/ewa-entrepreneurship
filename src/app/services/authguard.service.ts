import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router/src/router_state";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const redirectUrl = route["_routerState"]["url"];

    if (localStorage.getItem("currentUser")) {
      // Logged in so return true
      return true;
    }

    this.router.navigateByUrl(
      this.router.createUrlTree(["/login"], {
        queryParams: {
          redirectUrl
        }
      })
    );

    return false;
  }

  loggedOut() {
    localStorage.removeItem("currentUser");
  }
}
