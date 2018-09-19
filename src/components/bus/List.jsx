import React, { Component } from "react"
import ReactDOM from "react-dom"
import {
  Flex,
  WhiteSpace,
  ListView,
  WingBlank,
  Modal,
  NavBar,
  Icon,
  Calendar,
  ActivityIndicator
} from "antd-mobile"

import Bar from "./sub_component/Bar"
import axios from "axios"
import moment from "moment"

function BusTravel(props) {
  return (<div className="listingProper" onClick={
    () => {
      props.click(props.busData)
    }
  }>
    <WhiteSpace size="lg" />
    <Flex key={props.busData.departures} className="middleFont">
      <Flex.Item className="center">
      <div className="bigFont" > {props.busData.departure_time} </div>
      <div className="gray" > {props.busData.displayedDepartureLocation}</div>
      </Flex.Item>
      <Flex.Item className="center">
        <div className="littleFont"> {props.busData.time} </div>
        <div>
          <i className="iconfont icon-jiantou" />
        </div>
      </Flex.Item > <Flex.Item className="center" >
        <div className="bigFont" > {props.busData.arrival_time} </div>
        <div className="gray"> {props.busData.displayedArrivalLocation} </div>
      </Flex.Item > <Flex.Item className="center" >
        <div className="highlight bigFont" > {`CAD${props.busData.prices.total }`} </div> <WhiteSpace size="md" />
        <div className="infoColor smallFont" > {props.busData.available_seats === "F" ? "Full" : `${props.busData.available_seats} Seats Remaining`
        } </div> </Flex.Item > </Flex> <WhiteSpace size="md" />
    <WingBlank size="lg" >
      <div className="highGray" > {props.busData.displayedOperator} {"| "} {props.busData.displayedBusClass1} {"- "} {props.busData.displayedBusClass2}</div>

    </WingBlank >
    <WhiteSpace size="lg" />
  </div>
  )
}

function Policy(props) {
  return (<div className="gray" style={{ height: 260, overflow: "scroll" }} >
    <Flex >
      <Flex.Item className="padding littleFont" > Tax Fare(Dollar) </Flex.Item>
      <Flex.Item className="padding" >
        <div> Adult Price </div>
        <div className="normalColor"> {props.oneData.adultPrice + props.oneData.adultTax} </div>
      </Flex.Item >
      <Flex.Item className="padding" >
        <div> Child Price </div>
        <div className="normalColor" > {props.oneData.childPrice + props.oneData.childTax} </div>
      </Flex.Item >
    </Flex>
    <Flex >
      <Flex.Item className="padding littleFont" > Refund Rule </Flex.Item>
      {props.refund.map(item => {
        return (<Flex.Item className="smallFont" key={item.explain} >
          <div > {item.explain} </div>
          <div className="normalColor littleFont" > {item.amount === -1 ? "By airline regulations" : item.amount} </div>
        </Flex.Item >
        )
      })
      } </Flex>
    <Flex >
      <Flex.Item className="padding littleFont" > Change Rule </Flex.Item> {
        props.change.map(item => {
          return (<Flex.Item className="smallFont" key={item.explain} >
            <div> {item.explain} </div> <div className="normalColor littleFont" > {item.amount === -1 ? "By airline regulations" : item.amount} </div>
          </Flex.Item >
          )
        })
      }
    </Flex>
    <Flex >
      <Flex.Item className="padding littleFont" > Baggage Allowance Rule </Flex.Item>
      <Flex.Item className="smallFont" >
        <div > Whether to Provide </div> <div className="normalColor" > {props.baggageRules.hasBaggage ? "Yes" : "No"} </div>
      </Flex.Item >
      <Flex.Item className="smallFont" >
        <div > Details </div>
        <div className="normalColor" > {`${props.baggageRules.bagCount} Object ${props.baggageRules.bagWeight}Kg`} </div>
      </Flex.Item >
    </Flex>
  </div >
  )
}

