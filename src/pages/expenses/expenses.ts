import { Component } from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {SQLite} from "ionic-native";
import {HomePage} from "../home/home";

@Component({
  selector: 'page-expenses',
  templateUrl: 'expenses.html'
})
export class ExpensesPage {

  public database: SQLite;
  public expenses: Array<Object>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform) {
    this.platform.ready().then(() => {
      this.database = new SQLite();
      this.database.openDatabase({name: "data.db", location: "default"}).then(() => {
        this.refresh();
      }, (error) => {
        console.log("ERROR: ", error);
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExpensesPage');
  }

  public refresh() {
    this.database.executeSql("SELECT * FROM expenses", []).then((data) => {
      this.expenses = [];
      console.log(data);
      if(data.rows.length > 0) {
        for(var i = 0; i < data.rows.length; i++) {
          this.expenses.push({date: data.rows.item(i).date, items: data.rows.item(i).expense, image: data.rows.item(i).image, status: data.rows.item(i).status});
        }
      }
    }, (error) => {
      console.log("ERROR: " + JSON.stringify(error));
    });
  }


  public add() {
    this.database.executeSql("INSERT INTO expenses (date, expense, image, status) VALUES ('', '','', '')", []).then((data) => {
      console.log("INSERTED: " + JSON.stringify(data));
    }, (error) => {
      console.log("ERROR: " + JSON.stringify(error.err));
    });
  }

  public newExpense(){
    this.navCtrl.push(HomePage);
  }


}
