import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ToastrService } from "ngx-toastr";
import { TokenService } from "../services/token.service";
import { NavbarService } from "../services/navbar.service";
import { AdditonalVideos } from "../models/additionalvideos";
import { RoleGuard } from "../services/roleguard.service";
import { Userdata } from "../models/userdata";
import { TeacherData } from "../models/teacherdata";

@Component({
  selector: "app-studenthomepage",
  templateUrl: "./studenthomepage.component.html",
  styleUrls: ["./studenthomepage.component.scss"]
})
export class StudenthomepageComponent implements OnInit {
  // String variables for filtering moocs
  public searchStringVideoTitle: string;
  public searchStringVideoDescription: string;
  public searchStringTitle: string;
  public searchStringMooc: string;

  // All Arrays
  moocList: any[] = new Array();
  teacherList: TeacherData[] = new Array();
  studentList: Userdata[] = new Array();

  videoListWithRecommended: any[] = new Array();
  videoListWithoutRecommended: any[] = new Array();
  videosList: AdditonalVideos[] = new Array();

  constructor(
    public navbar: NavbarService,
    private _http: HttpClient,
    private toastr: ToastrService,
    private token: TokenService,
    private roleguard: RoleGuard
  ) { }

  ngOnInit() {
    this.navbar.show();
    this.roleguard.checkAuthorizationBasedOnRole();

    this.getUserIdFromDatabase();
    this.getListOfUsers();
    this.getTeachersAndClasses();
    // this.loadVideoList();
  }

  getUserIdFromDatabase() {
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let isEmail = decodedJwtData.sub;

    var _getUserId = "http://localhost:8080/api/users/user/id/" + isEmail;
    var promise = this._http.get<any>(_getUserId);

    promise
      .toPromise()
      .then(response => {
        this.getKhanAcademyVideos(response);
        this.loadVideoList(response);
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  getKhanAcademyVideos(userId: number) {
    var _getAllVideosKhanAcademyDB =
      "http://localhost:8080/api/khanacademy/videolist/" + userId;
    var promise = this._http.get<any>(_getAllVideosKhanAcademyDB);

    promise
      .toPromise()
      .then(response => {
        for (let index = 0; index < response.length; index++) {
          // Sort video based on recommendation
          if (response[index].show_on_top === 1) {
            this.videoListWithRecommended.push(response[index]);
          } else {
            this.videoListWithoutRecommended.push(response[index]);
          }
        }
        // Concat both lists
        this.moocList = this.videoListWithRecommended.concat(
          this.videoListWithoutRecommended
        );
      })
      .catch(error => {
        // If no videos are linked do nothing
      });
  }

  // Loads additional videolist from database
  loadVideoList(userId: number) {
    // Url
    var _getAllVideos = "http://localhost:8080/api/additionalvideos/list";
    // Promise
    var promiseVideos = this._http.get<any>(_getAllVideos);

    promiseVideos
      .toPromise()
      .then(response => {
        // Get all videos
        for (let index = 0; index < response.length; index++) {
          for (var j = 0; j < this.teacherList.length; j++) {
            let videoObject = new AdditonalVideos(
              response[index][0],
              response[index][1],
              response[index][2],
              response[index][3],
              response[index][4],
              response[index][5]
            );

            var indexStudent = this.studentList.findIndex(i => i.id === userId);

            if (this.teacherList[j].user_id === response[index][5] && this.studentList[indexStudent].class_name === this.teacherList[j].class_name) {
            // Pushes the videoObject.
            this.videosList.push(videoObject);
            }
          }
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  getListOfUsers() {
    var _getAllUsersUrl = "http://localhost:8080/api/users";

    this._http.get<any>(_getAllUsersUrl).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        let userObject = new Userdata(
          response[i][0],
          response[i][1],
          response[i][2],
          response[i][3],
          response[i][4],
          response[i][5],
          response[i][6]
        );

        if (response[i][4] === "Student") {
          this.studentList.push(userObject);
        }
      }
    });
  }

  getTeachersAndClasses() {
    var _getTeachersAndClassesUrl = "http://localhost:8080/api/users/list/class/list";

    this._http.get<any>(_getTeachersAndClassesUrl).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        let userObject = new TeacherData(
          response[i][0],
          response[i][1],
          response[i][2],
          response[i][3],
          response[i][4],
          response[i][5],
          response[i][6]
        );
        this.teacherList.push(userObject);
      }
    });
  }
}
