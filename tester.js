var fs = require('fs');
var data = fs.readFileSync('file.txt');
var arr = data.toString().split('\n');
console.log(arr.length/100);
    function find_time(x)
    {
        var sec = parseInt(x/100);
        var millsec = x%100;
        var mins = parseInt(sec/60);
        sec = sec%60;
        var hrs = parseInt(mins/60);
        mins = mins%60;
        console.log(hrs+":"+mins+":"+sec+"."+millsec);
    }