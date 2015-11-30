var app =angular.module('MusicPlayer',['ngRoute']);
var ffi = require('ffi');
var path = require('path');
var lame =  require('lame');
var wav = require('wav');
var fs = require('fs');
var pic = 0;
app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'track-list.html',
                    controller: 'track-list'
            })
                .when('/record', {
                    templateUrl: 'record_page.html',
                    controller: 'recordControl'
                });
               
        }]);



var wav_lib = ffi.Library('./test_wrapper', {
            'open' : ['int', ['string']],
            'play' :['int',[]],
            'stop' :['int',[]],
            'seek' :['int',['int']],
            'get_time' :['int',['string']],
            'pause' : ['int', []]
        });
var rec_lib = ffi.Library('./Recorder', {
            'record' : ['int', []],
             'pause' : ['int', []]
        }); 


function myFunction(x)
{
    var decoder = new lame.Decoder();
    function onFormat (format) 
    {
        // write the decoded MP3 data into a WAV file
        var writer = new wav.Writer(format);
        decoder.pipe(writer).pipe(output);
        setTimeout(function(){
           /*wav_lib.open.async('test.wav',function(err,result){
               
               
           });*/
           angular.element(document.getElementById('app_window')).scope().open(x,'test.wav');
        },500);
        
    }
    var input = fs.createReadStream(x);
    var output = fs.createWriteStream('test.wav');// easy playing 
    var arr;
    decoder.on('format', onFormat);
    input.pipe(decoder);
    
}
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({ //authentication details of the sender's mail ID
            service: 'Gmail',
            auth: {
                    user: 'fav.tracklist.waveplayer@gmail.com',
                    pass: 'tn43a4118K!'
                }
});
app.directive("fileread", [function () {
    return {
       
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                    scope.selected_file(scope.fileread);
                });
            });
        }
    }
}]);

function sel(x)
{
  
  if(path.extname(x)=='.mp3')
            {
                var mm = require('musicmetadata');
                var parser = mm(fs.createReadStream(x), function (err, metadata) {
                        if (err) throw err;
                    console.log(metadata);
                    if(pic%2==0)
                        var file_name='logo1.jpeg';
                    else
                        var file_name="logo2.jpeg"
                    fs.writeFile(file_name, metadata.picture[0].data, 'binary', function(err){
                        
                      
                        document.getElementById('albumart').src=file_name;
                    })
                });
                pic++;
                
                myFunction(x);
                return;
            }
  document.getElementById('albumart').src="images/no_album_art_by_gouki113.png";    
  angular.element(document.getElementById('app_window')).scope().open(x);
  
}
function mp3duration(y)
{
    var x = document.createElement("AUDIO");
    x.src = y;
    setTimeout(function(){
        angular.element(document.getElementById('app_window')).scope().update_time_max(x.duration);   
    },1000);
}
function share()
 {
    document.getElementById('share_dialog').style.display="inline";   
 }
 function send_mail()
  {
    var mail_id = document.getElementById('share_user_id').value;  
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if(reg.test(mail_id)==false)
      {
          alert("you`ve entered an invalid mail address!!!");   
          return;
      }
    else
      {
        create_fav_file(mail_id);
      }
            
  }
function move_song()
{
    angular.element(document.getElementById('app_window')).scope().seek();
}


