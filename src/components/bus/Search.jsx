import React, { Component } from 'react'
import logo from '../../assets/img/banner.jpg'
import { Flex, DatePicker, List, WingBlank, WhiteSpace, Modal, SearchBar, Tabs, NavBar, Icon, ActivityIndicator } from 'antd-mobile'
import { Link } from 'react-router-dom'
import axios from 'axios'
import _uniq from "lodash/uniqBy"

const now = new Date()
const tabs = [
  { title: 'Domestic' },
  { title: 'Foreign' }
]

// this.onClick() onClick={ () => { props.onClick(i.cityCnName) }} has parameters placed in the arrow function or self-executing no parameters directly props.onClick
function Home(props) {
  return (
    <div style={{ 'height': props.height }}>
      {props.list.filter(item => {
        return item.country === 'CN'
      }).map(i => (
        <List.Item
          key={i.city}
          onClick={ () => { props.onClick(i.cityCnName) }}>{i.cityCnName}
          <span className="gray middleFont">({i.city})</span>
        </List.Item>
      ))}
    </div>
  )
}

function Aboard(props) {
  return (
    <div style={{ 'height': props.height }}>
      {props.list.filter(item => {
        return item.country !== 'CN'
      }).map(i => (
        <List.Item
          key={i.city}
          onClick={ () => { props.onClick(i.cityCnName) }}>{i.cityCnName}
          <span className="gray middleFont">({i.city})</span>
        </List.Item>
      ))}
    </div>
  )
}

function SearchList(props) {
  return (
    props.listData.map(i => (
      <List.Item
        key={i.city}
        onClick={() => { props.onClick(i.cityCnName) }}>{i.cityCnName}
        <span className="gray middleFont">({i.city})</span>
      </List.Item>
    ))
  )
}

function LetterList(props) {
  let arr = []
  for (let i = 0; i < 26; i++) {
    if ( i !== 8 && i !== 20 && i !== 21) {
      arr.push(String.fromCharCode(65 + i))
    }
  }

  return (
    <div className="letter_list">
      {arr.map(item => (
        <span
          key={item}
          className={item === props.curLetter ? 'curLetter' : ''}
          onClick={() => props.onClickLetter(item)}>
          {item}
        </span>
      ))}
    </div>
  )
}

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fromDate: now,
      toDate: now,
      showCountries: false,
      fromCity: 'New York',
      toCity: 'Montreal',
      allCountryList: [],
      countryList: [],
      first: true,
      searchList: [],
      curLetter: 'A',
      height: document.documentElement.clientHeight - 87, //Screen height removes two parts fixed height
      isLoading: false
    }
  }

  componentDidMount() {  //Called immediately after the component is loaded. Called after the render is suitable for the request data. Calling setState() on this method will trigger an extra render, but it will happen before the browser refreshes the screen. This guarantees that even if render() will be called twice, the user will not see the intermediate state.
    function getAllCountries () {
      return axios.post("", {
        initials: "",
        count: 9999
      })
    }
    function getACountries(params) {
      return axios.post("", {
        initials: "A",
        count: 9999
      })
    }

    axios.all([getAllCountries(), getACountries()])
      .then(axios.spread((res1, res2) => {
        this.setState({
          allCountryList: res1.data.data,
          countryList: res2.data.data
        })
      }))
      .catch(err => {
        console.log(err)
      })
  }

  clickLetter = (letter) => {  //Click to query the list of cities
    this.setState({
      isLoading: true
    })

    axios.post('', {
      initials: letter,
      count: 9999
    }).then(res => {
      let arr = _uniq(res.data.data, 'city')
      this.setState({
        countryList: arr,
        curLetter: letter,
        isLoading: false
      })
      console.log(res.data.data)
    }).catch(err => {
      console.log(err)
    })
  }

  showModal = (key, id) => (e) => {  // Click to open the search city list
    e.preventDefault() // Fix click on Android
    this.setState({
      [key]: true,
      first: id
    })
  }

  onClose = key => () => {  // Click to close the list of search cities
    this.setState({
      [key]: false,
      searchList: []
    })
  }

  choose = city => {  // Click to select a city
    if (this.state.first) {
      this.setState({
        fromCity: city,
        showCountries: false
      })
    } else {
      this.setState({
        toCity: city,
        showCountries: false
      })
    }
    this.setState({
      searchList: []
    })
  }

  changeCity = () => {  // Exchange destination
    if (this.state.fromCity === '出发地' || this.state.toCity === '目的地') {
      return
    }
    this.setState({
      fromCity: this.state.toCity,
      toCity: this.state.fromCity
    })
  }

  searchCity = (val) => {  // Search city fuzzy search
    let arr = this.state.allCountryList.filter(item => {
      return item.cityCnName.indexOf(val) !== -1
    })
    let cityArr  = _uniq(arr, "city")
    this.setState({
      searchList: cityArr
    })
  }

  search = () => {
    //console.log(this)
  }

  goBack = () => {
    this.props.history.goBack()
  }

  render() {
    return (
      <div className="search">
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={this.goBack}
        >Ticket search</NavBar>
        <header>
          <img src={logo} className="search-banner" alt="logo" width="100%"/>
        </header>
        <div style={{ backgroundColor: '#fff' }}>
          <ActivityIndicator
            toast
            text="Loading..."
            animating={this.state.isLoading} />
          <Flex className="middleFont">
            <Flex.Item
              className="center padding"
              onClick={this.showModal('showCountries', true)}>{this.state.fromCity}
            </Flex.Item>
            <Flex.Item
              className="center"
              onClick={ this.changeCity }>
              <i className="iconfont icon-jiantou1-copy"></i>
            </Flex.Item>
            <Flex.Item
              className="center padding"
              onClick={this.showModal('showCountries', false)}>{this.state.toCity}
            </Flex.Item>
          </Flex>
        </div>
        <Modal
          popup
          visible={this.state.showCountries}
          onClose={this.onClose('showCountries')}
          animationType="slide-up"
          wrapClassName="search_page" >
          <List renderHeader=
            {() =>
              <div>
                <SearchBar
                  placeholder="Enter the city you are searching for"
                  showCancelButton
                  maxLength={10}
                  onChange={this.searchCity}
                  onCancel={this.onClose('showCountries')} />
                <div className="searchList">
                  <SearchList
                    onClick={this.choose}
                    listData={this.state.searchList} />
                </div>
                <Tabs
                  tabs={tabs}
                  initialPage={0}>
                  <Home
                    onClick={ this.choose }
                    list={ this.state.countryList }
                    height={ this.state.height } />
                  <Aboard
                    onClick={ this.choose }
                    list={ this.state.countryList }
                    height={ this.state.height } />
                </Tabs>
              </div>
            }>
          </List>
          <LetterList
            onClickLetter={this.clickLetter}
            curLetter={this.state.curLetter}/>
        </Modal>
        <List>
          <DatePicker
            value={this.state.fromDate}
            mode="date"
            onChange={fromDate => this.setState({ fromDate })}>
            <List.Item arrow="horizontal" className="listItem">Departure date</List.Item>
          </DatePicker>
          {/* <DatePicker
            value={this.state.toDate}
            mode="date"
            onChange={toDate => this.setState({ toDate })}>
            <List.Item arrow="horizontal" className="listItem">Return date</List.Item>
          </DatePicker> */}
        </List>
        <WhiteSpace size="md"/>
        <WingBlank size="md">
          <Link to='/list' className="am-button am-button-primary" onClick={ this.search }>Search for</Link>
        </WingBlank>
      </div>
    )
  }
}

export default Search
