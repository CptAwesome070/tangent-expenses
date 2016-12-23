import { Component } from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {SQLite} from "ionic-native";
import {HomePage} from "../home/home";
import {AuthService} from "../../providers/auth-service";
import {DBService} from "../../providers/db-service";
import {MailService} from "../../providers/mail-service";
import {LoginPage} from "../login/login";



@Component({
  selector: 'page-expenses',
  templateUrl: 'expenses.html',
  providers: [DBService, AuthService,MailService]
})
export class ExpensesPage {


  public expenses: Array<Object>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform,private dbService: DBService
    , private authService: AuthService, private mailService: MailService) {
    if(!authService.checkAuth()){
      this.navCtrl.setRoot(LoginPage);
    }
    this.platform.ready().then(() => {
      this.expenses = dbService.getExpenses();
      console.log(this.expenses);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExpensesPage');
  }


  public newExpense(){
    this.navCtrl.push(HomePage);
  }

  public sendExpense(expense){
    this.mailService.sendExpense(expense);
  }

}