function create_fav_file(mail_id)
{
    var data = "";
    var attachment_wav = [];
    for(i=0;i<arr.length;i++)
        {
            var obj  = {};
            obj.file_name = arr[i].name;
            obj.path = arr[i].path;
            attachment_wav.push(obj);
        }
            console.log(attachment_wav);
      mailOptions = {                     //compose the mail
            from: 'fav.tracklist.waveplayer@gmail.com', // sender address
            to: ''+mail_id+'', // list of receivers
            subject: 'FAV TRACKLIST FROM KAUSHIK', // Subject line
            text: '', // plaintext body
            html: 'Hello,<br>Kaushik has sent his favourite track lists from waveplayer!',
            attachments:attachment_wav
            };    
            transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                    alert('Email Sent Successfully!!');
           });
}
function rem(x)
{
  angular.element(document.getElementById('app_window')).scope().rem(x);
    
}
app.controller('track-list',function($scope,$timeout,$location){
    $scope.showTrack = 0;
    $scope.show_share_dialog = 0;
    $scope.selected_song="";
    $scope.selected_song_name="";
    $scope.time_max;
    $scope.time_str="";
    $scope.timer;
    $scope.current_time = 0;
    $scope.update_time_max = function(x)
    {
        $scope.time_max = x;
        $scope.$apply();
    }
    $scope.process_time = function()
     {
          $('#slider-2').slider( "option", "max",$scope.time_max+1);
          $scope.timer = $timeout(function(){
                    var hours    = parseInt($scope.current_time/60);
                    var minutes  = $scope.current_time%60;
                    if(parseInt(minutes/10)==0)
                    {
                        $scope.time_str = hours+":0"+minutes;
                    }
                    else
                    {
                        $scope.time_str = hours+":"+minutes;
                    }
                    $scope.current_time++;
                    $scope.$apply();
                    $("#slider-2").slider( "option", "value",$scope.current_time);
                    if($scope.current_time<=$scope.time_max)
                    {
                       $scope.process_time();
                    }
                    else
                    {
                        $scope.current_time = 0;
                        $scope.next();
                    }
                    
                },1000);   
              
  
     }
    
    $scope.csv_load_state = function()
       {
         if(fs.existsSync('c:\\song_data.csv'))
           {
                var data = fs.readFileSync('c:\\song_data.csv');
                var str = data.toString();
                var values = str.split(/[,/n]/);
                var obj;
                var sngs = [];
                for(i=0;i<values.length;i=i+3)
                   {
                       obj = {};
                       obj.name = values[i];
                       obj.path = values[i+1];
                       sngs.push(obj);
                   }
                    sngs.pop();
                    return(sngs);   
            }
            return([]);
 
       }
  
   
     $scope.seek = function()
     {
        var selection = $( "#slider-2" ).slider( "value" );
        $scope.current_time=selection;
        if($scope.selected_song=="")
        {
            $("#slider-2").slider( "option", "value",0);
            return;
        }
        $scope.$apply();
        alert(selection);
        wav_lib.seek.async(selection,function(err,result){
        });   
         
     }
     $scope.open = function(x,y)
     {
        if(path.extname(x)=='.mp3'&&y!='test.wav')
            {
                myFunction(x);
                return;
            }
        $scope.current_time = 0;
        if($scope.selected_song!="")
        {
            $scope.pause();
            $scope.selected_song=x;
            for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].path==$scope.selected_song)
                {
                    $scope.selected_song_name = $scope.arr[i].name;   
                }
                
            }
             $scope.$apply();
                if(y!='test.wav')
                {
                    $scope.time_max = wav_lib.get_time($scope.selected_song);
                    wav_lib.open.async($scope.selected_song,function(err,result){
                    });
                }
                else
                {
                    mp3duration(x);
                    $scope.time_max = wav_lib.get_time(y);
                    wav_lib.open.async(y,function(err,result){
                    });
                }
            $scope.process_time();     
            return;
               
            
        }
         $scope.selected_song=x;
         for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].path==$scope.selected_song)
                {
                    $scope.selected_song_name = $scope.arr[i].name;   
                }
                
            }
  
         $scope.$apply();
     

         if(y!='test.wav')
            {
                $scope.time_max = wav_lib.get_time($scope.selected_song);
                wav_lib.open.async($scope.selected_song,function(err,result){
                            });
             }
            else
            {
                mp3duration(x);
                $scope.time_max = wav_lib.get_time(y);
                wav_lib.open.async(y,function(err,result){
                });
                }
         $scope.process_time();   
    
         
     }
     $scope.arr = $scope.csv_load_state();
     if($scope.arr.length>0)
     {
        $scope.showTrack=1;   
         
     }
     arr=$scope.arr;
     $scope.play = function()
     {
        $scope.process_time();
        if($scope.selected_song=="")
        {
            alert('please select a song first!!');   
            return;
        }
        else
        {
            
            wav_lib.play.async(function(err,result){
                 
            });
        }
       
     }
 
     $scope.pause = function()
     {
        $timeout.cancel($scope.timer);
         if($scope.selected_song=="")
            {
                
                return;
            }
         wav_lib.pause();
       
     }
     $scope.record = function()
     {
       $location.path('record');
     }
     $scope.next = function()
     {
      
       for(i=0;i<$scope.arr.length;i++)
        {
            
            if($scope.arr[i].path==$scope.selected_song)
            {
                 if(i==$scope.arr.length-1)
                    {
                        
                        return;
                    }
                $scope.selected_song = $scope.arr[i+1].path;
                $scope.selected_song_name = $scope.arr[i+1].name;
                $scope.pause();
                $scope.current_time = 0; 
                //$scope.time_max = wav_lib.get_time($scope.selected_song);
                $scope.process_time();
                sel($scope.selected_song);
                break;
            }
            
        }
     }
     $scope.prev = function()
     {
      
       for(i=0;i<$scope.arr.length;i++)
        {
            if($scope.arr[i].path==$scope.selected_song)
            {
                  if(i==0)
                    {
                        return;
                    }
                $scope.selected_song = $scope.arr[i-1].path;
                $scope.selected_song_name = $scope.arr[i-1].name;
                $scope.pause();
                $scope.current_time = 0; 
               // $scope.time_max = wav_lib.get_time($scope.selected_song);
                $scope.process_time();
                sel($scope.selected_song);
                break;
            }
            
        }
     }
     $scope.fileName;
       $scope.add = function()
       {
         document.getElementById('FileOpener').click();
       }
       $scope.selected_file = function(x)
       {
            for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].name==x.name)
                {
                    alert('Song Already present in track list!!!');   
                    return;
                }
            }
            console.log(path.extname(x.name));
            if(path.extname(x.name)!='.mp3'&&path.extname(x.name)!=".wav")
            {
                alert('Waveplayer can only play mp3 and .wav files');
                return;
            }
            $scope.arr.push(x);
            $scope.showTrack = 1;
            $scope.csv_save_state();
           
       }
     
       
       $scope.csv_save_state = function()
       {
           $scope.file_data =""; 
           if($scope.arr.length!=0)
            {
                for(i=0;i<$scope.arr.length;i++)
                {
                    $scope.file_data+=$scope.arr[i].name+",";
                    $scope.file_data+=$scope.arr[i].path+"/n";
                }
                console.log($scope.file_data);
                fs.writeFileSync('c:\\song_data.csv',$scope.file_data);
            
            }
           else
           {
                fs.writeFileSync('c:\\song_data.csv',$scope.file_data);
           }
           
           
       }
       $scope.set_song_name = function(x)
       {
           $scope.selected_song = x;
           $scope.$apply();
       }
       $scope.rem = function(x)
       {
           for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].path==x)
                {
                    $scope.arr.splice(i,1);
                    $scope.$apply();
                    $scope.csv_save_state();
                }
                if($scope.arr.length==0)
                {
                   $scope.showTrack = 0;
                    $scope.$apply();
                }
                
            }
        
       }
       $(document).ready(function(){
   
            $( "#slider-2" ).slider({
               value: 0,
               animate:"slow",
               orientation: "horizontal"
            })
       });

    
});
app.controller("recordControl",function($scope,$timeout,$interval){
   $scope.time_max = 999;
   $scope.current_time = 0;
   $scope.recording = 0;
   $scope.record = function()
   {
       if($scope.recording==1)
       {
            alert('Already Recording!!!');
            return;
       }
       $scope.recording = 1; 
       $scope.process_time(); 
        rec_lib.record.async(function(err,result){
         });
       $scope.graphshow  = $interval(function(){
           dispgraph();
       },100);
       
   }
   $scope.pause = function()
   {
       rec_lib.pause();
       $timeout.cancel($scope.timer);
       $interval.cancel($scope.graphshow);
       $scope.recording = 0;
       alert('Audio recording complete!!');
       dispgraph();   
   }
   $(document).ready(function(){
   
            $( "#slider-2" ).slider({
               value: 0,
               animate:"slow",
               orientation: "horizontal"
            })
       });
     $scope.process_time = function()
     {
        
         $('#slider-2').slider( "option", "max",$scope.time_max+1);
          $scope.timer = $timeout(function(){
                    var hours    = parseInt($scope.current_time/60);
                    var minutes  = $scope.current_time%60;
                    if(parseInt(minutes/10)==0)
                    {
                        $scope.time_str = hours+":0"+minutes;
                    }
                    else
                    {
                        $scope.time_str = hours+":"+minutes;
                    }
                    $scope.current_time++;
                    $scope.$apply();
                    $("#slider-2").slider( "option", "value",$scope.current_time);
                    if($scope.current_time<=$scope.time_max)
                    {
                       $scope.process_time();
                    }
                    else
                    {
                        $scope.current_time = 0;
                        $scope.next();
                    }
                    
                },1000);   
     }
    

});
