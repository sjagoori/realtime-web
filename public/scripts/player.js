console.log('player.js running')
let socket = io();
let vidId = document.getElementsByTagName('main')[0].id
let progressBarController = document.getElementById('progressBarController')
let metaData = document.getElementById('metaData')
/**
 * * Emit a joined event; join a room 
 **/
socket.emit('join', vidId);

/**
 * API related code
 **/
var tag = document.createElement('script');
let playState = false;

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    playerVars: {
      modestbranding: 1,
      controls: 0,
      autoplay: true,
      showinfo: 0
    },
    height: '390',
    width: '640',
    videoId: vidId,
    origin: 'http://example.com',
    events: {
      'onReady': onPlayerReady,
    }
  })
}

function handlePlayer() {
  setInterval(function () {
    let position = player.getCurrentTime() / player.getDuration() * 100
    document.getElementById('progressBar').addEventListener('click', e => {
      // ???
      let seekTo = e.offsetX / e.target.offsetWidth * player.getDuration()
      console.log('seekTo', e)
      // console.log('seekTo', seekTo)
      player.seekTo(seekTo)
      socket.emit('state', { id: vidId, playing: true, timestamp: seekTo, room: vidId });
      // ???
    })
    console.log(player.getCurrentTime())
    progressBarController.style.left = position + '%'
  }, 200);
}

let playButton = document.getElementById('playButton').addEventListener('click', e => {
  playState ? (pauseVideo(), e.target.textContent = '▶️') : (startVideo(), e.target.textContent = '⏸️');
})
/**
* 
* * IFRAME EVENTS
* 
**/
function onPlayerReady(event) {
  handlePlayer()

  let title = document.createElement('span')
  title.textContent = event.target.getVideoData().title
  metaData.appendChild(title)
  playState = true
}

function pauseVideo() {
  player.pauseVideo();
  playState = false
}

function startVideo() {
  player.playVideo();
  playState = true
}

/**
 * 
 * * SOCKET.IO EVENTS
 * 
 **/

socket.on('onlineCount', count => {
  let counter = document.createElement('span')
  counter.textContent = count
  document.getElementById('onlineCount').appendChild(counter)
})

socket.on('state', state => {
  player.seekTo(state.timestamp)
})

socket.on('playback', state => {
  state ? startVideo() : pauseVideo()
})
