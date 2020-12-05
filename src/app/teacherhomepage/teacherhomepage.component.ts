import { Component, OnInit, ElementRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Chart } from "chart.js";
import "chartjs-plugin-datalabels";

import { ToastrService } from "ngx-toastr";
import { NavbarService } from "../services/navbar.service";

import { Userdata } from "../models/userdata";
import { Competence } from "../models/competence";
import { AdditonalVideos } from "../models/additionalvideos";
import { RoleGuard } from "../services/roleguard.service";
import { Class } from "../models/class";
import { TokenService } from "../services/token.service";
import { UserClassData } from "../models/userclassdata";

@Component({
  selector: "app-teacherhomepage",
  templateUrl: "./teacherhomepage.component.html",
  styleUrls: ["./teacherhomepage.component.scss"]
})
export class TeacherhomepageComponent implements OnInit {
  // String variables for filtering content
  public searchStringDescription: string;
  public searchStringTitle: string;
  public searchStringStudentFirstName: string;
  public searchStringStudentLastName: string;
  public searchStringResultsFirstName: string;
  public searchStringResultsClassName: string;

  // All Arrays
  studentList: Userdata[] = new Array();
  videosList: AdditonalVideos[] = new Array();
  competenceList: Competence[] = new Array();
  classList: Class[] = new Array();
  score: number[] = new Array();
  scoreCompareResults: number[] = new Array();
  subCompetences: String[] = new Array();
  resultDates: string[] = new Array();
  studentCountList: number[] = new Array();

  // All Models
  userData = new Userdata(null, null, null, null, null, null, null);
  videos = new AdditonalVideos(null, null, null, null, null, null);
  classModel = new Class(null, null, null);
  userClassData = new UserClassData(null, null);

  // Attributes modal video edit
  modalVideoId: number;
  modalVideoTitle: string;
  modalVideoCompetence: string;
  modalVideoDescription: string;
  modalVideoUrl: string;
  additionalVideosObject: AdditonalVideos;

  // Attributes modal user edit
  modalUserId: number;
  modalUserEmail: string;
  modalUserFirstName: string;
  modalUserLastName: string;
  modalUserRole: string;

  // Attributes modal class edit
  modalClassId: number;
  modalClassName: string;
  modalClassUserId: number;

  totalStudentsFound: number = 0;
  selectedTestDateFirstDropdown: string = "Select Test Result Date";
  selectedTestDateSecondDropdown: string = "Select Test Result Date";
  resultsStudentChart: any;

  constructor(
    public navbar: NavbarService,
    private token: TokenService,
    private _http: HttpClient,
    private toastr: ToastrService,
    private roleguard: RoleGuard
  ) { }

  ngOnInit() {
    this.navbar.show();
    this.roleguard.checkAuthorizationBasedOnRole();
    this.loadStudentList();
    this.loadCompetences();
    this.loadVideoList();
    this.getSubCompetences();
    this.retrieveListOfClasses();
  }

