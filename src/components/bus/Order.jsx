import React, { Component } from 'react'
import { NavBar, Icon, List, Button, Flex, Modal, Steps } from 'antd-mobile'
import BasicInputWrapper from './sub_component/PersonList'
import _pullAll from 'lodash/pullAll'
import moment from 'moment'
import axios from 'axios'

const Item = List.Item
const Brief = Item.Brief
const Step = Steps.Step

let Mock = require('mockjs')
// let data = Mock.mock({
//     'list|1-3': [{
//         'id|1-100.2': 1,
//         'name|1': ['Passenger Name 1', 'Passenger Name 2', 'Passenger Name 3', 'Passenger Name 4'],
//         'birthDate|1': [new Date('2006-7-24'), new Date('1993-11-10'), new Date('2008-7-25')],
//         'idCardType|1': 'NI',
//         'idCardNumber|1':'3306821999111230424',
//         'idCardExpired|1': [new Date('2022-7-24'), new Date('2023-11-10'), new Date('2024-7-25')],
//         'gender|1': ['0', '1'],
//         'phone': /^1[0-9]{10}$/,
//         'email|1': Mock.mock('@EMAIL()'),
//         'national|1': ['Senegal', 'Canada', 'China'],
//         'seleted': false
//     }]
// })

// Mock.mock(rurl, template)
Mock.mock('data.json', {
  "list|1-3": [
    {
      "id|1-100.2": 1,
      'name|1': ['Passenger Name 1', 'Passenger Name 2', 'Passenger Name 3'],
      "birthDate|1": [
        new Date("2006-7-24"),
        new Date("1993-11-10"),
        new Date("2008-7-25")
      ],
      "idCardType|1": "NI",
      "idCardNumber|1": "3306821999111230424",
      "idCardExpired|1": [
        new Date("2022-7-24"),
        new Date("2023-11-10"),
        new Date("2024-7-25")
      ],
      "gender|1": ["0", "1"],
      phone: /^1[0-9]{10}$/,
      "email|1": Mock.mock("@EMAIL()"),
      'national|1': ['Senegal', 'Canada', 'China'],
      seleted: false
    }
  ]
})

function BusTravelDetail(props) {
  return (
    <div style={{ overflow: 'scroll' }}>
      <Steps className="left">
        <Step
          title={
            <div style={{ fontWeight: "normal" }}>
              {props.detail.fromSegments[0].depAirport}
              <span className="highlight"> {props.timeFormat(props.detail.fromSegments[0].depTime)}</span>
            </div>}
          description={
            <div className="gray smallFont">
              <div></div>
              <div>{props.detail.fromSegments[0].flightNumber} {props.detail.fromSegments[0].canbinClass === 1 ? 'Economy Class' : 'Business Class'}</div>
              <div>{props.detail.fromSegments[0].carrierCN}</div>
            </div>}
          icon={<i className="iconfont bigFont icon-qifei"></i>} />
        <Step
          title={
            <div style={{ fontWeight: "normal" }}>
              {props.detail.fromSegments[0].arrAirport}
              <span className="highlight">{props.timeFormat(props.detail.fromSegments[0].arrTime)}</span>
            </div>}
          icon={<i className="iconfont bigFont icon-jiangluo"></i>} />
      </Steps>
    </div>
  )
}

