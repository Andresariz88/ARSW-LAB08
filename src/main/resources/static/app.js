var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var id = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var drawPolygon = function(points) {
        var c = document.getElementById("canvas");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
        for (i = 0; i < points.length; i++) {
            if (i == points.length-1) {
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[0].x, points[0].y);
            } else {
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[i+1].x, points[i+1].y);
            }
        }
        ctx.stroke();
        ctx.closePath();
    };


    var connectAndSubscribe = function (pid) {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        id = pid;
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.'+id, function (eventbody) {
                console.log(eventbody);
                //alert(eventbody.body);
                addPointToCanvas(JSON.parse(eventbody.body));
            });

            stompClient.subscribe('/topic/newpolygon.'+id, function (eventbody) {
                drawPolygon(JSON.parse(eventbody.body));
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            //connectAndSubscribe();

            //canvas click event
            var publish = this.publishPoint;
            can.addEventListener("pointerdown", function(evt){
                if (stompClient !== null) {
                    var point = getMousePosition(evt);
                    publish(point.x, point.y);
                } else {
                    alert("Ingresa un identificador tablero");
                }
                
            });
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/app/newpoint."+id, {}, JSON.stringify(pt));

        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connection : function(id) {
            connectAndSubscribe(id);
        }
    };

})();