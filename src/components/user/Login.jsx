import React, { Component } from "react"
import { InputItem, List, Button, WhiteSpace, NavBar, ActivityIndicator, Toast } from "antd-mobile"
import axios from "axios"
import _find from 'lodash/find'

let Mock = require("mockjs")

Mock.mock("user.json", {
  list: [
    {
      username: "123",
      password: "123456"
    },
    {
      username: "456",
      password: "123456"
    }
  ]
})

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      username: "",
      password: ""
    }
  }

  onChange = input => e => {
    if (input === "password") {
      this.setState({
        password: e
      })
    } else {
      this.setState({
        username: e
      })
    }
  }

  showToast = text => {
    Toast.info(text, 1)
  }

  login = () => {
    if (this.state.username && this.state.password) {
      axios.get("user.json").then(data => {
        this.setState({
          isLoading: true
        })
        let userList = data.data.list
        let obj = {
          username: this.state.username,
          password: this.state.password
        }
        if (_find(userList, obj)) {
          setTimeout(() => {
            this.props.history.push({
              pathname: "/search"
            })
          }, 2000)
        } else {
          this.showToast("The account or password is incorrect. Please re-enter")
          this.setState({
            username: '',
            password: ''
          })
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      this.showToast("Account or password cannot be empty")
    }
  }

  render() {
    return (
      <div className="login">
        <NavBar mode="light"> BusBud Ticket Reservation | Log In </NavBar>
        <div className="loginForm">
          <ActivityIndicator
            toast
            text="Loading..."
            animating={this.state.isLoading}
          />
          <List>
            <InputItem
              clear
              value={this.state.username}
              placeholder="Enter Your Username"
              onChange={this.onChange("username")}
            >
              <div className="iconfont icon-yonghu bigFont" />
            </InputItem>
            <InputItem
              clear
              placeholder="Enter Your Password"
              type="password"
              value={this.state.password}
              onChange={this.onChange("password")}
            >
              <div className="iconfont icon-mima1 bigFont" />
            </InputItem>
          </List>
          <WhiteSpace />
          <Button type="" onClick={this.login}>
            Enter
          </Button>
        </div>
      </div>
    )
  }
}

export default Login
