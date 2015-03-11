<script>
// Let's wrap everything inside a function so variables are not defined as globals  
(function(){  
    // This is gonna our percent buckets ( 25%-75% )
    //Change the variable "divisor" to create different multiples to track smaller %'s like 10% etc.
    var divisor = 25;  
    // We're going to save our players status on this object.  
    var videos_status = {};  
    // This is the funcion that is gonna handle the event sent by the player listeners  
    function eventHandler(e){   
      switch(e.type) {  
          // This event type is sent everytime the player updated it's current time,  
          // We're using for the % of the video played.     
        case 'timeupdate':      
          // Let's set the save the current player's video time in our status object              
          videos_status[e.target.id].current = Math.round(e.target.currentTime);     
          // We just want to send the percent events once     
          var pct = Math.floor(100 * videos_status[e.target.id].current / e.target.duration);            
          for (var j in videos_status[e.target.id]._progress_markers) {
            if (pct >= j && j > videos_status[e.target.id].greatest_marker) {
    			videos_status[e.target.id].greatest_marker = j;
            }
          }
         // current bucket hasn't been already sent to GA?, let's push it to GTM
         if (videos_status[e.target.id].greatest_marker && !videos_status[e.target.id]._progress_markers[videos_status[e.target.id].greatest_marker]) {
             videos_status[e.target.id]._progress_markers[videos_status[e.target.id].greatest_marker] = true;
             dataLayer.push({
                 'event': 'gaEvent',
                 'gaEventCategory': 'HTML5 Video',
                 'gaEventAction': 'Progress_' + videos_status[e.target.id].greatest_marker + '%', 
                 // We are using sanitizing the current video src string, and getting just the video name part
                 'gaEventLabel': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
             });
        }

    break;
    // This event is fired when user's click on the play button
    case 'play':
        dataLayer.push({
            'event': 'gaEvent',
            'gaEventCategory': 'HTML5 Video',
            'gaEventAction': 'Play',
            'gaEventLabel': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
        });

        break;
        // This event is fied when user's click on the pause button
    case 'pause':
        dataLayer.push({
            'event': 'gaEvent',
            'gaEventCategory': 'HTML5 Video',
            'gaEventAction': 'Pause',
            'gaEventLabel': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1]),
            'gaEventValue': videos_status[e.target.id].current
        });
        break;
        // If the user ends playing the video, an Finish video will be pushed ( This equals to % played = 100 )  
    case 'ended':
        dataLayer.push({
            'event': 'gaEvent',
            'gaEventCategory': 'HTML5 Video',
            'gaEventAction': 'Finished',
            'gaEventLabel': decodeURIComponent(e.target.currentSrc.split('/')[e.target.currentSrc.split('/').length - 1])
        });
        break;
    default:
        break;
        }

     }
        // We need to configure the listeners
        // Let's grab all the the "video" objects on the current page     
        var videos = document.getElementsByTagName('video');
        for (var i = 0; i < videos.length; i++) {
            // In order to have some id to reference in our status object, we are adding an id to the video objects
            // that don't have an id attribute. 
            var videoTagId;
            if (!videos[i].getAttribute('id')) {
                // Generate a random alphanumeric string to use is as the id
                videoTagId = 'html5_video_' + Math.random().toString(36).slice(2);
                videos[i].setAttribute('id', videoTagId);
            }
            // Current video has alredy a id attribute, then let's use it :)
            else {
                videoTagId = videos[i].getAttribute('id');
            }

            // Video Status Object declaration  
            videos_status[videoTagId] = {};
            // We'll save the highest percent mark played by the user in the current video.
            videos_status[videoTagId].greatest_marker = 0;
            // Let's set the progress markers, so we can know afterwards which ones have been already sent.
            videos_status[videoTagId]._progress_markers = {};

            for (j = 0; j < 100; j++) {
                videos_status[videoTagId].progress_point = divisor * Math.floor(j / divisor);
                videos_status[videoTagId]._progress_markers[videos_status[videoTagId].progress_point] = false;
            } 
            // On page DOM, all players currentTime is 0     
            videos_status[videoTagId].current = 0;      
            // Now we're setting the event listeners.     
            videos[i].addEventListener("play", eventHandler, false);     
            videos[i].addEventListener("pause", eventHandler, false);     
            videos[i].addEventListener("ended", eventHandler, false);     
            videos[i].addEventListener("timeupdate", eventHandler, false);     
            videos[i].addEventListener("ended", eventHandler, false);
         } 
})();
</script>