import { wait } from '@testing-library/user-event/dist/utils';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.sass';

var server_name = "My server";
var cpu_load = 0;
var memory_usage = 0;
var memory_total = 0;
var network_sent = 0;
var network_rcv = 0;
var disk_usage = 0;
var uptime = 0;
var points = []
var service_count = 0;
var services = []
function processIncomingData(data){
    const json_data = JSON.parse(data);
    server_name = json_data.server_name;
    cpu_load = json_data.cpu_load;
    memory_usage = Math.ceil(json_data.memory_usage/1048576);
    memory_total = Math.ceil(json_data.memory_total/1048576);
    network_sent = Math.ceil(json_data.network_sent/1048576);
    network_rcv = Math.ceil(json_data.network_rcv/1048576);
    disk_usage = json_data.disk_usage;
    uptime = json_data.uptime;
    points = json_data.points;
    service_count = json_data.service_count;
    var services_data = json_data.services;
    services = []
    for(var i = 0; i < service_count; i++){
        var serv = JSON.parse(services_data[i]);
        services.push(new Service(serv.name, serv.location, serv.status));
    }
}
function toPrettyTime(time){
    var days = Math.floor(time/86400);
    var hours = Math.floor((time-(days*86400))/3600);
    var minutes = Math.floor((time-(days*86400)-(hours*3600))/60);
    var seconds = time - (days*86400) - (hours*3600) - (minutes*60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

class Service {
    constructor(service_name, service_location, service_status){
        this.name = service_name;
        this.location = service_location;
        this.status = service_status;
    }
}
class StatusBar extends React.Component {
    constructor(props){
        super(props);
        this.name = props.name;
        this.location = props.location;
        this.status_source = props.status_source;
        this.status = props.status;    // 1=OK, 0=FAIL
    }
    generate_indicator(status){
        if(status == 1){
            return <span class='indicator_ok'>◉ Active</span>
        } else if(status == 0){
            return <span class='indicator_fail'>◉ Inactive</span>
        } else {
            return <span class='indicator_fail'>◉ Invalid respone</span>
        }
    }
    render(){
        return (
            <div>
                <div class='status-bar'>
                    <span class='name'>{this.name}</span>
                    <span class="location_container"><span class='location'>{this.location}</span></span>
                    <span class="indicator_container">{this.generate_indicator(this.status)}</span>
                </div>
            </div>
        )
    }
}
class StatusPanel extends React.Component {
    constructor(props){
        super(props);
        this.services = props.services;
    }
    render(){
        return (
            services.map(function(i_service){
                return <StatusBar name={i_service.name} location={i_service.location} status={i_service.status}/>
            })
        )
    }
}
class PrettyGraph extends React.Component {
    constructor(props){
        super(props);
        this.pts = "";
    }
    render(){
        this.pts = `10,${points[0]} 70,${points[1]} 130,${points[2]} 190,${points[3]} 250,${points[4]} 310,${points[5]} 370,${points[6]} 430,${points[7]} 490,${points[8]} 550,${points[9]} 610,${points[9]}`
        return (
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="140" version="1.1" viewBox="0 0 640 140">
                    <text x="0" y="15" fontSize="13">CPU %</text>
                    <text x="610" y="125" fontSize="13">Time</text>
                    <g transform="translate(0,120) scale(1,-1)">
                        <line x1="10" y1="0" x2="10" y2="100" stroke="#ababab" stroke-width="3"/>
                        <line x1="10" y1="0" x2="610" y2="0" stroke="#ababab" stroke-width="3"/>
                        <line x1="10" y1="10" x2="610" y2="10" stroke="#ababab" />
                        <line x1="10" y1="20" x2="610" y2="20" stroke="#ababab" />
                        <line x1="10" y1="30" x2="610" y2="30" stroke="#ababab" />
                        <line x1="10" y1="40" x2="610" y2="40" stroke="#ababab" />
                        <line x1="10" y1="50" x2="610" y2="50" stroke="#ababab" />
                        <line x1="10" y1="60" x2="610" y2="60" stroke="#ababab" />
                        <line x1="10" y1="70" x2="610" y2="70" stroke="#ababab" />
                        <line x1="10" y1="80" x2="610" y2="80" stroke="#ababab" />
                        <line x1="10" y1="90" x2="610" y2="90" stroke="#ababab" />
                        <line x1="10" y1="100" x2="610" y2="100" stroke="#ababab" />
                        <line x1="70" y1="0" x2="70" y2="100" stroke="#ababab" />
                        <line x1="130" y1="0" x2="130" y2="100" stroke="#ababab" />
                        <line x1="190" y1="0" x2="190" y2="100" stroke="#ababab" />
                        <line x1="250" y1="0" x2="250" y2="100" stroke="#ababab" />
                        <line x1="310" y1="0" x2="310" y2="100" stroke="#ababab" />
                        <line x1="370" y1="0" x2="370" y2="100" stroke="#ababab" />
                        <line x1="430" y1="0" x2="430" y2="100" stroke="#ababab" />
                        <line x1="490" y1="0" x2="490" y2="100" stroke="#ababab" />
                        <line x1="550" y1="0" x2="550" y2="100" stroke="#ababab" />
                        <polyline points={this.pts} fill="none" stroke="#053c5e" stroke-width="2" />
                    </g>
                </svg> 
            </div>
        )
    }
}
class ServerStatus extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div class="server_statistics_bar">
                <img src="img/server.png" class="icon"></img><span class="name">Server: </span><span class="value">{server_name}</span>
                <br></br>
                <img src="img/processor.png" class="icon"></img><span class="name">CPU: </span><span class="value">{cpu_load}%</span>
                <br></br>
                <img src="img/memory.png" class="icon"></img><span class="name">RAM: </span><span class="value">{memory_usage} / {memory_total} Mb ({Math.ceil(memory_usage/(memory_total/100))}%)</span>
                <br></br>
                <img src="img/uptime.png" class="icon"></img><span class="name">Uptime: </span><span class="value">{toPrettyTime(uptime)}</span>
            </div>
        )
    }
}
class App extends React.Component {
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div class="main_container">
                <h1>Python_B's status panel</h1>
                <p>
                    Welcome to Python_B's status panel. Written in React as study-project.
                    <br></br>
                    It displays status of my pet projects, and where they are hosted.
                    <br></br>
                    Is it Pentagon-level safe to do so ? Sure thing no. Does it look cool ? Absolutely.
                </p>
                <hr></hr>
                <StatusPanel/>
                <hr></hr>
                <h3>Server vitals</h3>
                <p>
                    <ServerStatus/>
                    <PrettyGraph/>
                </p>
                
            </div>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", "https://pythonb.xyz:3000/stats", false ); // false for synchronous request
xmlHttp.send( null );
processIncomingData(xmlHttp.responseText);
root.render(<App/>);

function tick(){
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://pythonb.xyz:3000/stats", false ); // false for synchronous request
    xmlHttp.send( null );
    processIncomingData(xmlHttp.responseText);
    root.render(<App/>)
}
setInterval(tick, 10000);