class Lists extends Component {
  constructor(props) {
    super(props)
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    })
    this.state = {
      dataSource,
      isLoading: true,
      height: document.documentElement.clientHeight,
      listData: [],
      showRules: false,
      showCalendar: false,
      baggageRules: {},
      change: [],
      refund: [],
      priceOrder: 0,
      timeOrder: 0,
      startTime: moment()
//        .add(7, "days")
        .format("YYYY-MM-DD"),
      singleData: {}
    }
  }

  timeFormat(value) {
    const arr = value.slice(-8)
    return arr
  }

  busTravelDistanceEvaluation(h_A, h_D, m_A, m_D) {
    h_A = parseInt(h_A.slice(11, 13), 10)
    h_D = parseInt(h_D.slice(11, 13), 10)
    let h_Evaluated = h_A - h_D
    if (h_Evaluated >= 10) {
      if (h_Evaluated > 0) {
        h_Evaluated = h_Evaluated + ''
      } else {
        h_Evaluated =  60 + h_Evaluated
      }
    } else {
      if (h_Evaluated > 0) {
        h_Evaluated = "0" + h_Evaluated + ''
      } else {
        h_Evaluated = "0" + ( 60 + h_Evaluated )
      }
    }
    m_A = parseInt(m_A.slice(14, 16), 10)
    m_D = parseInt(m_D.slice(14, 16), 10)
    let m_Evaluated = m_A - m_D
    if (m_Evaluated.length === 2) {
      if (m_Evaluated > 0) {
        m_Evaluated = m_Evaluated + ''
      } else {
        m_Evaluated =  60 + m_Evaluated
      }
    } else {
      if (m_Evaluated > 0) {
        m_Evaluated =  m_Evaluated + ''
      } else {
        m_Evaluated =  60 + m_Evaluated
      }
    }
    return h_Evaluated + 'h ' + m_Evaluated + 'm'
  }

