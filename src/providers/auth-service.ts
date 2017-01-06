import { Injectable } from '@angular/core';
//import {App, Platform, NavController, Alert} from 'ionic-framework/ionic';
//import {Http, Headers} from 'angular2/http';
import { NavController } from 'ionic-angular';
import {Http, Headers} from '@angular/http';
import {HomePage} from "../pages/home/home";


@Injectable()
@Injectable()
export class AuthService {
  private http;
  private nav;
  private isLoggedin;

  static get parameters() {
    return [[Http], [NavController]];
  }

  constructor(http, navcontroller) {
    this.http = http;
    this.nav = navcontroller;
    this.isLoggedin = false;
  }

  login(user) {
    console.log('logging in');
    var headers = new Headers();
    var creds = "username=" + user.name + "&password=" + user.password;
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return new Promise(resolve => {

      this.http.post('http://userservice.staging.tangentmicroservices.com:80/api-token-auth/', creds, {headers: headers}).subscribe(data => {
        console.log(data);
        if (data.status === 200) {
          window.localStorage.setItem('token', data.json().token);

          this.isLoggedin = true;
          this.nav.setRoot(HomePage);
        }
        if(data.status === 200){
          return "error";
        }
        resolve(this.isLoggedin);

      },
        err => {
          // Log errors if any
          console.log(err);
          return err;
        }
      );

    });


  }

  checkAuth(){
    return window.localStorage.getItem("token");
  }

  logout() {
    this.isLoggedin = false;
    window.localStorage.clear();
  }

}
