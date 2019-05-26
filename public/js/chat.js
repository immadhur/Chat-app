const socket = io();

//Elements
const $messageForm = document.getElementById('form');
const $welcome = document.getElementById('welcome');
const $sendLocation = document.getElementById('send-location');
const $sendMessage = document.getElementById('send');
const $messageBox = document.getElementById('message');
const $showMessage = document.getElementById('showMessage');
const $sidebar = document.getElementById('sideBar');

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $messageFromTemplate = document.querySelector('#messageFrom-template').innerHTML;
const $locationTemplate = document.getElementById('location-template').innerHTML;
const $sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

var myUserName='';

socket.on('welcome', () => {
    // document.getElementById('welcome').innerHTML = 'Welcome!';
})

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (msg) => {
    console.log(msg);
})

socket.on('getLocation', (url) => {
    const html = Mustache.render($locationTemplate, { url });
    console.log(url);
    $showMessage.insertAdjacentHTML('beforeend', html);
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
})

$sendLocation.addEventListener('click', () => {
    $sendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('location', {
            lat: pos.coords.latitude,
            long: pos.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled');
        })
    })
})

const autoScrolling=()=>{
    const lastMsg=$showMessage.lastElementChild;
    const msgHeight=lastMsg.offsetHeight+ parseInt(getComputedStyle(lastMsg).marginBottom);


    const visibleHeight=$showMessage.offsetHeight;
    const totalheight=$sendMessage.scrollHeight;

    const scrolledHeight = $showMessage.scrollTop + visibleHeight;

    if((totalheight-msgHeight) <= scrolledHeight){
        // $showMessage.scrollTop=$showMessage.scrollHeight;
        lastMsg.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    }
}

$sendMessage.addEventListener('click', () => {
    const msg = $messageBox.value;
    if(msg.length==0)
        return;
    $messageForm.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', msg, (error) => {
        $messageBox.value = "";
        $messageBox.focus();
        $messageForm.removeAttribute('disabled');
        if (error) {
            return;
        }
        console.log('Delivered!');
    });
})

socket.on('displayMsg', ({
    msg,
    createdAt,
    username
}) => {
    if(username==myUserName){
        const html = Mustache.render($messageFromTemplate, {
            msg,
            createdAt,
            username
        });
        $showMessage.insertAdjacentHTML('beforeend', html);
        autoScrolling();
    }
    else{
        const html = Mustache.render($messageTemplate, {
            msg,
            createdAt,
            username
        });
        $showMessage.insertAdjacentHTML('beforeend', html);
        autoScrolling();
    }
    
})

socket.on('showUsers', ({room, users})=>{
    const html=Mustache.render($sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML=html; 
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert('User already exists!');
        location.href='/';
    }
    myUserName=username;
});