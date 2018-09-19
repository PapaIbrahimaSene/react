import React, { Component } from 'react'
import {
  Flex,
  Menu,
  ActivityIndicator,
  LocaleProvider
} from 'antd-mobile'
import en_US from 'antd-mobile/lib/locale-provider/en_US'


// List condition filtering
const data = [
  {
    value: '1',
    label: 'Cabin',
    children: [
      {
        label: 'Economy Class',
        value: '1',
      },
      {
        label: 'Business Class',
        value: '2',
      }, {
        label: 'First Class',
        value: '3',
      }],
  }, {
    value: '2',
    label: 'Departure Time',
    children: [
      {
        label: '00:00-06:00',
        value: '1',
      }, {
        label: '06:00-12:00',
        value: '2',
      }, {
        label: '12:00-18:00',
        value: '3',
      }, {
        label: '18:00-24:00',
        value: '4',
      }],
  },
  {
    value: '3',
    label: 'Arrival',
    children: [
      {
        label: 'Montreal Station',
        value: '1',
      },
    ],
  },
  {
    value: '4',
    label: 'Departure',
    children: [
      {
        label: 'New York Station',
        value: '1',
      },
    ],
  },
  {
    value: '5',
    label: 'Bus Company',
    children: [
      {
        label: 'Bus Co Limited',
        value: '1',
      },
    ],
  },
]

/* const dataButtons = [
  {
    value: '1',
    label: 'Cancel My Travel'
  }, {
    value: '2',
    label: 'My Bus Travel Choice'
  }
]
*/

function PriceCom(props) {
  if (props.priceOrder === 1) {
    return (
      <div className="highlight">
        <i className="iconfont icon-paixu-sheng"></i>Low -> High
      </div>
    )
  }
  else if (props.priceOrder === 2) {
    return (
      <div className="highlight">
        <i className="iconfont icon-paixu-jiang"></i>High -> Low
      </div>
    )
  }
  else {
    return (
      <div>
        <i className="iconfont icon-paixu1"></i> Price
      </div>
    )
  }
}

class Bar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startTime: props.time,
      priceOrder: props.priceOrder,
      timeOrder: props.timeOrder,
      show: false,
      initData: ''
    }
  }

  // GetDerivedStateFromProps will be called when the component is instantiated and when a new property is accepted. It should return an object to update the state, or return null to indicate that the new property does not need to update any state.
  // As long as the parent component is re-rendered, these lifecycle functions are called, regardless of whether these props are "different" from the previous one. Because of this, it is not safe to use any one to uncover the cover state unconditionally. Doing so will result in a loss of status updates.
  static getDerivedStateFromProps(nextProps, prevState) {
    return { listData: nextProps.lists, priceOrder: nextProps.priceOrder, timeOrder: nextProps.timeOrder }
  }

  // Conditional screening
  handleCondition = (e) => {
    e.preventDefault()
    this.setState({
      show: !this.state.show,
    })
    if (!this.state.initData) {
      setTimeout(() => {
        this.setState({
          initData: data,
        })
      }, 300)
    }
  }
  onChange = (value) => {
  }
  onOk = (value) => {
    this.onCancel()
  }
  onCancel = () => {
    this.setState({ show: false })
  }
  onMaskClick = () => {
    this.setState({
      show: false,
    })
  }

  priceSort = (sort) => {
    let priceOrder
    if (sort === 0) {
      this.setState({ //Ascending
        priceOrder: 1,
        timeOrder: 0
      })
      priceOrder = 1
    }
    if (sort === 1) { //Descending
      this.setState({
        priceOrder: 2,
        timeOrder: 0
      })
      priceOrder = 2
    }
    if (sort === 2) { //Default
      this.setState({
        priceOrder: 1,
        timeOrder: 0
      })
      priceOrder = 1
    }
    let listData = [...this.props.list]
    listData.sort((obj1, obj2) => {
      let a = obj1['adultPrice'] + obj1['adultTax']
      let b = obj2['adultPrice'] + obj2['adultTax']
      if (sort === 0 || sort === 2) { //Ascending
        return a - b
      } else {
        return b - a
      }
    })
    this.props.onClick(listData, priceOrder, 0)  // onClick = { this.getSortedList.bind(this) }
  }

  timeSort = (sort) => {
    let timeOrder
    if (sort === 0) {
      this.setState({ //Ascending
        timeOrder: 1,
        priceOrder: 0
      })
      timeOrder = 1
    }
    else if (sort === 1) { //Descending
      this.setState({
        timeOrder: 2,
        priceOrder: 0
      })
      timeOrder = 2
    }
    else if (sort === 2) { //Default
      this.setState({
        timeOrder: 1,
        priceOrder: 0
      })
      timeOrder = 1
    }
    let listData = [...this.props.list]
    listData.sort((obj1, obj2) => {
      let a = obj1.busData.departure_time
      let b = obj2.busData.arrival_time
      if (sort === 0 || sort === 2) { //Ascending
        return a - b
      } else {
        return b - a
      }
    })
    this.props.onClick(listData, 0, timeOrder)
  }

  render() {
    const { initData, show } = this.state
    const menuEl = (

      <Menu
        className="multi-foo-menu"
        data={initData}
        onChange={this.onChange}
        onOk={this.onOk}
        onCancel={this.onCancel}
        height={document.documentElement.clientHeight * 0.4}
        multiSelect
        style={{bottom: 0}}
      />
    )
    const loadingEl = (
      <div className="loading_icon" style={{ height: document.documentElement.clientHeight * 0.4 }}>
        <ActivityIndicator size="large" />
      </div>
    )
    return (
      <div>
        <Flex className={this.props.loading ? 'bar' : 'bar animate'}>
          <Flex.Item
            className="center littlePadding"
            onClick={this.handleCondition}>
            <i className="iconfont icon-shaixuan"></i>Filter
          </Flex.Item>
          <Flex.Item
            className="center littlePadding"
            onClick={ () => this.priceSort(this.state.priceOrder)}>
            <PriceCom priceOrder={this.state.priceOrder}></PriceCom>
          </Flex.Item>
          <Flex.Item
            className={this.state.timeOrder !== 0 ? 'highlight center littlePadding' : 'center littlePadding'}
            onClick={ () => this.timeSort(this.state.timeOrder)}>
            <i className="iconfont icon-web-icon-"></i>
            {this.state.timeOrder === 2 ? 'Late -> Early' : this.state.timeOrder === 1 ? 'Early -> Late' : 'Departure Time'}
          </Flex.Item>
        </Flex>
        <LocaleProvider locale={en_US}>
        <div className={show ? 'multi-menu-active' : ''}>
          {show ? initData ? menuEl : loadingEl : null}
          {show ? <div className="menu-mask" onClick={this.onMaskClick} /> : null}
        </div>
        </LocaleProvider>
      </div>
    )
  }
}
export default Bar


