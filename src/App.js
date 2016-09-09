import React, { Component } from 'react';
import './App.css';

import * as firebase from 'firebase';

var config = {
  apiKey: "AIzaSyDa2cqIhFLUy8WYYsFS130K3E3rc2q2ZXI",
  authDomain: "lessthantime-2d347.firebaseapp.com",
  databaseURL: "https://lessthantime-2d347.firebaseio.com",
  storageBucket: "lessthantime-2d347.appspot.com",
};
firebase.initializeApp(config);

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signed: false,
      currentUser: {},
      userdata: {todos: []}
    }
  }
  login(email,password) {
    const _this = this;

    const auth = firebase.auth();
    let loginPromise = auth.signInWithEmailAndPassword(email, password);
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        _this.setState({signed: true,currentUser: user});
        const db = firebase.database();
        const usersDB = db.ref().child("users/"+user.uid);
        usersDB.on('value', (snap)=> {
          if(snap.val() === null) {
            console.log("null");
            db.ref().child("users/"+user.uid).set({
              todos: ["eat something", "edit this list"]
            })
          }
          _this.setState({
            userdata: snap.val()
          })
        })
      } else {
        _this.setState({signed: false});
        // No user is signed in.
      }
    });
  }
  _updateTodos(newtodos) {
    const db = firebase.database();
    const updates = {};
    console.log("users/"+this.state.currentUser.uid+"/todos");
    updates["users/"+this.state.currentUser.uid+"/todos"] = newtodos;
    const usersDB = db.ref().update(updates);
  }
  deleteTodo(i) {
    if(this.state.userdata.todos.length > 1) {
    let todos = this.state.userdata.todos;
    todos.splice(i,1);
    this._updateTodos(todos);
    }
    else {
      console.error("You need to leave at least one todo.");
    }
  }
  addTodo() {
    const nw = this.$todoInput.value; 
    let todos = this.state.userdata.todos;
    todos.push(nw);
    this._updateTodos(todos);
  }
  render() {
    let layout;
    if(!this.state.signed) {
      layout = (<div>
        <h1>ok</h1>
        <button onClick={this.login.bind(this,"admin@example.com", "letmein")} >Log in</button> 
      </div>)
    }
    else {
      layout = (<div>
        <h1>logged in as {this.state.currentUser.email}</h1>
        <div>
          <h3>Todos</h3>
          <input onKeyDown={(e)=> {if(e.keyCode === 13) this.addTodo() }} ref={(c)=> this.$todoInput = c} placeholder="new todo name" />
          <button onClick={this.addTodo.bind(this)} children="Add"/>
          <ul>
            {this.state.userdata.todos.map((el,ind)=> {return <li key={"todosLi"+ind}>{el}
            <button key={"todoButton"+ind} onClick={this.deleteTodo.bind(this,ind)} children="x"/>
            </li>})}
          </ul>
          
        </div>
      </div>)
    }
    return (
      <div>
      {layout}
      
      </div>
    );
  }
}


