package edu.eci.arsw.collabpaint;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    Map<String, List<Point>> points = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        if (points.containsKey(numdibujo)) {
            points.get(numdibujo).add(pt);
        } else {
            points.put(numdibujo, new CopyOnWriteArrayList<>());
            points.get(numdibujo).add(pt);
        }
        System.out.println(points);
        if (points.get(numdibujo).size() >= 3) {
            msgt.convertAndSend("/topic/newpolygon."+numdibujo, points.get(numdibujo));
        }
    }

}

