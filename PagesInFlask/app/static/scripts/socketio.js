var socket = io();
document.addEventListener('DOMContentLoaded', () => {    

    // retrive username
    const username = document.querySelector('#get-username').innerHTML;
    const project_id = parseInt(document.querySelector('#get-project_id').innerHTML);
    //set default room
    let room = document.querySelector("#sidebar > p:nth-child(2)").innerHTML;
    joinRoom(room);

    // Displays incoming messages
    socket.on('message', data => {
        const p = document.createElement('p');
        const span_username = document.createElement('span');
        const span_timestamp = document.createElement('span');
        const br = document.createElement('br');

        if (data.username == username){
            p.setAttribute("class", "my-msg");

            //username
            span_username.setAttribute("class", "my-username")
            span_username.innerText = data.username;

            //timestamp
            span_timestamp.setAttribute("class", "timestamp")
            span_timestamp.innerText = data.time_stamp;

            // HTML to append
            p.innerHTML += span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;
            document.querySelector('#display-message-section').append(p);
        }
         // Display other users' messages
         else if (typeof data.username !== 'undefined') {
            p.setAttribute("class", "others-msg");

            // Username
            span_username.setAttribute("class", "other-username");
            span_username.innerText = data.username;

            // Timestamp
            span_timestamp.setAttribute("class", "timestamp");
            span_timestamp.innerText = data.time_stamp;

            // HTML to append
            p.innerHTML += span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML;

            //Append
            document.querySelector('#display-message-section').append(p);
        }
        // Display system message


        else {
            printSysMsg(data.msg);
        }

    });

    // Send message
    document.querySelector('#send_message').onclick = () => {
        socket.send({'msg': document.querySelector('#user_message').value,
            'username': username, 'room': room , project_id:project_id});

        // Clear input area
        document.querySelector('#user_message').value = '';
    }

    document.querySelectorAll('.select-room').forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML;
            if (newRoom == room) {
                msg = `You are already in ${room} room.`
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
            }
        }
    });

    // Leave room
    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});
    }

    // Join room
    function joinRoom(room) {
        socket.emit('join', {'username': username, 'room': room , project_id:project_id})

        // Clear message area
        document.querySelector('#display-message-section').innerHTML = ''

        //autofocus on textbox
        document.querySelector('#user_message').focus()


    }

    // Print System Message

    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.innerHTML = msg;
        document.querySelector('#display-message-section').append(p);
    }

    /* socket.on('cardDragStart', data => {
        id = data;        
    }) */

})

socket.on('cardDragging', data  => {        
    var element = document.getElementById(data);
    element.style.opacity = 0.2;
})

socket.on('cardDrop', data => {        
    var element = document.getElementById(data.id);
    element.style.opacity = 1.0;
    document.getElementById(data.parent).append(element);
    
})

socket.on('cardClick', data => {
    ele_id = data['id'];
    new_text = data['json'];
    new_text = String(new_text);
    var element = document.getElementById(ele_id);
    element.innerText = new_text;
})

socket.on('cardDelete', json => {
    ele_id = "card_"+String(json["card_id"])
    var element = document.getElementById(ele_id);
    element.remove();
})


socket.on('cardPriority', json => {
    ele_id = "card_"+String(json["card_id"])
    var element = document.getElementById(ele_id);
    element.style.color = json['priority'];
})

socket.on('cardCreate', json => {
    if (json['project_id'] == project_id){
        ele_id = "card_"+String(json["card_id"])
        element = document.createElement("div");
        element.classList="list-item";
        element.draggable="true";
        element.id=ele_id;
        element.innerText = json['title'];
        element.setAttribute("priority", json['priority']);
        element.addEventListener('dragstart', function(){
            draggedItem = element;
            setTimeout(function () {
                socket.emit('cardDragStart', element.id);            
            }, 0);
        });

        element.addEventListener('dragend', function () {
            setTimeout(function () {                        
                //draggedItem = null;
            }, 0);
        });
        
        element.addEventListener('click', function() {
            card_id = element.id;
            card_id = parseInt(card_id.replace("card_",""));

            socket.emit('cardClick', {'id':card_id, 'displayed':element.innerText});
        });
        console.log(element)
        document.querySelector("#backlog_1").appendChild(element);
    }
    
})

