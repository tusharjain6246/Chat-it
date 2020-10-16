var socket = io();

function scroll(){
  var messages = jQuery('.msg-list');
  var newMessage = messages.children('li:last child');

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();
  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=scrollHeight){
    messages.scrollTop(scrollHeight);
  }
};


socket.on('connect',()=>{
  console.log('connected to server');
  var params = jQuery.deparam(window.location.search);
  socket.emit('join',params,(err)=>{
    if (err) {
      alert(err);
      window.location.href = '/';
    }else {
      console.log('no err ');
    }
  });
  //
  // socket.emit('createMsg',{
  //   from: 'tushar',
  //   text: 'hey how r u'
  // });
});

socket.on('disconnect',()=>{
  console.log('disconnected to server');
});

socket.on('updateList',(users)=>{
  var ol = jQuery('<ol></ol>');
  users.forEach((user) => {
    ol.append(jQuery('<li></li>').text(user));
  });
  jQuery('.users').html(ol);
});

socket.on('newMsg', (msg)=>{
  console.log(`new msg`, msg);

  var formattedTime = moment(msg.createdAt).format('h:mm a');
//2nd way to add in html
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template,{
    text: msg.text,
    from: msg.from,
    createdAt: formattedTime
  });

  jQuery('.msg-list').append(html);
  scroll();
//1 way to add in html
  // var li = jQuery('<li></li>');
  // var span = jQuery('<span></span>');
  // span.text(`${formattedTime}`);
  // li.text(`${msg.from}: ${msg.text}   `);
  // li.append(span);
  // jQuery('.msg-list').append(li);
});

// socket.emit('createMsg', {
//   from: 'tushi',
//   text: 'hey'
// },(data)=>{
//   console.log('got it', data);
// });

socket.on('newLocationMsg',(msg)=>{
  var formattedTime = moment(msg.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template,{
    from: msg.from,
    url: msg.url,
    createdAt: formattedTime
  });

  jQuery('.msg-list').append(html);
  scroll();
  // var span = jQuery('<span></span>');
  // span.text(`${formattedTime}`);
  // var li = jQuery('<li></li>');
  // var a = jQuery('<a target="_blank">my current location</a>');
  // a.attr('href', msg.url);
  // li.text(`${msg.from}`);
  // li.append(a);
  // li.append(span);
  // jQuery('.msg-list').append(li);

});

jQuery('#message-form').on('submit',(e)=>{
  e.preventDefault();

  socket.emit('createMsg',{
    text: jQuery('[name=message]').val()
  }, ()=>{
    jQuery('[name=message]').val('');
  });
});


var createLocation = jQuery('.send-location');
createLocation.on('click',()=>{
  if(!navigator.geolocation)
    return alert('geolocation not suppport');

  createLocation.attr('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position)=>{
    createLocation.removeAttr('disabled');
    socket.emit('createLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  },()=>{
    createLocation.removeAttr('disabled');
    alert('unableto fetch loaction');
  });
})