class Order extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orderData: props.location.state.data,
      showPriceDetail: false,
      showBusTravelDetail: false,
      priceArr: [
        {
          label: "Adult tax-included price",
          value: props.location.state.data.adultPrice + props.location.state.data.adultTax
        },
        {
          label: "Child tax included",
          value: props.location.state.data.childPrice + props.location.state.data.childTax
        }
      ],
      adult: 0,
      child: 0,
      total: 0,
      personList: [],
      selectedPersonList: []
    }
  }

  componentDidMount () {
    axios.get("data.json")
      .then(data => {
        this.setState({
          personList: data.data.list
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  goBack = () => {
    this.props.history.goBack()
  };

  showModal = key => e => {
    // Show Bus price details
    e.preventDefault()
    this.setState({
      [key]: true
    })
  };

  onClose = key => () => {
    this.setState({
      [key]: false
    })
  };

  timeFormat = time => {
    return `${time.substr(8, 2)}:${time.substr(10, 2)} ${time.substr(
      0,
      4
    )}.${time.substr(4, 2)}.${time.substr(6, 2)}`
  };

  checkBoxChange = item => {
    //Bus Travel crew change
    item.seleted = !item.seleted
    if (item.seleted) {
      this.state.selectedPersonList.push(item)
    } else {
      _pullAll(this.state.selectedPersonList, [item])
    }

    this.calculateTotal(this.state.selectedPersonList)
  };

  calculateTotal = list => {
    // Calculate the total price of the final selectedPersonList
    var adult = 0,
      child = 0
    list.forEach(item => {
      if (
        moment(item.birthDate).isBefore(moment().subtract(12, "year"), "day")
      ) {
        adult++
      } else {
        child++
      }
    })
    this.setState({
      selectedPersonList: list,
      adult: adult,
      child: child,
      total:
        adult * this.state.priceArr[0].value +
        child * this.state.priceArr[1].value
    })
  };

  getPersonList = list => {
    // Call the modified subagent list for the subcomponent
    this.setState({
      personList: list
    })
    let tempList = [] // Recalculate after deleting and modifying information in the subcomponent
    list.forEach(item => {
      if (item.seleted) {
        tempList.push(item)
      }
    })
    this.setState({
      selectedPersonList: tempList
    })
    this.calculateTotal(tempList)
  };

  render() {
    return (
      <div>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={this.goBack}
        >
          杭州 <i className="iconfont icon-jiantou1-copy" /> 青岛
        </NavBar>
        <List>
          <Item
            arrow="horizontal"
            thumb="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=14950970,2601553202&fm=27&gp=0.jpg"
            multipleLine
            onClick={this.showModal("showBusTravelDetail")}
          >
            {" "}
            杭州 <i className="iconfont icon-jiantou1-copy" /> 青岛
            <Brief>
              {this.state.orderData.fromSegments[0].depEasyTime} -{" "}
              {this.state.orderData.fromSegments[0].arrEasyTime}
            </Brief>
          </Item>
        </List>
        <BasicInputWrapper
          list={this.state.personList}
          selectedList={this.state.selectedPersonList}
          checkStatusClick={this.checkBoxChange}
          getPersonListClick={list => this.getPersonList(list)}
        />
        <Modal
          visible={this.state.showBusTravelDetail}
          transparent
          onClose={this.onClose("showBusTravelDetail")}
          title="Bus Travel details"
          footer={[{ text: "Confirm", onPress: this.onClose("showBusTravelDetail") }]}
          wrapClassName="flightModal"
        >
          <BusTravelDetail
            detail={this.state.orderData}
            timeFormat={this.timeFormat}
          />
        </Modal>
        <Flex className="orderBar">
          <Flex.Item
            className="center largeFont"
            onClick={this.showModal("showPriceDetail")}
          >
            ￥ {this.state.total}
          </Flex.Item>
          <Flex.Item
            className="center"
            onClick={() => {
              console.log("pay")
            }}
          >
            <Button type="primary">Go to pay</Button>
          </Flex.Item>
        </Flex>
        <Modal
          popup
          wrapClassName="wrapClass"
          visible={this.state.showPriceDetail}
          onClose={this.onClose("showPriceDetail")}
          animationType="slide-up"
        >
          <List renderHeader={() => "Price details(unit:CAD)"}>
            {this.state.priceArr.map((i, index) => (
              <Item
                className="listItem"
                key={index}
                extra={
                  <div>
                    <b>{i.value}</b> *{" "}
                    <span>
                      {index === 0 ? this.state.adult : this.state.child}
                    </span>
                  </div>
                }
              >
                {i.label}
              </Item>
            ))}
            <Item
              className="listItem"
              extra={<b className="highlight">USD{this.state.total}</b>}
            >
              Total
            </Item>
          </List>
        </Modal>
      </div>
    )
  }
}


export default Order