  loadCompetences() {
    var _getAllCompetences = "http://localhost:8080/api/competences";
    var promiseCompetences = this._http.get<any>(_getAllCompetences);

    promiseCompetences
      .toPromise()
      .then(response => {
        // Get all users and seperate students from teachers
        for (let index = 0; index < response.length; index++) {
          let competenceObject = new Competence(
            response[index][0],
            response[index][1],
            response[index][2]
          );
          this.competenceList.push(competenceObject);
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  loadStudentList() {
    var _getAllUsers = "http://localhost:8080/api/users";
    var promiseUsers = this._http.get<any>(_getAllUsers);

    promiseUsers
      .toPromise()
      .then(response => {
        // Get all students
        for (let index = 0; index < response.length; index++) {
          let userObject = new Userdata(
            response[index][0],
            response[index][1],
            response[index][2],
            response[index][3],
            response[index][4],
            response[index][5],
            response[index][6]
          );

          if (
            response[index][4] === "Student" &&
            response[index][5] === "Yes"
          ) {
            this.studentList.push(userObject);
            this.totalStudentsFound += 1;
          }
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  // Method to load all the videos from the backend with a get method.
  loadVideoList() {
    // Url
    var _getAllVideos = "http://localhost:8080/api/additionalvideos/list";
    // Promise
    var promiseVideos = this._http.get<any>(_getAllVideos);

    promiseVideos
      .toPromise()
      .then(response => {
        // Get all videos
        for (let index = 0; index < response.length; index++) {
          let videoObject = new AdditonalVideos(
            response[index][0],
            response[index][1],
            response[index][2],
            response[index][3],
            response[index][4],
            response[index][5]
          );

          // Pushes the videoObject.
          this.videosList.push(videoObject);
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  insertVideo() {
    // Backend url this will be used to establish a connection with the back end.
    var _AdditionalVideo = "http://localhost:8080/api/additionalvideo/video/insert/";

    // Post request this variable uses the url and video model
    var promise = this._http.post(_AdditionalVideo, this.videos);

    promise
      .toPromise()
      .then(response => {
        this.toastr.success(
          "The video was successfully added. Refreshing...",
          "Success!"
        );
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      })
      // Catches the error
      .catch(error => {
        this.toastr.error("no response from server" + this.videos);
      });
  }

  loadUserDataEdit(userId: number) {
    this.studentList.forEach(element => {
      if (element.id === userId) {
        this.modalUserId = element.id;
        this.modalUserFirstName = element.first_name;
        this.modalUserLastName = element.last_name;
        this.modalUserEmail = element.email;
        this.modalUserRole = element.role;
      }
    });
  }

  loadUserDataResults(userId: number) {
    this.studentList.forEach(element => {
      if (element.id === userId) {
        this.modalUserId = element.id;
        this.modalUserFirstName = element.first_name;
        this.modalUserLastName = element.last_name;
        this.modalUserEmail = element.email;
      }
    });

    this.getTestResultsDates(this.modalUserId);
  }

  loadSelectedVidEdit(videoId: number) {
    let list = this.videosList;

    list.forEach(element => {
      if (element.id == videoId) {
        this.modalVideoId = element.id;
        this.modalVideoTitle = element.title;
        this.modalVideoCompetence = element.competence;
        this.modalVideoDescription = element.description;
        this.modalVideoUrl = element.url;
        this.additionalVideosObject = element;
      }
    });
  }

  updateVideo() {
    this.videos.id = this.modalVideoId;
    this.videos.title = (<HTMLInputElement>(
      document.getElementById("videoTitle")
    )).value;
    this.videos.description = (<HTMLInputElement>(
      document.getElementById("videoDescription")
    )).value;
    this.videos.url = (<HTMLInputElement>(
      document.getElementById("videoUrl")
    )).value;
    this.videos.competence = (<HTMLInputElement>(
      document.getElementById("manageVideoCompetences")
    )).value;

    var _updateAdditionalVideo =
      "http://localhost:8080/api/additionalvideo/video/update/" + this.videos.id;
    var promise = this._http.put<any>(_updateAdditionalVideo, this.videos);

    if (
      this.videos.title === null ||
      this.videos.description === null ||
      this.videos.url === null ||
      this.videos.competence == null
    ) {
      this.toastr.error("All fields are required!", "Saving failed!");
    } else {
      promise
        .toPromise()
        .then(response => {
          this.toastr.success(
            "Changes successfully saved. Refreshing...",
            "Success!"
          );
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        })
        .catch(error => {
          this.toastr.error("No response from the server.", "Response fail!");
        });
    }
  }

  deleteAdditionalVideo() {
    this.videos.id = this.modalVideoId;
    var _deleteVideo = "http://localhost:8080/api/additionalvideo/delete/" + this.videos.id;
    var promise = this._http.delete<any>(_deleteVideo);

    promise
      .toPromise()
      .then(response => {
        this.toastr.success(
          "video deleted successfully. Refreshing...",
          "Success!"
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  updateUser() {
    this.userData.id = this.modalUserId;
    this.userData.email = this.modalUserEmail;
    this.userData.first_name = this.modalUserFirstName;
    this.userData.last_name = this.modalUserLastName;
    this.userData.role = this.modalUserRole;

    var _updateUser = "http://localhost:8080/api/users/user/" + this.userData.id;
    var promise = this._http.put<any>(_updateUser, this.userData);

    if (
      this.userData.email === null ||
      this.userData.first_name === null ||
      this.userData.last_name === null ||
      this.userData.role == null
    ) {
      this.toastr.error("All fields are required!", "Saving failed!");
    } else {
      promise
        .toPromise()
        .then(response => {
          this.toastr.success(
            "User Changes successfully saved. Refreshing...",
            "Success!"
          );

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch(error => {
          this.toastr.error("No response from the server.", "Response fail!");
        });
    }
  }

  deleteUser() {
    this.userData.id = this.modalUserId;

    var _deleteUser = "http://localhost:8080/api/users/user/" + this.userData.id;
    var promise = this._http.delete<any>(_deleteUser);

    promise
      .toPromise()
      .then(response => {
        this.toastr.success(
          "User deleted successfully. Refreshing...",
          "Success!"
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  getSubCompetences() {
    var _getSubCompetencesUrl = "http://localhost:8080/api/competences/sub-competences";

    this._http.get<any>(_getSubCompetencesUrl).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        this.subCompetences.push(response[i][1]);
      }
    });
  }

  getTestResultsDates(userId: number) {
    while (this.resultDates.length > 0) {
      this.resultDates.pop();
    }

    var _getResultDates = "http://localhost:8080/api/results/dates/user/" + userId;

    this._http.get<any>(_getResultDates).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        this.resultDates.push(response[i]);
      }

      if (this.resultDates.length > 0) {
        // On click view results, show instantly most recent results
        this.getResultsSelectedDateDropdownOne(this.resultDates[0]);
      }
    });

    setTimeout(() => {
      var ctx = document.getElementById("resultsStudentChart");

      this.resultsStudentChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
          labels: this.subCompetences,
          datasets: [
            {
              label: "Competence Score",
              backgroundColor: [
                "rgba(54, 162, 225, 1.0)",
                "rgba(54, 162, 225, 1.0)",
                "rgba(54, 162, 225, 1.0)",
                "rgba(54, 162, 225, 1.0)",
                "rgba(54, 162, 225, 1.0)",
                "rgba(153, 102, 225, 1.0)",
                "rgba(153, 102, 225, 1.0)",
                "rgba(153, 102, 225, 1.0)",
                "rgba(153, 102, 225, 1.0)",
                "rgba(153, 102, 225, 1.0)",
                "rgba(225, 159, 64, 1.0)",
                "rgba(225, 159, 64, 1.0)",
                "rgba(225, 159, 64, 1.0)",
                "rgba(225, 159, 64, 1.0)",
                "rgba(225, 159, 64, 1.0)"
              ],
              data: this.score
            },
            {
              label: "Competence Score",
              backgroundColor: [
                "rgba(54, 162, 225, 0.5)",
                "rgba(54, 162, 225, 0.5)",
                "rgba(54, 162, 225, 0.5)",
                "rgba(54, 162, 225, 0.5)",
                "rgba(54, 162, 225, 0.5)",
                "rgba(153, 102, 225, 0.5)",
                "rgba(153, 102, 225, 0.5)",
                "rgba(153, 102, 225, 0.5)",
                "rgba(153, 102, 225, 0.5)",
                "rgba(153, 102, 225, 0.5)",
                "rgba(225, 159, 64, 0.5)",
                "rgba(225, 159, 64, 0.5)",
                "rgba(225, 159, 64, 0.5)",
                "rgba(225, 159, 64, 0.5)",
                "rgba(225, 159, 64, 0.5)"
              ],
              data: this.scoreCompareResults
            }
          ]
        },
        options: {
          plugins: {
            datalabels: {
              display: false,
              align: "center",
              anchor: "center",
              color: "#FFFFFF",
              font: {
                style: "bold"
              }
            }
          },
          legend: { display: false },
          title: {
            display: true,
            text: "Progress Overview"
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ],
            xAxes: [
              {
                ticks: {
                  display: true,
                  min: 0
                }
              }
            ]
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }, 1000);
  }

  getResultsSelectedDateDropdownOne(dateFinished: string) {
    while (this.score.length > 0) {
      this.score.pop();
    }

    const TOTAL_MAIN_COMPETENCES = 3;
    this.selectedTestDateFirstDropdown = dateFinished;

    var _getUserResultsUrl = "http://localhost:8080/api/results/dates/date/" + dateFinished +
      "/user/" + this.modalUserId;

    this._http.get<any>(_getUserResultsUrl).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        if (i >= TOTAL_MAIN_COMPETENCES) {
          this.score.push(response[i][2]);
        }
      }
      this.resultsStudentChart.update();
    });
  }

  getResultsSelectedDateDropdownTwo(dateFinished: string) {
    while (this.scoreCompareResults.length > 0) {
      this.scoreCompareResults.pop();
    }

    const TOTAL_MAIN_COMPETENCES = 3;
    this.selectedTestDateSecondDropdown = dateFinished;

    var _getUserResultsUrl = "http://localhost:8080/api/results/dates/date/" + dateFinished +
      "/user/" + this.modalUserId;

    this._http.get<any>(_getUserResultsUrl).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        if (i >= TOTAL_MAIN_COMPETENCES) {
          this.scoreCompareResults.push(response[i][2]);
        }
      }
      this.resultsStudentChart.update();
    });
  }

  resetChartDataAndDropdown() {
    while (this.score.length > 0) {
      this.score.pop();
    }

    while (this.scoreCompareResults.length > 0) {
      this.scoreCompareResults.pop();
    }

    while (this.resultDates.length > 0) {
      this.resultDates.pop();
    }

    this.selectedTestDateFirstDropdown = "Select Test Result Date";
    this.selectedTestDateSecondDropdown = "Select Test Result Date";
  }

  createClass() {
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let email = decodedJwtData.sub;
    var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;
    var _createClassUrl = "http://localhost:8080/api/class";

    this._http.get<any>(_getUserIdUrl).subscribe(response => {
      var _getUserUrl = "http://localhost:8080/api/users/user/" + response;

      this._http.get<any>(_getUserUrl).subscribe(response => {
        let classObject = new Class(
          null,
          this.classModel.class_name,
          response.id
        );

        this._http.post<any>(_createClassUrl, classObject).subscribe(
          data => {
            this.toastr.success(
              "Changes successfully saved. Refreshing...",
              "Success!"
            );
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          },
          error =>
            this.toastr.error("No response from the server.", "Response fail!")
        );
      });
    });
  }

  updateClass() {
    var classId = this.modalClassId;
    var userId = this.modalClassUserId;
    var _updateClassUrl = "http://localhost:8080/api/class/" + classId;
    let classObject = new Class(classId, this.classModel.class_name, userId);

    this._http.put<any>(_updateClassUrl, classObject).subscribe(
      response => {
        this.toastr.success(
          "Changes successfully saved. Refreshing...",
          "Success!"
        );
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      },
      error =>
        this.toastr.error("No response from the server.", "Response fail!")
    );
  }

  retrieveListOfClasses() {
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let email = decodedJwtData.sub;
    var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;
    // var _createClassUrl = "http://localhost:8080/api/class";

    this._http.get<any>(_getUserIdUrl).subscribe(response => {
      var _getUserUrl = "http://localhost:8080/api/users/user/" + response;

      this._http.get<any>(_getUserUrl).subscribe(response => {
        var _retrieveClassesUrl =
          "http://localhost:8080/api/class/list/teacher/" + response.id;

        this._http.get<any>(_retrieveClassesUrl).subscribe(response => {
          for (var i = 0; i < response.length; i++) {
            let classObject = new Class(
              response[i].class_id,
              response[i].class_name,
              response[i].user_id
            );
            this.classList.push(classObject);
          }
          this.getStudentsFromSameClass();
        });
      });
    });
  }

  addStudentToClass() {
    var userId = this.modalUserId;
    var _addStudentToClassUrl = "http://localhost:8080/api/users/user/" + userId + "/class";

    let userClassObject = new UserClassData(
      this.modalUserId,
      this.userClassData.class_name
    );

    this._http.put<any>(_addStudentToClassUrl, userClassObject).subscribe(
      response => {
        this.toastr.success(
          "Student successfully added to class. Refreshing...",
          "Success!"
        );

        setTimeout(() => {
          window.location.reload();
        }, 2500);
      },
      error =>
        this.toastr.error("No response from the server.", "Response fail!")
    );
  }

  loadSelectedClassEdit(classId: number) {
    for (var i = 0; i < this.classList.length; i++) {
      if (this.classList[i].class_id === classId) {
        this.modalClassId = this.classList[i].class_id;
        this.modalClassName = this.classList[i].class_name;
        this.modalClassUserId = this.classList[i].user_id;
      }
    }
  }

  getStudentsFromSameClass() {
    for (var i = 0; i < this.classList.length; i++) {
      var _getStudentsFromSameClassUrl =
        "http://localhost:8080/api/users/class/" + this.classList[i].class_name;

      this._http.get<any>(_getStudentsFromSameClassUrl).subscribe(response => {
        this.studentCountList.push(response.length);
      });
    }
  }

  attachUserIdToAdditionalVideo() {
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let email = decodedJwtData.sub;
    var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;

    this._http.get<any>(_getUserIdUrl).subscribe(response => {
      this.videos.user_id = response;

      this.insertVideo();
    });
  }
}
