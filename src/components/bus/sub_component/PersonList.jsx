import React, { Component } from "react"
import { List, InputItem, Button, Flex, Modal, SwipeAction, Picker, DatePicker, Checkbox } from "antd-mobile"
import { createForm } from "rc-form"
import axios from "axios"
import moment from "moment"

let Mock = require("mockjs")

const CheckboxItem = Checkbox.CheckboxItem
const gender = [
  {
    label: "Male",
    value: "0"
  },
  {
    label: "Female",
    value: "1"
  }
]

function PersonList(props) {
  if (props.list.length === 0) {
    return <div className="center padding gray">No passenger information</div>
  }
  //onChange={this.props.checkStatusClick}
  return props.list.map((person, index) => (
    <SwipeAction
      style={{ backgroundColor: "gray" }}
      autoClose
      key={person.id}
      right={[
        {
          text: "delete",
          onPress: () => props.deleteHandler(index, person),
          style: { backgroundColor: "#F4333C", color: "white" }
        },
        {
          text: "Edit",
          onPress: () => props.editHandler(person),
          style: { backgroundColor: "#108ee9", color: "white" }
        }
      ]}
    >
      <CheckboxItem onChange={() => props.onChange(person)}>
        {person.name}
        <List.Item.Brief>{person.idCardNumber}</List.Item.Brief>
      </CheckboxItem>
    </SwipeAction>
  ))
}

function PersonInput(props) {
  return (
    <div style={{ overflow: "scroll" }}>
      <List>
        <InputItem
          placeholder="Please type in your name"
          value={props.personInfo.name}
          clear
          onChange={props.onChange("name")}
        >
          Name
        </InputItem>
        <Picker
          data={gender}
          cols={1}
          value={[props.personInfo.gender]}
          onChange={props.onChange("gender")}
        >
          <List.Item arrow="horizontal">Gender</List.Item>
        </Picker>
        <DatePicker
          value={props.personInfo.birthDate}
          mode="date"
          title="Choose date of birth"
          minDate={moment()
            .subtract(100, "years")
            .toDate()}
          maxDate={new Date()}
          onChange={props.onChange("birthDate")}
        >
          <List.Item arrow="horizontal" className="listItem">
            Date of Birth
          </List.Item>
        </DatePicker>
        <Picker
          data={props.cardTypes}
          cols={1}
          value={[props.personInfo.idCardType]}
          onChange={props.onChange("idCardType")}
        >
          <List.Item arrow="horizontal">type of certificate</List.Item>
        </Picker>
        <DatePicker
          value={props.personInfo.idCardExpired}
          mode="date"
          minDate={new Date()}
          maxDate={moment()
            .add(100, "years")
            .toDate()}
          title="Select the validity period of the document"
          onChange={props.onChange("idCardExpired")}
        >
          <List.Item arrow="horizontal" className="listItem">
            Validity of documents
          </List.Item>
        </DatePicker>
        <InputItem
          placeholder="Please enter the ID number"
          value={props.personInfo.idCardNumber}
          clear
          onChange={props.onChange("idCardNumber")}
        >
          ID number
        </InputItem>
        <InputItem
          placeholder="Please enter phone number"
          value={props.personInfo.phone}
          clear
          onChange={props.onChange("phone")}
        >
          phone number
        </InputItem>
        <InputItem
          placeholder="please enter your email"
          value={props.personInfo.email}
          clear
          onChange={props.onChange("email")}
        >
          mailbox
        </InputItem>
        <InputItem
          placeholder="Please enter nationality"
          value={props.personInfo.national}
          clear
          onChange={props.onChange("national")}
        >
          Country of Citizenship
        </InputItem>
      </List>
    </div>
  )
}

class BusTravelInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showPersonInfo: false,
      cardType: [],
      personInfo: {},
      isAdd: false
    }
  }

  componentDidMount() {
    axios
      .post("") // Get the document type
      .then(res => {
        res.data.data.forEach(item => {
          item.label = item.name
          delete item.name
        })
        this.setState({
          cardType: res.data.data
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  validatePhone = (rule, value, callback) => {
    if (/^1[3|4|5|7|8]\d{1}\s\d{4}\s\d{4}$/.test(value)) {
      callback()
    } else {
      callback(new Error("Enter your mobile number correctly"))
    }
  }

  delete = (index, person) => {
    //Delete person Return parent component
    let beforeList = [...this.props.list]
    beforeList.splice(index, 1)
    this.props.getPersonListClick(beforeList)
  }

  submit = info => {
    //personInfo saves the commit information back to the parent component
    let beforeList = [...this.props.list]
    if (this.state.isAdd) {
      info.id = Mock.Random.integer()
      beforeList.push(info)
      this.setState({
        showPersonInfo: false
      })
    } else {
      this.setState({
        showPersonInfo: false,
        personInfo: info
      })
      beforeList.forEach((item, index) => {
        if (item.id === info.id) {
          beforeList.splice(index, 1, info)
        }
      })
    }
    this.props.getPersonListClick(beforeList) //getPersonListClick={ (list) => this.getPersonList(list) }
  }

  edit = info => {
    //person
    let cur_info = { ...info }
    this.setState({
      showPersonInfo: true,
      personInfo: cur_info,
      isAdd: false
    })
  }

  addNewPerson = () => {
    this.setState({
      isAdd: true,
      showPersonInfo: true,
      personInfo: {
        idCardType: "NI",
        gender: "0",
        selected: false
      }
    })
  }

  handleChange = input => e => {
    //Personnel information modification
    let obj = []
    if (input === "gender" || input === "idCardType") {
      obj[input] = e[0]
    } else {
      obj[input] = e
    }
    this.setState({
      personInfo: Object.assign(this.state.personInfo, obj)
    })
  }

  onClose = key => () => {
    this.setState({
      [key]: false
    })
  }

  render() {
    const { getFieldProps, getFieldError } = this.props.form
    return (
      <form style={{ marginBottom: "40px" }}>
        <List
          renderHeader={
            <Flex>
              <Flex.Item>Bus Travel attendant information</Flex.Item>
              <Flex.Item className="right">
                <div onClick={this.addNewPerson}>
                  <Button type="ghost" size="small" inline>
                  New passenger
                  </Button>
                </div>
              </Flex.Item>
            </Flex>
          }
        >
          <PersonList
            deleteHandler={this.delete}
            editHandler={this.edit}
            onChange={this.props.checkStatusClick}
            list={this.props.list}
          />
        </List>
        <List
          renderHeader={() => "Contact Information"}
          renderFooter={() =>
            getFieldError("phone") && getFieldError("phone").join(",")
          }
        >
          <InputItem
            {...getFieldProps("contactName")}
            placeholder="Please enter a contact name"
          >
            姓名
          </InputItem>
          <InputItem
            {...getFieldProps("phone", {
              rules: [
                { required: true, message: "Please input phone" },
                { validator: this.validatePhone }
              ]
            })}
            clear
            error={!!getFieldError("phone")}
            onErrorClick={() => {
              alert(getFieldError("phone").join("、"))
            }}
            placeholder="Please enter a contact number"
            type="phone"
          >
            手机号
          </InputItem>
        </List>
        <Modal
          visible={this.state.showPersonInfo}
          transparent
          title="Modify information"
          footer={[
            {
              text: "cancel",
              onPress: () => {
                this.onClose("showPersonInfo")()
              }
            },
            {
              text: "Confirm",
              onPress: () => {
                this.submit(this.state.personInfo)
              }
            }
          ]}
          wrapClassName="personModal"
        >
          <PersonInput
            cardTypes={this.state.cardType}
            personInfo={this.state.personInfo}
            onChange={this.handleChange}
          />
        </Modal>
      </form>
    )
  }
}

const BasicInputWrapper = createForm()(BusTravelInfo)

export default BasicInputWrapper
