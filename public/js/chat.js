const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#Send-Location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll = ()=>{
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containarHeight = $messages.scrollHeight
    const scrollOffset = Math.ceil($messages.scrollTop + visibleHeight)
    if(containarHeight - newMessageHight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    /*const element=$messages.lastElementChild
    element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})*/
}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate , {
        username: message.username,
        message: message.text , 
        createdAt: moment(message.createdAt).format("hh : mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

 socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationTemplate , {
        username: message.username,
        url: message.url , 
        createdAt: moment(message.createdAt).format("hh : mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
 })

socket.on('roomData' , ({room , users})=>{
    const html = Mustache.render(sidebarTemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML= html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message was delivered!')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {latitude : position.coords.latitude , longitude: position.coords.longitude},(error)=>{
            $sendLocationButton.removeAttribute('disabled')
            if(error){
                console.log('something went error!')
            }
            console.log('Location was shared!')
    })
   })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }

})
