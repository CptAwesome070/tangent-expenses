import { Injectable } from '@angular/core';
import {Http, RequestOptions, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import "rxjs";
import {SQLite} from "ionic-native";

@Injectable()
export class DBService {

  public database: SQLite;
  public expenses: Array<Object>;

  constructor(public http: Http) {

  }

  getExpenses(){

    this.database = new SQLite();
    this.database.openDatabase({name: "data.db", location: "default"}).then(() => {
      this.refresh();
    }, (error) => {
      console.log("ERROR: ", error);
    });
    this.expenses = this.dummyExpenses();
    return this.expenses;
  }

  dummyExpenses(){
    this.expenses = [];
    this.expenses.push({date: "2016-12-20",description:"newExp", items: {items:[{description:"desc1", total:55, colour: "#fff"},{description:"Desc 2", total:12, colour: "#fff"}], total: 158}, image: "", status: "new"});
    this.expenses.push({date: "2016-12-18",description: "oldExp", items: {items:[{description:"desc1", total:55, colour: "#fff"},{description:"Desc 2", total:12, colour: "#fff"}], total: 53 }, image: "", status: "sent"});
    return this.expenses
  }

  public refresh() {
    this.database.executeSql("SELECT * FROM expenses", []).then((data) => {
      this.expenses = [];
      //console.log("data:");
      console.log(data);
      if(data.rows.length > 0) {
        for(var i = 0; i < data.rows.length; i++) {
          this.expenses.push({date: data.rows.item(i).date, description: data.rows.item(i).description, items: data.rows.item(i).expense, image: data.rows.item(i).image, status: data.rows.item(i).status});
        }
      }
    }, (error) => {
      console.log("ERROR: " + JSON.stringify(error));
    });
  }

  public add() {
    this.database.executeSql("INSERT INTO expenses (date, description, expense, image, status) VALUES ('', '','', '')", []).then((data) => {
      console.log("INSERTED: " + JSON.stringify(data));
      return "success";
    }, (error) => {
      console.log("ERROR: " + JSON.stringify(error.err));
      return "error";
    });
  }



}