socket.on('sprintCreate', json => {
    project_id = parseInt(document.querySelector('#get-project_id').innerHTML);
    if (json['project_id'] == project_id){
        nav =  document.querySelector("#board > div > ul");
        newSprint = document.createElement("li");
        newSprint.className = "nav-item";
        string1 = '<a class = "nav-link" href="#sprint_"'+json['sprint_id']+' data-toggle="tab" >Sprint '+json['sprint_id']+'</a></li>'
        newSprint.innerHTML = string1;

        if (newSprint.innerText != document.querySelector("#board > div > ul").lastElementChild.previousElementSibling.innerText){
            nav.insertBefore(newSprint,document.querySelector("#board > div > ul").lastElementChild);
            $('.tab-content').append(
                '<div class="tab-pane" id="sprint_' + json['sprint_id'] + '">' +
                    '<div class = "lists">' +
                        '<div class = "list" for="In Progress" id=ip_' + json['sprint_id'] + '>' +
                            '<h4 style="text-align:center">In Progress</h4>' +
                        '</div>' +
                        '<div class = "list" for="done" id=done_' + json['sprint_id'] + '>' +
                            '<h4 style="text-align:center">Done</h4>' +
                        '</div>' +
                    '</div>' +
                '</div>');
            }
        }
        $(".nav-tabs").on("click", "a", function (e) {
            e.preventDefault();
            if (!$(this).hasClass('add-contact')) {
                $(this).tab('show');
            }
        })
        .on("click", "span", function () {
            var anchor = $(this).siblings('a');
            $(anchor.attr('href')).remove();
            $(this).parent().remove();
            $(".nav-tabs li").children('a').first().click();
        });
        
        const list_items = document.querySelectorAll('.list-item');
        const lists = document.querySelectorAll('.list');

        let draggedItem = null;
        for (let i = 0; i<list_items.length; i++){
            const item = list_items[i];

            item.addEventListener('dragstart', function(){
                draggedItem = item;
                setTimeout(function () {
                    socket.emit('cardDragStart', item.id);            
                }, 0);
            });

            item.addEventListener('dragend', function () {
                setTimeout(function () {                        
                    //draggedItem = null;
                }, 0);
            });
            
            item.addEventListener('click', function() {
                card_id = item.id;
                card_id = parseInt(card_id.replace("card_",""));

                socket.emit('cardClick', {'id':card_id, 'displayed':item.innerText});
            });

            for (let j = 0; j < lists.length; j++){
                const list = lists[j];
                list.addEventListener('dragover', function (e) {
                    e.preventDefault();
                });
                list.addEventListener('dragenter', function (e) {
                    e.preventDefault();
                    this.style.backgroundColor = '#d2d6d6';
                });
                list.addEventListener('dragleave', function (e){
                    this.style.backgroundColor = '#eaeded';
                });
                list.addEventListener('drop', function (e) {
                    let element = this;          
                    let newSprint = element.id.split("_"); /* default to the backlog */
                    let status = 'backlog';
                    let stReg = /ip/;
                    if(stReg.test(element.id)){
                        status = 'incomplete';   /* Reg expressions to identify the new status */
                    }
                    stReg = /done/;
                    if(stReg.test(element.id)){
                        status = 'complete';
                    }
                    this.append(draggedItem);
                    this.style.backgroundColor = '#eaeded';
                    socket.emit('cardDrop', { 'id': draggedItem.id, 'parent':element.id,
                    'status':status, "newSprint": newSprint[1]});
                });
            }
        }
    });



/**
   * Actions For Each ContextMenu Option
   */
  function menuItemListener( link ) {
    console.log( "Card ID - " + CardInContext.getAttribute("data-id") + ", Card action - " + link.getAttribute("data-action"));
    console.log(CardInContext)
    project_id = parseInt(document.querySelector('#get-project_id').innerHTML);
    username = document.querySelector('#get-username').innerHTML;
    if (link.getAttribute('data-action') == 'Edit'){
        
        CardInContext.addAttribute
        
        
        card_id = CardInContext.id;
        card_id = parseInt(card_id.replace("card_",""));
        console.log(card_id)
        socket.emit('cardEdit', project_id,username,card_id);
    }
    else if (link.getAttribute('data-action') == 'Delete'){
        card_id = CardInContext.id;
        card_id = parseInt(card_id.replace("card_",""));
        console.log(card_id)
        socket.emit('cardDelete', {'card_id':card_id});
    }
    else if(link.getAttribute('data-action') == 'Set Priority'){
        card_id = CardInContext.id;
        card_id = parseInt(card_id.replace("card_",""));
        console.log(card_id)
        socket.emit('cardPriority', {'card_id':card_id});
    }
    else{}
    
    toggleMenuOff();
  }


// Context Menu Setup Below
function clickInsideElement( e, className ) {
    var el = e.srcElement || e.target;
    
    if ( el.classList.contains(className) ) {
      return el;
    } else {
      while ( el = el.parentNode ) {
        if ( el.classList && el.classList.contains(className) ) {
          return el;
        }
      }
    }

    return false;
  }

  var contextMenuLinkClassName = "context-menu__link";
  var contextMenuActive = "context-menu--active";

  var taskItemClassName = "list-item";
  var CardInContext;

  var menu = document.querySelector("#context-menu");
  var menuItems = menu.querySelectorAll(".context-menu__item");
  var menuState = 0;

  function init() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();
  }

  /**
   * Listens for contextmenu events.
   */
  function contextListener() {
    document.addEventListener( "contextmenu", function(e) {
      CardInContext = clickInsideElement( e, taskItemClassName );
      if ( CardInContext ) {
        positionX = CardInContext.getBoundingClientRect().right;
        positionY = CardInContext.getBoundingClientRect().y;
        e.preventDefault();
        toggleMenuOn();
        positionMenu(positionX,positionY);
      } else {
        CardInContext = null;
        toggleMenuOff();
      }
    });
  }

  function clickListener() {
    document.addEventListener( "click", function(e) {
      var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

      if ( clickeElIsLink ) {
        e.preventDefault();
        menuItemListener( clickeElIsLink );
      } else {
        var button = e.which || e.button;
        if ( button === 1 ) {
          toggleMenuOff();
        }
      }
    });
  }

  function keyupListener() {
    window.onkeyup = function(e) {
      if ( e.keyCode === 27 ) {
        toggleMenuOff();
      }
    }
  }
  function resizeListener() {
    window.onresize = function(e) {
      toggleMenuOff();
    };
  }

  function toggleMenuOn() {
    if ( menuState !== 1 ) {
      menuState = 1;
      menu.classList.add( contextMenuActive );
    }
  }

  function toggleMenuOff() {
    if ( menuState !== 0 ) {
      menuState = 0;
      menu.classList.remove( contextMenuActive );
    }
  }
  
  function positionMenu(x,y) { 
    menu.style.left = String(x)+"px";
    menu.style.top = String(y-100)+"px";
  }

  init();

  