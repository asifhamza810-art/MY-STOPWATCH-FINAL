var hourhead = document.getElementById("hours");
var minhead = document.getElementById("min");
var sechead = document.getElementById("sec");
var msechead = document.getElementById("msec");
var hour = 0;
var min = 0;
var sec = 0;
var msec = 0;
var interval;
var target = 0;
function time(){
    msec++;
    msechead.innerHTML = msec;
    if(msec >= 100){
        sec++;
        sechead.innerHTML = sec;
        msec = 0;
   if(sec == target && target > 0){
            alert("MY TARGET DONE");
            stop();
  }

 if(sec >= 60){
            min++;
            minhead.innerHTML = min;
         sec = 0;

            if(min >= 60){
           hour++;
                hourhead.innerHTML = hour;
                min = 0;
            }
     }
   }
}
function start(){
    var btn = document.getElementById("btn");
    if(interval) return; 
    target = document.getElementById("targetnum").value;
    interval = setInterval(time, 10);
    btn.disabled = true;
}
function stop(){
    var btn = document.getElementById("btn");
    clearInterval(interval);
    interval = null;
    btn.disabled = false;
}
function reset(){
    clearInterval(interval);    
    interval = null;    
    var btn = document.getElementById("btn");
    btn.disabled = false;
    hour = 0;
    min = 0;
    sec = 0;
    msec = 0;
    hourhead.innerHTML = hour;
    minhead.innerHTML = min;
    sechead.innerHTML = sec;
    msechead.innerHTML = msec;
    document.getElementById("laps").innerHTML = "";
}
function lap(){
    var lap = hour + ":" + min + ":" + sec + ":" + msec;
    var li = document.createElement("li");
    li.innerHTML = lap;
    document.getElementById("laps").appendChild(li);
}