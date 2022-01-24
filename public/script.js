const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer();

const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  console.log('working');

  myPeer.on('call', call => {

    console.log('call event emitted')

    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {

      console.log('stream event emitted')

      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close()
    delete peers[userId]
  }
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)

  console.log('calling...');
  console.log(peers);
  
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    console.log('got a remote stream')
    addVideoStream(video, userVideoStream)
  }, error => console.log('Failed to get local stream', error.message));
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