/*  timeFormat(value) {
    const arr = value.split("").slice(-4)
    arr.splice(2, 0, ":")
    return arr.join("")
  }
*/

  duration(totalTime) {
    return (
      Math.floor(totalTime / 60) +
      "h" +
      (totalTime % 60 === 0 ? "" : (totalTime % 60) + "m")
    )
  }

  priceFormatted(value) {
    return (
      value + "CAD"
    )
  }

  formatTicket(ticket) {
    //Format ticket data
    const result = []
    const ruleArr = ticket.split(";")
    ruleArr.forEach(item => {
      if (item === "-") {
        result.push({ count: 0, weight: 0 })
      } else {
        result.push({ count: item.split("-")[0], weight: item.split("-")[1] })
      }
    })
    return result
  }

  showModal = key => e => {
    //Open calendar and bus rules
    e.preventDefault()
    this.setState({
      [key]: true
    })
  }

  onClose = key => () => {
    this.setState({
      [key]: false
    })
  }

  onPress = () => {
    // Order interface Routing parameters (Bus rules)
    this.setState({
      showRules: false
    })
    this.props.history.push({
      pathname: "/order",
      state: { data: this.state.singleData }
    })
  }

  openRules = data => {
// Show travel specs
//   const ticket = this.formatTicket(data.ticket_types)
    const ticket = this.data.departures.ticket_types
    data.rule.bagCount = ticket.total
    data.rule.bagWeight = ticket.breakdown
    this.setState({
      showRules: true,
      baggageRules: data.rule,
      change: data.rule.change,
      refund: data.rule.refund,
      singleData: data
    })
  }

  openCalendar = () => {
    // Open calendar
    this.setState({
      showCalendar: true
    })
  }

  onCancel = () => {
    //document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY
    this.setState({
      showCalendar: false
    })
  }

  onConfirm = startTime => {
    //Modified date re-query
    //document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY
    this.setState({
      showCalendar: false,
      startTime: moment(startTime).format("YYYY-MM-DD"),
      isLoading: true
    })
    this.getList(moment(startTime).format("YYYYMMDD"))
  }

  goBack = () => {
    this.props.history.goBack()
  }

  getSortedList = (sortedList, priceOrder, timeOrder) => {
    // Subcomponent call update list
    let listData = sortedList
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(listData),
      listData,
      priceOrder,
      timeOrder
    })
  }
  getList(time) {
    const hei =
      document.documentElement.clientHeight -
      ReactDOM.findDOMNode(this.lv).parentNode.offsetTop - 86 //Remove the fixed two-part height

/*    const config = {
      headers: {
        'Accept': 'application/vnd.busbud+json; version=2; profile=https://schema.busbud.com/v2/',
        'X-Busbud-Token': 'PARTNER_AHm3M6clSAOoyJg4KyCg7w',
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
      }
    }
*/
    axios
      .get("api_model.json", /*config,*/ {
        tripType: 1,
        fromCity: "HGH",
        toCity: "TAO",
        fromDate: time,
        retDate: "",
        adultNum: 1,
        childNum: 0
      })
      .then(res => {
        let listData = res.data.data.departures
        console.log(listData)
        let busLocations = res.data.data.locations
        let busOperators = res.data.data.operators
        listData.forEach(item => {
 //       item.time = this.duration(200)
          item.time = this.busTravelDistanceEvaluation(item.arrival_time, item.departure_time, item.arrival_time, item.departure_time)
          item.departure_time = this.timeFormat(item.departure_time)
          item.arrival_time = this.timeFormat(item.arrival_time)
          busLocations.forEach(line => {
            if (line.id === item.origin_location_id) {
              item.displayedDepartureLocation = line.name
            }
            else if (line.id === item.destination_location_id) {
              item.displayedArrivalLocation = line.name
            }
          })
          busOperators.forEach(busOperator => {
            if (busOperator.source_id === item.source_id) {
              item.displayedOperator = busOperator.name
              item.displayedBusClass1 = busOperator.amenities.classes.Normal.display_name
              item.displayedBusClass2 = busOperator.amenities.classes.Economy.display_name
            }
          })
        })
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(listData),
          isLoading: false,
          height: hei,
          listData: listData,
          priceOrder: 0,
          timeOrder: 0,
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  onScroll(e) {
    const top = e.target.scrollTop
    console.log(top)
  }

  componentDidMount() {
    this.getList(moment(this.state.startTime).format("YYYYMMDD"))
  }

  render() {
    const separator = (sectionID, rowID) => (
      <div key={rowID} style={{ borderTop: "3px solid #ECECED" }}/>
    )
    let length = this.state.listData.length,
    row,
    index = 0
    if (index < 0) {
      row = () => {
        return <div className="center" > No Results </div>
      }
    } else {
      row = (rowData, sectionID, rowID) => {
        if (index < length) {
          const obj = this.state.listData[index]
          index++
          return <BusTravel busData={obj} click={this.openRules} />
        }
      }
    }

    return (
      <div className="listing">
        <div className="logo" ></div >
        <NavBar
          mode="light"
          icon={< Icon type="left" />}
          onLeftClick={this.goBack} >
          <div className="destinationTitle" >
          New York < i className="iconfont icon-jiantou1-copy" /> Montreal
          </div>
          <div onClick={this.openCalendar} className="calendarTop" >
          Modify Bus Ticket Date
        <div className="calendarTopTime" > {this.state.startTime} </div>
        </div >
        </NavBar>
        <ListView
          ref={el => (this.lv = el)}
          dataSource={this.state.dataSource}
          onScroll={this.onScroll}
          renderFooter={() => (<div className="center" > {this.state.isLoading ? "Loading..." : "All available bus departures are displayed"} </div>)}
          renderRow={row}
          renderSeparator={separator}
          style={{
            height: this.state.height,
            overflow: "auto"
          }}
        />
        <Calendar
          type="one"
          visible={this.state.showCalendar}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          defaultDate={new Date(this.state.startTime)}
          defaultValue={
            [new Date(this.state.startTime)]
          }
        />
        <Bar
          loading={this.state.isLoading}
          priceOrder={this.state.priceOrder}
          timeOrder={this.state.timeOrder}
          list={this.state.listData}
          onClick={this.getSortedList.bind(this)}
        />
        <ActivityIndicator
          toast text="Loading..."
          animating={this.state.isLoading}
        />
        <Modal
          wrapClassName="ruleModal"
          visible={this.state.showRules}
          transparent onClose={this.onClose("showRules")}
          title="See Details"
          footer={
            [{ text: "Confirm Order", onPress: this.onPress }]
          } >
          <Policy oneData={this.state.singleData}
            refund={this.state.refund}
            change={this.state.change}
            baggageRules={this.state.baggageRules}
          />
        </Modal >
      </div>
    )
  }
}
export default Lists