import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as _ from "underscore";

import { ToastrService } from "ngx-toastr";
import { NavbarService } from "../services/navbar.service";
import { RoleGuard } from "../services/roleguard.service";

import { Userdata } from "../models/userdata";
import { Competence } from "../models/competence";
import { Mooc } from "../models/mooc";
import { AdditonalVideos } from "../models/additionalvideos";
import { QuestionList } from "../models/questionlist";
import { Question } from "../models/question";

@Component({
  selector: "app-adminhomepage",
  templateUrl: "./adminhomepage.component.html",
  styleUrls: ["./adminhomepage.component.scss"]
})
export class AdminhomepageComponent implements OnInit {
  public searchStringTitle: string;
  public searchStringMooc: string;
  public searchStringTitleAdditional: string;
  public searchStringCompetenceAdditional: string;

  // All Arrays
  userList: Userdata[] = new Array();
  studentList: Userdata[] = new Array();
  teacherList: Userdata[] = new Array();
  competenceList: Competence[] = new Array();
  videosList: AdditonalVideos[] = new Array();
  subCompetenceList: Competence[] = new Array();
  questionList: QuestionList[] = new Array();

  moocList: Mooc[] = new Array();
  moocKhanAcademyList: Mooc[] = new Array();
  khanAcademyVideoListForDb: Mooc[] = new Array();

  openLearningVideoList: Mooc[] = new Array();
  openLearningDescription: string[] = new Array();
  openLearningVideoModel: Mooc[] = new Array();

  // Modal attributes for displaying mooc data
  modalMoocId: number;
  modalMoocTitle: string;
  modalMoocDescription: string;

  // Attributes modal video edit
  modalVideoId: number;
  modalVideoTitle: string;
  modalVideoCompetence: string;
  modalVideoDescription: string;
  modalVideoUrl: string;
  additionalVideosObject: AdditonalVideos;

  // Modal attributes question
  modalQuestionId: number;
  modalQuestionDescription: string;
  modalQuestionCompetence: string;

  // All Models
  userData = new Userdata(null, null, null, null, null, null, null);
  moocModel = new Mooc(null, null, null, null, null, null, null, null, null, 0);
  videos = new AdditonalVideos(null, null, null, null, null, null);
  questionModel = new QuestionList(null, null, null);

  constructor(
    public navbar: NavbarService,
    private _http: HttpClient,
    private toastr: ToastrService,
    private roleguard: RoleGuard
  ) { }

  ngOnInit() {
    this.navbar.show();
    this.roleguard.checkAuthorizationBasedOnRole();

    this.loadOverviewAccounts();
    this.loadCompetences();
    this.getKhanAcademyVideosFromDB();

    this.getOpenLearningVideo();
    this.retrieveOpenLearningVideoFromDB();
    this.loadAdditionalVideoList();
    this.loadTestQuestions();
  }

  // Loads the additionalvideolist from the backend.
  loadAdditionalVideoList() {
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

  insertAdditionalVideo() {
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
  // Updates the selected video
  updateVideo() {
    this.videos.id = this.modalVideoId;

    this.videos.title = (<HTMLInputElement>(
      document.getElementById("videoTitle1")
    )).value;
    this.videos.description = (<HTMLInputElement>(
      document.getElementById("videoDescription1")
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

  // Deletes the selected video
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

  loadOverviewAccounts() {
    var _getAllUsers = "http://localhost:8080/api/users";
    var promiseUsers = this._http.get<any>(_getAllUsers);

    promiseUsers
      .toPromise()
      .then(response => {
        // Get all users and seperate students from teachers
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
          // Skip user with role Admin
          if (userObject.role === "Student" || userObject.role === "Teacher") {
            this.userList.push(userObject);
          }

          // Determine which role the user has and add to the correct list
          switch (response[index][4]) {
            case "Student":
              this.studentList.push(userObject);
              break;
            case "Teacher":
              this.teacherList.push(userObject);
              break;
            default:
              break;
          }
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
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

  loadThirdPartyKhanAcademy() {
    var _getAllVideosKhanAcademy =
      "http://www.khanacademy.org/api/v1/topic/interviews-entrepreneurs";
    var promise = this._http.get<any>(_getAllVideosKhanAcademy);
    const DEFAULT_SHOW_HIDE_OPTION = 0;

    promise
      .toPromise()
      .then(response => {
        if (this.moocKhanAcademyList.length === 0) {
          // Get all videos
          for (let index = 0; index < response.children.length; index++) {
            let mooc = new Mooc(
              null,
              response.children[index].internal_id,
              response.children[index].title,
              response.children[index].description,
              response.children[index].icon_large,
              response.children[index].url,
              (response.children[index].showOnTop = DEFAULT_SHOW_HIDE_OPTION),
              (response.children[index].showHide = DEFAULT_SHOW_HIDE_OPTION),
              null,
              0
            );
            this.khanAcademyVideoListForDb.push(mooc);
          }
          this.saveKhanVideoToDB();

          this.toastr.warning(
            "Refreshing please wait...",
            "Receiving & Saving Data"
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          // Checking for new mooc videos
          var uniqueIdsApi = [];
          var uniqueIdsDatabase = [];

          // Get all internal ids from the API
          for (let index = 0; index < response.children.length; index++) {
            uniqueIdsApi.push(response.children[index].internal_id);
          }

          // Get all internal ids from the database
          for (let index = 0; index < this.moocKhanAcademyList.length; index++) {
            uniqueIdsDatabase.push(this.moocKhanAcademyList[index].unique_id);
          }
          // Compare both arrays and remove matches, so that new internal ids are left
          var filteredVideo = uniqueIdsApi.filter(
            internalId => !uniqueIdsDatabase.includes(internalId)
          );

          if (filteredVideo.length !== 0) {
            this.toastr.warning(
              "Refreshing please wait...",
              "Receiving New Data!"
            );

            for (let f = 0; f < filteredVideo.length; f++) {
              for (let index = 0; index < response.children.length; index++) {
                if (filteredVideo[f] === response.children[index].internal_id) {
                  let mooc = new Mooc(
                    null,
                    response.children[index].internal_id,
                    response.children[index].title,
                    response.children[index].description,
                    response.children[index].icon_large,
                    response.children[index].url,
                    DEFAULT_SHOW_HIDE_OPTION,
                    DEFAULT_SHOW_HIDE_OPTION,
                    null,
                    0
                  );
                  this.khanAcademyVideoListForDb.push(mooc);
                }
              }
            }
            this.saveKhanVideoToDB();

            setTimeout(() => {
              window.location.reload();
            }, 2500);
          }
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  saveKhanVideoToDB() {
    var config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    };
    var _saveAllVideosKhanAcademy =
      "http://localhost:8080/api/khanacademy/video";
    var promise = this._http.post<any>(
      _saveAllVideosKhanAcademy,
      this.khanAcademyVideoListForDb,
      config
    );

    promise
      .toPromise()
      .then(response => {
        // console.log(response);
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  getKhanAcademyVideosFromDB() {
    var _getAllVideosKhanAcademyDB =
      "http://localhost:8080/api/khanacademy/videolist";
    var promise = this._http.get<any>(_getAllVideosKhanAcademyDB);

    promise
      .toPromise()
      .then(response => {
        // Check if response has something, else load from API
        if (response.length == 0) {
          this.loadThirdPartyKhanAcademy();
        } else {
          // Get all videos
          for (let index = 0; index < response.length; index++) {
            let object = new Mooc(
              response[index][0],
              response[index][1],
              response[index][2],
              response[index][3],
              response[index][4],
              response[index][5],
              response[index][6],
              response[index][7],
              response[index][8],
              response[index][9]
            );
            this.moocKhanAcademyList.push(object);
            // Check if video isn't marked as deleted
            if (response[index][9] === 0) {
              this.moocList.push(object);
            }
          }
          this.loadThirdPartyKhanAcademy();
        }
      })
      .catch(error => {
        this.toastr.error("No videos found!", "Response fail!");
      });
  }

  loadMoocDataSelectedEdit(moocId: number) {
    this.moocList.forEach(element => {
      if (element.id == moocId) {
        this.modalMoocId = element.id;
        this.modalMoocTitle = element.title;
        this.modalMoocDescription = element.description;
      }
    });
  }

  saveChangesMooc() {
    this.moocModel.id = this.modalMoocId;

    let moocPlatform = this.moocList.filter(x => x.id === this.modalMoocId)[0].url;
    let checkPlatformType = new URL(moocPlatform).hostname;
    let platform;

    switch (checkPlatformType) {
      case "www.khanacademy.org":
        platform = "http://localhost:8080/api/khanacademy/update/";
        break;
      case "www.openlearning.com":
        platform = "http://localhost:8080/api/openlearning/videos/video/";
        break;
    }

    var _saveChangesMooc = platform + this.moocModel.id;
    var promise = this._http.put<any>(_saveChangesMooc, this.moocModel);

    if (
      this.moocModel.show_on_top === null ||
      this.moocModel.show_hide === null ||
      this.moocModel.competences === null
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
          }, 2000);
        })
        .catch(error => {
          this.toastr.error("No response from the server.", "Response fail!");
        });
    }
  }

  deleteMooc() {
    this.moocModel.id = this.modalMoocId;
    this.moocModel.deleted = 1;

    let moocPlatform = this.moocList.filter(x => x.id === this.modalMoocId)[0].url;
    let checkPlatformType = new URL(moocPlatform).hostname;
    let platform;

    switch (checkPlatformType) {
      case "www.khanacademy.org":
        platform = "http://localhost:8080/api/khanacademy/delete/";
        break;
      case "www.openlearning.com":
        platform =
          "http://localhost:8080/api/openlearning/videos/video/deleted/";
        break;
    }

    var _deleteMooc = platform + this.moocModel.id;
    var promise = this._http.put<any>(_deleteMooc, this.moocModel);

    promise
      .toPromise()
      .then(response => {
        this.toastr.success(
          "Video deleted successfully. Refreshing...",
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

  getOpenLearningVideo() {
    var _getOpenLearningVideoUrl =
      "https://www.openlearning.com/api/courses/list?type=free";
    const DEFAULT_SHOW_HIDE_OPTION = 0;

    this._http.get<any>(_getOpenLearningVideoUrl).subscribe(
      data => {
        for (var i = 0; i < data["courses"].length; i++) {
          this.openLearningDescription[i] = data["courses"][i]["summary"];
          let replaceHtmlRegex = /<(.*?)>/g; //pattern that matches any character between "< >"
          let replaceWhiteSpacesRegex = /^(?=\n)$|^\s*|\s*$|\n\n+/gm; //pattern that matches any trailing whitespaces
          let replaceHtmlTags = this.openLearningDescription[i].replace(replaceHtmlRegex, " ");
          let filteredDescription = replaceHtmlTags.replace(replaceWhiteSpacesRegex, " ").substring(0, 254);
          let openLearningVideoModel = new Mooc(
            i,
            null,
            data["courses"][i]["name"],
            filteredDescription,
            data["courses"][i]["image"],
            data["courses"][i]["courseUrl"],
            DEFAULT_SHOW_HIDE_OPTION,
            DEFAULT_SHOW_HIDE_OPTION,
            null,
            0
          );
          this.openLearningVideoList.push(openLearningVideoModel);
        }

        this.findOpenLearningVideoById();
      },
      error => console.log(error)
    );
  }

  saveOpenLearningVideo() {
    var _saveOpenLearningVideoUrl = "http://localhost:8080/api/openlearning/videos";
    this._http
      .post(_saveOpenLearningVideoUrl, this.openLearningVideoList)
      .subscribe(
        response => {
          // console.log("saved");
        },
        error => console.log(error)
      );
  }

  findOpenLearningVideoById() {
    let videoId = this.openLearningVideoList[1].id;
    var _findVideoByIdUrl = "http://localhost:8080/api/openlearning/videos/video/" + videoId;
    this._http.get<any>(_findVideoByIdUrl).subscribe(
      data => {
        // Populate table with openlearning videos
        this.retrieveOpenLearningVideoFromDB();
      },
      error => {
        if (error.status === 404) {
          this.saveOpenLearningVideo();
        }
      }
    );
  }

  retrieveOpenLearningVideoFromDB() {
    var _getOpenLearningVideoUrl =
      "http://localhost:8080/api/openlearning/videos/list/";
    this._http.get<any>(_getOpenLearningVideoUrl).subscribe(data => {
      for (var i = 0; i < data.length; i++) {
        this.openLearningVideoModel.push(data[i]);
        this.moocList.push(data[i]);
      }
    });
  }

  loadTestQuestions() {
    var _getTestQuestionsUrl = "http://localhost:8080/api/questions";
    var _getSubCompetencesUrl = "http://localhost:8080/api/competences/sub-competences";
    let competenceNameList: string[] = new Array();

    this._http.get<any>(_getSubCompetencesUrl).subscribe(data => {
      for (var i = 0; i < data.length; i++) {
        let subCompetenceModel = new Competence(
          data[i][0],
          data[i][1],
          data[i][2]
        );
        this.subCompetenceList.push(subCompetenceModel);
      }

      this._http.get<any>(_getTestQuestionsUrl).subscribe(data => {
        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < this.subCompetenceList.length; j++) {
            if (data[i][2] === this.subCompetenceList[j].competence_id) {
              competenceNameList.push(this.subCompetenceList[j].competence);
            }
          }

          let questionModel = new QuestionList(
            data[i][0], //question_id
            data[i][1], //description_text
            competenceNameList[i]
          );
          this.questionList.push(questionModel);
        }
      });
    });
  }

  questionSubmit() {
    let questionObject;
    var _createQuestionUrl = "http://localhost:8080/api/questions";

    // Get id of selected competence
    for (var i = 0; i < this.competenceList.length; i++) {
      if (this.questionModel.competence === this.competenceList[i].competence) {
        // console.log(this.competenceList[i].competence_id);
        questionObject = new Question(
          null,
          this.questionModel.description_text,
          this.competenceList[i].competence_id
        );
      }
    }

    this._http.post<any>(_createQuestionUrl, questionObject).subscribe(
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
  }

  updateQuestion() {
    let questionObject;
    var questionId = this.modalQuestionId;
    var questionDescription = this.modalQuestionDescription;
    var questionCompetence = this.modalQuestionCompetence;
    var _updateQuestionUrl = "http://localhost:8080/api/questions/question/" + questionId;

    if (this.questionModel.competence === questionCompetence) {
      this.toastr.warning("Competence is already linked to Question");
    } else {
      for (var i = 0; i < this.competenceList.length; i++) {
        if (
          this.questionModel.competence === this.competenceList[i].competence
        ) {
          questionObject = new Question(
            questionId,
            questionDescription,
            this.competenceList[i].competence_id
          );
        }
      }

      this._http.put<any>(_updateQuestionUrl, questionObject).subscribe(
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
    }
  }

  loadSelectedQuestion(QuestionId: number) {
    for (var i = 0; i < this.questionList.length; i++) {
      if (this.questionList[i].question_id === QuestionId) {
        this.modalQuestionDescription = this.questionList[i].description_text;
        this.modalQuestionId = this.questionList[i].question_id;
        this.modalQuestionCompetence = this.questionList[i].competence;
      }
    }
  }
}
